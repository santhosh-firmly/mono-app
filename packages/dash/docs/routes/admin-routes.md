# Admin Routes

Admin routes are accessible only to Firmly employees authenticated via Azure AD SSO.

## Route Group: `(firmly-user-only)`

All admin routes are under the `(firmly-user-only)` route group, requiring Azure AD authentication.

## Admin Dashboard (`/admin`)

### Pages

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard home with analytics |
| `/admin/dashboards` | Manage merchant dashboards |
| `/admin/merchants` | List all merchants |
| `/admin/merchants/[domain]` | View merchant details |
| `/admin/merchants/[domain]/edit` | Edit merchant settings |
| `/admin/merchants/[domain]/products` | Manage products |
| `/admin/orders` | View all orders |
| `/admin/orders/[order_id]` | Order details |
| `/admin/dropin` | Drop-in widget testing |

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

Data is fetched from the `reporting` database.

## Dashboards Management (`/admin/dashboards`)

Manage all merchant dashboards:
- View all dashboards with status (pending, active, suspended)
- Create new dashboards
- Send/cancel invites
- View team sizes

### Create Dashboard

Admins create dashboards by:
1. Entering a merchant domain
2. Adding optional notes
3. The dashboard is created with `pending` status
4. Admin then sends an invite to the owner

### Send Invite

Sending an invite:
1. Generate a cryptographically secure token
2. Store in KV with invite details and 7-day TTL
3. Send email via MailerSend with accept link
4. Dashboard status remains `pending` until accepted

## Merchants Management (`/admin/merchants`)

### List Merchants

Shows all merchants from `firmlyConfigs` database:
- Domain/name
- Status
- Product count
- Quick actions

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
- Pagination

## Layout Structure

The admin layout provides:
- Sidebar navigation (Dashboard, Dashboards, Merchants, Orders)
- Top header with user info
- Main content area

## Authorization

Admin routes are protected by checking the Azure AD cookie in `hooks.server.js`:
- If valid, populate `event.locals.authInfo` with Azure AD claims
- If invalid or missing, redirect to `/auth/sign-in`

## Admin Info in Locals

After Azure AD authentication, admin info is available in `event.locals.authInfo`:

| Property | Description |
|----------|-------------|
| `oid` | Object ID (unique identifier) |
| `email` | Email address |
| `preferred_username` | Display name |
| `name` | Full name |
| `tid` | Tenant ID |

## Related Documentation

- [Routes Overview](./overview.md) - Route structure
- [Azure AD Authentication](../authentication/azure-ad.md) - SSO details
- [Dashboard System](../merchant/dashboard-system.md) - Dashboard management
