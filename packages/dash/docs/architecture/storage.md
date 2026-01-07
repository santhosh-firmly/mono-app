# Storage Architecture

The dashboard uses a hybrid storage approach optimized for different access patterns.

## Storage Overview

| Storage | Data | Access Pattern | TTL |
|---------|------|----------------|-----|
| **D1** | User index, merchant data | Global queries, admin operations | Permanent |
| **DashUserDO** | Profile, sessions, access control | Per-user isolation | Permanent |
| **MerchantDO** | Team, audit logs, integration status | Per-merchant | Permanent |
| **KV** | OTP codes, magic links, invites | Short-lived tokens | 5 min - 7 days |
| **R2** | Avatar images | Static files | Permanent |

## Architecture Diagram

```mermaid
graph TB
    subgraph "dash (SvelteKit)"
        D1["D1<br/>━━━━━━━━━<br/>users<br/>merchant_dashboards<br/>merchant_team"]
        KV["KV (OTP_STORE)<br/>━━━━━━━━━<br/>otp:{email}<br/>magic:{token}<br/>invite:{token}"]
        R2["R2 (AVATARS)<br/>━━━━━━━━━<br/>user avatars"]
    end

    subgraph "dash-do (Worker)"
        DashUserDO["DashUserDO<br/>━━━━━━━━━<br/>profile<br/>sessions<br/>merchant_access<br/>preferences"]
        MerchantDO["MerchantDO<br/>━━━━━━━━━<br/>team<br/>audit_logs<br/>integration_steps<br/>agreement"]
    end

    dash -->|Service Binding| dash-do
```

## D1 Database

D1 stores data that needs to be queried globally (across users/merchants).

### Why D1?

- **Admin queries**: List all users, all merchants
- **Existence checks**: Does user with email exist?
- **Analytics**: User growth, login frequency
- **Search**: Find merchants by domain

### Tables

See [D1 Schema](../database/d1-schema.md) for full schema.

| Table | Purpose |
|-------|---------|
| `users` | User index (email, timestamps) |
| `merchant_dashboards` | Admin-created dashboards |
| `merchant_team` | Denormalized team for fast queries |

### D1 Bindings

```jsonc
// wrangler.jsonc
{
  "d1_databases": [
    { "binding": "firmlyConfigs", "database_name": "firmly-configs" },
    { "binding": "reporting", "database_name": "reporting" },
    { "binding": "dashUsers", "database_name": "dash-users" }
  ]
}
```

## Durable Objects

Durable Objects provide per-entity isolation with colocated compute and storage.

### Why Durable Objects?

1. **Per-user isolation** - Each user has dedicated compute + storage
2. **Zero latency** - Data colocated with processing logic
3. **Strong consistency** - No eventual consistency issues
4. **Scalability** - One DO per user/merchant, scales naturally
5. **Future-ready** - WebSocket support, real-time features

### DashUserDO

Each user has one DashUserDO instance identified by their UUID.

**Data stored**:
- Profile (name, company, avatar)
- Active sessions (devices)
- Merchant access (which dashboards, roles)
- Destination access
- User preferences

See [DashUserDO Schema](../database/durable-objects.md#dashuserdoschema) for details.

### MerchantDO

Each merchant has one MerchantDO instance identified by domain.

**Data stored**:
- Team members
- Audit logs
- Integration steps
- Agreement status
- Onboarding progress

### Service Binding Communication

```javascript
// In dash: Call dash-do via service binding
async function fetchDashDO(platform, userId, path, options = {}) {
  const DASH_DO = platform.env.DASH_DO;
  const headers = new Headers(options.headers || {});
  headers.set('X-User-ID', userId);  // Routes to correct DO

  return DASH_DO.fetch(new Request(`https://dash-do${path}`, {
    ...options,
    headers
  }));
}

// Example: Get user profile
const response = await fetchDashDO(platform, userId, '/profile');
const profile = await response.json();
```

```javascript
// In dash-do: Route to user's DO
const userId = request.headers.get('X-User-ID');
const doId = env.DASH_USER_DO.idFromName(userId);
const stub = env.DASH_USER_DO.get(doId);
return stub.fetch(request);
```

## KV Store

KV stores short-lived authentication tokens with automatic expiration.

### Why KV?

- **Built-in TTL** - Tokens auto-expire, no cleanup needed
- **Global availability** - Low-latency reads worldwide
- **Simple key-value** - Perfect for token storage

### Token Types

| Key Pattern | Value | TTL | Purpose |
|-------------|-------|-----|---------|
| `otp:{email}` | `{ code, attempts }` | 5 min | OTP verification |
| `magic:{token}` | `{ email, domain }` | 15 min | Magic link login |
| `invite:{token}` | `{ email, merchantDomain, role, ... }` | 7 days | Team invites |
| `invite-domain:{domain}` | `token` | 7 days | Track pending invites |

### KV Binding

```jsonc
// wrangler.jsonc
{
  "kv_namespaces": [
    { "binding": "OTP_STORE", "id": "..." }
  ]
}
```

## R2 Storage

R2 stores user avatar images.

### R2 Binding

```jsonc
// wrangler.jsonc
{
  "r2_buckets": [
    { "binding": "AVATARS", "bucket_name": "dash-avatars-dev" }
  ]
}
```

## Dual-Write Pattern

Some data is written to both D1 and Durable Objects for different access patterns.

### Example: Team Members

```mermaid
sequenceDiagram
    participant API as API Handler
    participant D1 as D1 (merchant_team)
    participant MDO as MerchantDO
    participant UDO as DashUserDO

    API->>D1: INSERT into merchant_team
    API->>MDO: Add to team table
    API->>UDO: Add merchant_access
    Note over D1,UDO: All three updated atomically
```

**Why dual-write?**
- **D1**: Admin can query all team members across merchants
- **MerchantDO**: Fast merchant-specific team queries
- **DashUserDO**: User sees their own dashboard access

## Storage Decision Matrix

| Need | Use | Reason |
|------|-----|--------|
| Query across all users | D1 | Global queries |
| User's own data | DashUserDO | Per-user isolation |
| Merchant-specific data | MerchantDO | Per-merchant isolation |
| Short-lived tokens | KV | Built-in TTL |
| User files | R2 | Object storage |
| Real-time updates | Durable Objects | WebSocket support |

## Related Documentation

- [Architecture Overview](./overview.md)
- [D1 Schema](../database/d1-schema.md)
- [Durable Objects Schema](../database/durable-objects.md)
- [JWT Sessions](../authentication/jwt-sessions.md)
