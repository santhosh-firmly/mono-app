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

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | User UUID (primary key, matches DashUserDO name) |
| `email` | TEXT | Unique email address |
| `created_at` | TEXT | Account creation timestamp |
| `last_login_at` | TEXT | Last login timestamp |

**Why minimal?** Full user data (profile, sessions, preferences) lives in DashUserDO for:
- Fast per-user access without database queries
- Transactional updates within user context
- Global edge availability

**Primary use cases:**
- Look up user by email to find their UUID
- Create user entry alongside DashUserDO initialization

---

### merchant_dashboards

Tracks merchant dashboards created by Firmly admins.

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

**Primary use cases:**
- List all dashboards for admin view
- Check dashboard status before operations
- Activate dashboard after invite acceptance

---

### merchant_team

Tracks team membership for each merchant dashboard.

| Column | Type | Description |
|--------|------|-------------|
| `merchant_domain` | TEXT | Merchant domain (composite PK) |
| `user_id` | TEXT | User UUID (composite PK) |
| `user_email` | TEXT | Denormalized email for display |
| `role` | TEXT | `owner`, `editor`, `viewer` |
| `granted_at` | TEXT | Access grant timestamp |
| `granted_by` | TEXT | User ID who granted (null for signup) |

**Why denormalize email?** Avoids JOIN for common display operations.

**Data Mirroring:** This table mirrors data in:
- `DashUserDO.merchant_access` - user's perspective
- `MerchantDO.team` - merchant's perspective

All three are updated together for consistency.

**Primary use cases:**
- Get all team members for a merchant
- Get all merchants a user has access to
- Admin queries across all merchants

---

## Reporting Database

The `reporting` database contains order data.

### orders

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Order ID (primary key) |
| `shop_id` | TEXT | Merchant domain |
| `app_id` | TEXT | Destination identifier |
| `platform_order_number` | TEXT | External order number |
| `order_total` | REAL | Order total amount |
| `currency` | TEXT | Currency code |
| `status` | TEXT | Order status |
| `created_dt` | TEXT | Order creation timestamp |
| `order_info` | TEXT | JSON blob with full order data |

**Security:** All queries MUST filter by `shop_id` to prevent cross-merchant data access.

---

## Configs Database

The `firmlyConfigs` database contains application configuration.

### app_identifiers

| Column | Type | Description |
|--------|------|-------------|
| `key` | TEXT | Destination ID (primary key) |
| `info` | TEXT | JSON with destination details |

---

## Migration Files

Located in `packages/dash/migrations/`:

| File | Purpose |
|------|---------|
| `0001_users.sql` | Create users table |
| `0002_merchant_dashboards.sql` | Create merchant_dashboards table |
| `0003_merchant_team.sql` | Create merchant_team table |
| `0004_merchant_info.sql` | Additional merchant fields |

Run migrations via Wrangler: `npx wrangler d1 migrations apply dashUsers`

## Consistency Patterns

### Dual-Write Pattern

When granting merchant access, data is written to three locations:

1. **D1** `merchant_team` - Queryable index for admin operations
2. **DashUserDO** `merchant_access` - User's view of their merchants
3. **MerchantDO** `team` - Merchant's view of their team

All three writes happen atomically within the same request to maintain consistency.

## Related Documentation

- [Durable Objects](./durable-objects.md) - DO schemas
- [Storage Architecture](../architecture/storage.md) - Design decisions
