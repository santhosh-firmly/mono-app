# D1 Database Schema

The Firmly Dashboard uses Cloudflare D1 (SQLite) for relational data that requires cross-user or cross-merchant queryability.

## Design Philosophy

D1 serves as a **minimal index layer** alongside Durable Objects:

| Data Location | Purpose | Examples |
|---------------|---------|----------|
| **D1** | Cross-entity queries, admin operations | User lookup by email, list all merchants |
| **Durable Objects** | Per-entity data, real-time operations | User profile, sessions, merchant team |

This hybrid approach provides:
- Fast per-entity access via Durable Objects
- SQL queryability for admin operations via D1
- Data consistency through dual-write patterns

## Databases

| Database | Binding | Purpose |
|----------|---------|---------|
| `dashUsers` | D1 | User and merchant dashboard index |
| `reporting` | D1 | Order data and analytics |
| `firmlyConfigs` | D1 | App configurations |

## Tables

### users

Minimal user index for email lookups and admin operations.

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,                    -- UUID, matches DashUserDO name
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | User UUID (primary key, DO identifier) |
| `email` | TEXT | Unique email address |
| `created_at` | TEXT | Account creation timestamp |
| `last_login_at` | TEXT | Last login timestamp |

**Why minimal?** Full user data (profile, sessions, preferences) lives in DashUserDO for:
- Fast per-user access without database queries
- Transactional updates within user context
- Global edge availability

**Usage:**
```javascript
// Check if user exists by email
const user = await db
  .prepare('SELECT id, email FROM users WHERE email = ?')
  .bind(email)
  .first();

// Create user entry (done alongside DashUserDO initialization)
await db
  .prepare('INSERT INTO users (id, email) VALUES (?, ?)')
  .bind(userId, email)
  .run();
```

---

### merchant_dashboards

Tracks merchant dashboards created by Firmly admins.

```sql
CREATE TABLE IF NOT EXISTS merchant_dashboards (
  domain TEXT PRIMARY KEY,                    -- Merchant domain (e.g., "acme.com")
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT,                            -- Admin user ID who created it
  owner_email TEXT,                           -- Email of the first owner (from invite)
  owner_user_id TEXT,                         -- User ID of owner (populated after invite acceptance)
  status TEXT DEFAULT 'pending',              -- pending, active, suspended
  notes TEXT                                  -- Admin notes
);

CREATE INDEX IF NOT EXISTS idx_merchant_dashboards_status ON merchant_dashboards(status);
CREATE INDEX IF NOT EXISTS idx_merchant_dashboards_created_at ON merchant_dashboards(created_at);
```

| Column | Type | Description |
|--------|------|-------------|
| `domain` | TEXT | Merchant domain (primary key) |
| `created_at` | TEXT | Dashboard creation timestamp |
| `created_by` | TEXT | Admin Azure AD user ID |
| `owner_email` | TEXT | Invited owner's email |
| `owner_user_id` | TEXT | Owner's user ID (after invite accepted) |
| `status` | TEXT | `pending`, `active`, `suspended` |
| `notes` | TEXT | Admin notes |

**Status Lifecycle:**
```mermaid
flowchart LR
    A[pending] -->|Owner accepts invite| B[active]
    B -->|Admin action| C[suspended]
    C -->|Admin action| B
```

**Usage:**
```javascript
// List all dashboards for admin
const { results } = await db
  .prepare(`
    SELECT domain, created_at, owner_email, status
    FROM merchant_dashboards
    ORDER BY created_at DESC
  `)
  .all();

// Activate dashboard after invite acceptance
await db
  .prepare(`
    UPDATE merchant_dashboards
    SET owner_user_id = ?, status = 'active'
    WHERE domain = ? AND owner_user_id IS NULL
  `)
  .bind(userId, domain)
  .run();
```

---

### merchant_team

Tracks team membership for each merchant dashboard.

```sql
CREATE TABLE IF NOT EXISTS merchant_team (
  merchant_domain TEXT NOT NULL,              -- Merchant domain
  user_id TEXT NOT NULL,                      -- User UUID
  user_email TEXT NOT NULL,                   -- User email (denormalized)
  role TEXT NOT NULL DEFAULT 'viewer',        -- owner, editor, viewer
  granted_at TEXT DEFAULT (datetime('now')),
  granted_by TEXT,                            -- User ID who granted access
  PRIMARY KEY (merchant_domain, user_id)
);

CREATE INDEX IF NOT EXISTS idx_merchant_team_domain ON merchant_team(merchant_domain);
CREATE INDEX IF NOT EXISTS idx_merchant_team_user ON merchant_team(user_id);
```

