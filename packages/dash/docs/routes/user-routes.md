# User Routes

User routes are protected pages for authenticated merchant users.

## Route Group: `(logged-in)`

All user routes are under the `(logged-in)` route group, requiring JWT session authentication.

## Dashboard Selection (`/`)

The home page handles users with multiple dashboards:

**Behavior:**
- Single dashboard: Automatically redirect to `/merchant/{domain}`
- Zero or multiple dashboards: Show selection grid
- Also displays pending invitations that can be accepted/declined

## Profile (`/profile`)

User profile management:

| Feature | Description |
|---------|-------------|
| Edit profile | Name, company, title, location |
| Avatar upload | Profile picture stored in R2 |
| Active sessions | View and terminate devices |

The sessions list shows:
- Device name and type
- IP address
- Last access time
- Option to terminate session
- Current session is highlighted

## Merchant Dashboard (`/merchant/[domain]`)

### Pages

| Route | Description |
|-------|-------------|
| `/merchant/[domain]` | Dashboard home |
| `/merchant/[domain]/orders` | Orders list |
| `/merchant/[domain]/orders/[order_id]` | Order detail |
| `/merchant/[domain]/destinations` | Configure destinations |
| `/merchant/[domain]/team` | Team management |
| `/merchant/[domain]/audit-logs` | Activity logs |
| `/merchant/[domain]/agreement` | Sign agreement |
| `/merchant/[domain]/settings` | Merchant settings |
| `/merchant/[domain]/settings/cdn` | CDN configuration |
| `/merchant/[domain]/catalog` | Product catalog |
| `/merchant/[domain]/integration-admin` | Integration status |

### Layout

The merchant layout provides:
- **Header**: Merchant selector dropdown, user menu
- **Sidebar**: Navigation links (Orders, Destinations, Team, etc.)
- **Main content**: Child page content
- **Integration progress**: Sidebar showing onboarding status (if not complete)
- **Admin banner**: Visible when Firmly admin is viewing merchant dashboard

### Authorization

The layout server checks:
1. User has access to this merchant (from DashUserDO `merchant_access`)
2. Or user is a Firmly admin (Azure AD session)

If neither, redirect to `/`.

## Orders

### List Page

Features:
- Filterable by status, date, partner
- Search by order ID
- Pagination
- Export to CSV

### Detail Page

Shows:
- Order header (ID, status, date)
- Order items
- Customer info
- Shipping/billing addresses
- Payment info
- Navigation between orders

## Destinations

Configure which payment destinations are enabled for the merchant. Changes are logged in audit logs.

## Team

Team management page (modifications require owner role):

| Action | Required Role |
|--------|---------------|
| View team | Any |
| Invite new members | Owner |
| Change roles | Owner |
| Remove members | Owner |

## Agreement

Service agreement signing (owner only):
- User must scroll to bottom before "Sign" button is enabled
- Captures browser info, IP, and location
- Stored in MerchantDO with timestamp

## API Routes

### Protected APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/logout` | POST | Logout user |
| `/api/profile` | GET, PUT | Profile operations |
| `/api/sessions` | GET | List sessions |
| `/api/sessions/[id]` | DELETE | Terminate session |

### Merchant APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/merchant/[domain]/api/orders` | GET | List orders |
| `/merchant/[domain]/api/orders/[id]` | GET | Order detail |
| `/merchant/[domain]/api/team` | GET, POST | Team operations |
| `/merchant/[domain]/api/team/invite` | POST | Send invite |
| `/merchant/[domain]/api/team/[userId]` | PUT, DELETE | Update/remove member |
| `/merchant/[domain]/api/destinations` | GET, POST | Destination config |
| `/merchant/[domain]/api/agreement` | GET, POST | Agreement operations |
| `/merchant/[domain]/api/audit-logs` | GET | Audit logs |
| `/merchant/[domain]/api/integration-status` | GET, POST | Integration status |
| `/merchant/[domain]/api/dashboard` | GET | Dashboard metrics |

## Authorization Checks

Each API verifies the user has access:
1. Get user's merchant access from DashUserDO
2. Check if user has access to the requested merchant domain
3. For owner-only actions, verify role is `owner`
4. Firmly admins bypass these checks

## Related Documentation

- [Routes Overview](./overview.md) - Route structure
- [JWT Sessions](../authentication/jwt-sessions.md) - Session handling
- [Dashboard System](../merchant/dashboard-system.md) - Dashboard concept
- [Team Management](../merchant/team-management.md) - Team operations
