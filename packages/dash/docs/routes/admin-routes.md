# Admin Routes

Admin routes are accessible only to Firmly employees authenticated via Azure AD SSO.

## Route Group: `(firmly-user-only)`

All admin routes are under the `(firmly-user-only)` route group, requiring Azure AD authentication.

## Admin Dashboard (`/admin`)

### Pages

| Route | Description | File |
|-------|-------------|------|
| `/admin` | Dashboard home with analytics | `admin/(dashboard)/+page.svelte` |
| `/admin/dashboards` | Manage merchant dashboards | `admin/dashboards/+page.svelte` |
| `/admin/merchants` | List all merchants | `admin/merchants/+page.svelte` |
| `/admin/merchants/[domain]` | View merchant details | `admin/merchants/[domain]/+page.svelte` |
| `/admin/merchants/[domain]/edit` | Edit merchant settings | `admin/merchants/[domain]/edit/+page.svelte` |
| `/admin/merchants/[domain]/products` | Manage products | `admin/merchants/[domain]/products/+page.svelte` |
| `/admin/orders` | View all orders | `admin/orders/+page.svelte` |
| `/admin/orders/[order_id]` | Order details | `admin/orders/[order_id]/+page.svelte` |
| `/admin/dropin` | Drop-in widget testing | `admin/dropin/+page.svelte` |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/api/dashboards` | POST | Create merchant dashboard |
| `/admin/api/invites/send` | POST | Send dashboard invite |
| `/admin/api/invites/cancel` | POST | Cancel pending invite |
| `/admin/merchants/[domain]/api/integration` | POST | Update integration status |

## Authentication Routes (`/auth`)

| Route | Description |
|-------|-------------|
| `/auth/sign-in` | Redirect to Azure AD login |
| `/auth/callback` | OAuth callback handler |
| `/auth/logout` | Sign out of admin session |

## Admin Home (`/admin`)

The admin home page shows:
- Order statistics and charts
- Recent orders table
- Quick links to common actions

```javascript
// routes/(firmly-user-only)/admin/(dashboard)/+page.server.js
export async function load({ platform }) {
  // Fetch reporting data
  const stats = await platform.env.reporting
    .prepare('SELECT COUNT(*) as total FROM orders')
    .first();

  return { stats };
}
```

## Dashboards Management (`/admin/dashboards`)

Manage all merchant dashboards:
- View all dashboards with status
- Create new dashboards
- Send/cancel invites
- View team sizes

```javascript
// routes/(firmly-user-only)/admin/dashboards/+page.server.js
export async function load({ platform }) {
  const dashboards = await platform.env.dashUsers
    .prepare(`
      SELECT d.*, COUNT(t.user_id) as team_size
      FROM merchant_dashboards d
      LEFT JOIN merchant_team t ON d.domain = t.merchant_domain
      GROUP BY d.domain
      ORDER BY d.created_at DESC
    `)
    .all();

  return { dashboards: dashboards.results };
}
```

### Create Dashboard

```javascript
// routes/(firmly-user-only)/admin/api/dashboards/+server.js
export async function POST({ request, platform, locals }) {
  const { domain, notes } = await request.json();

  await platform.env.dashUsers
    .prepare(`
      INSERT INTO merchant_dashboards (domain, created_at, created_by, status, notes)
      VALUES (?, datetime('now'), ?, 'pending', ?)
    `)
    .bind(domain, locals.authInfo.oid, notes)
    .run();

  return json({ success: true });
}
```

### Send Invite

```javascript
// routes/(firmly-user-only)/admin/api/invites/send/+server.js
export async function POST({ request, platform, locals, url }) {
  const { email, merchantDomain, role } = await request.json();

  // Generate token
  const token = crypto.randomUUID();

  // Store in KV
  await platform.env.OTP_STORE.put(
    `invite:${token}`,
    JSON.stringify({
      email,
      merchantDomain,
      role,
      invitedBy: locals.authInfo.oid,
      invitedByEmail: locals.authInfo.email,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    }),
    { expirationTtl: 7 * 24 * 60 * 60 }
  );

  // Send email
  await sendInviteEmail({
    email,
    merchantDomain,
    role,
    inviteUrl: `${url.origin}/invite?token=${token}`,
    invitedByEmail: locals.authInfo.email
  }, platform.env.MAILERSEND_API_KEY);

  return json({ success: true });
}
```

## Merchants Management (`/admin/merchants`)

### List Merchants

Shows all merchants from `firmlyConfigs` database:
- Domain/name
- Status
- Product count
- Quick actions

```javascript
// routes/(firmly-user-only)/admin/merchants/+page.server.js
export async function load({ platform }) {
  const merchants = await platform.env.firmlyConfigs
    .prepare('SELECT key as domain, info FROM domains_merchant')
    .all();

  return {
    merchants: merchants.results.map(m => ({
      domain: m.domain,
      ...JSON.parse(m.info || '{}')
    }))
  };
}
```

### Merchant Details (`/admin/merchants/[domain]`)

View specific merchant:
- Basic info
- Product list
- Order history
- Integration status

### Edit Merchant (`/admin/merchants/[domain]/edit`)

Edit merchant settings:
- General settings
- Presentation settings
- Advanced settings

## Orders Management (`/admin/orders`)

View all orders across merchants:
- Filterable by merchant, status, date
- Search by order ID
- Sortable columns

```javascript
// routes/(firmly-user-only)/admin/orders/+page.server.js
export async function load({ platform, url }) {
  const page = Number(url.searchParams.get('page') || 1);
  const limit = 50;
  const offset = (page - 1) * limit;

  const orders = await platform.env.reporting
    .prepare(`
      SELECT * FROM orders
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `)
    .bind(limit, offset)
    .all();

  return { orders: orders.results };
}
```

## Layout Structure

```javascript
// routes/(firmly-user-only)/admin/+layout.server.js
export async function load({ platform }) {
  // Load merchant list for sidebar/dropdown
  const merchants = await platform.env.firmlyConfigs
    .prepare('SELECT key as domain FROM domains_merchant')
    .all();

  return { merchants: merchants.results };
}
```

```svelte
<!-- routes/(firmly-user-only)/admin/+layout.svelte -->
<script>
  let { data, children } = $props();