| Column | Type | Description |
|--------|------|-------------|
| `merchant_domain` | TEXT | Merchant domain (composite PK) |
| `user_id` | TEXT | User UUID (composite PK) |
| `user_email` | TEXT | Denormalized email for display |
| `role` | TEXT | `owner`, `editor`, `viewer` |
| `granted_at` | TEXT | Access grant timestamp |
| `granted_by` | TEXT | User ID who granted (null for signup) |

**Why denormalize email?** Avoids JOIN for common display operations.

**Data Mirroring:**
This table mirrors data in:
- `DashUserDO.merchant_access` - user's perspective
- `MerchantDO.team` - merchant's perspective

All three are updated together for consistency.

**Usage:**
```javascript
// Get all team members for a merchant
const { results } = await db
  .prepare(`
    SELECT user_id, user_email, role, granted_at
    FROM merchant_team
    WHERE merchant_domain = ?
    ORDER BY granted_at ASC
  `)
  .bind(domain)
  .all();

// Get all merchants a user has access to
const { results } = await db
  .prepare(`
    SELECT merchant_domain, role
    FROM merchant_team
    WHERE user_id = ?
  `)
  .bind(userId)
  .all();
```

---

## Reporting Database

The `reporting` database contains order data:

### orders

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,                      -- Merchant domain
  app_id TEXT NOT NULL,                       -- Destination identifier
  platform_order_number TEXT,
  order_total REAL,
  currency TEXT,
  status TEXT,
  created_dt TEXT,
  order_info TEXT                             -- JSON blob with full order data
);

CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_created ON orders(created_dt);
```

**Security:** All queries MUST filter by `shop_id` to prevent cross-merchant data access.

---

## Configs Database

The `firmlyConfigs` database contains application configuration:

### app_identifiers

```sql
CREATE TABLE app_identifiers (
  key TEXT PRIMARY KEY,                       -- Destination ID (e.g., "amazon")
  info TEXT                                   -- JSON with destination details
);
```

---

## Migration Files

Located in `packages/dash/migrations/`:

| File | Purpose |
|------|---------|
| `0001_users.sql` | Create users table |
| `0002_merchant_dashboards.sql` | Create merchant_dashboards table |
| `0003_merchant_team.sql` | Create merchant_team table |
| `0004_merchant_info.sql` | Additional merchant fields |

Run migrations via Wrangler:
```bash
npx wrangler d1 migrations apply dashUsers
```

## Query Patterns

### User Lookup by Email

```javascript
async function getUserIdByEmail({ platform, email }) {
  const user = await platform.env.dashUsers
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();

  return user ? { userId: user.id } : null;
}
```

### Merchant Dashboard List (Admin)

```javascript
async function listDashboards({ platform }) {
  const { results } = await platform.env.dashUsers
    .prepare(`
      SELECT domain, created_at, owner_email, status
      FROM merchant_dashboards
      ORDER BY created_at DESC
    `)
    .all();

  return results;
}
```

### User's Merchants

```javascript
async function getUserMerchants({ platform, userId }) {
  const { results } = await platform.env.dashUsers
    .prepare(`
      SELECT merchant_domain, role
      FROM merchant_team
      WHERE user_id = ?
    `)
    .bind(userId)
    .all();

  return results;
}
```

## Consistency Patterns

### Dual-Write Pattern

When granting merchant access:

```javascript
// 1. Update D1 (queryable index)
await db.prepare(`
  INSERT INTO merchant_team (merchant_domain, user_id, user_email, role)
  VALUES (?, ?, ?, ?)
`).bind(domain, userId, email, role).run();

// 2. Update DashUserDO (user's view)
const userDO = getUserDO(platform, userId);
await userDO.fetch('/merchant-access', {
  method: 'POST',
  body: JSON.stringify({ merchantDomain: domain, role })
});

// 3. Update MerchantDO (merchant's view)
const merchantDO = getMerchantDO(platform, domain);
await merchantDO.fetch('/team', {
  method: 'POST',
  body: JSON.stringify({ userId, userEmail: email, role })
});
```

## Related Documentation

- [Durable Objects](./durable-objects.md) - DO schemas
- [Storage Architecture](../architecture/storage.md) - Design decisions
- [API Reference](../api/README.md) - How APIs use storage