</script>

<div class="admin-layout">
  <nav class="sidebar">
    <a href="/admin">Dashboard</a>
    <a href="/admin/dashboards">Dashboards</a>
    <a href="/admin/merchants">Merchants</a>
    <a href="/admin/orders">Orders</a>
  </nav>

  <main>
    {@render children()}
  </main>
</div>
```

## Authorization

Admin routes check Azure AD auth in `hooks.server.js`:

```javascript
async function handleAdminAuth(event, resolve) {
  const jwt = cookies.get(platform?.env?.FIRMLY_AUTH_COOKIE);

  try {
    event.locals.authInfo = (
      await enforceSSOAuth(jwt, {
        azureTenantId: platform?.env?.PUBLIC_AZURE_AD_TENANT_ID,
        azureClientId: platform?.env?.PUBLIC_AZURE_AD_CLIENT_ID
      })
    ).authInfo;

    return resolve(event);
  } catch {
    redirect(302, '/auth/sign-in');
  }
}
```

## Admin Info in Locals

After Azure AD auth, admin info is available:

```typescript
interface AuthInfo {
  oid: string;              // Object ID
  email: string;            // Email address
  preferred_username: string;
  name: string;
  tid: string;              // Tenant ID
}

// Access in routes
export async function load({ locals }) {
  const { authInfo } = locals;
  console.log(authInfo.email); // admin@firmly.ai
}
```

## Related Documentation

- [Routes Overview](./overview.md) - Route structure
- [Azure AD Authentication](../authentication/azure-ad.md) - SSO details
- [Dashboard System](../merchant/dashboard-system.md) - Dashboard management
- [API: Admin Dashboards](../api/admin/dashboards.md) - API reference
- [API: Admin Invites](../api/admin/invites.md) - API reference
