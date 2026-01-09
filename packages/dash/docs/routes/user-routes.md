# User Routes

User routes are protected pages for authenticated merchant users.

## Route Group: `(logged-in)`

All user routes are under the `(logged-in)` route group, requiring JWT session authentication.

## Dashboard Selection (`/`)

The home page handles users with multiple dashboards:

```javascript
// routes/(logged-in)/+page.server.js
export async function load({ platform, locals }) {
  const { userId } = locals.session;

  // Get user's merchant access
  const merchantAccess = await getMerchantAccess({ platform, userId });

  // Smart redirect for single dashboard
  if (merchantAccess.length === 1) {
    redirect(302, `/merchant/${merchantAccess[0].merchantDomain}`);
  }

  // Get pending invites
  const pendingInvites = await getPendingInvites({ platform, userId });

  return { merchantAccess, pendingInvites };
}
```

The page shows:
- Dashboard cards with merchant name and role
- Pending invitations that can be accepted/declined
- Create account prompt if no dashboards

## Profile (`/profile`)

User profile management:

| Feature | Description |
|---------|-------------|
| Edit profile | Name, company, title, location |
| Avatar upload | Profile picture |
| Active sessions | View/terminate devices |

```javascript
// routes/(logged-in)/profile/+page.server.js
export async function load({ platform, locals }) {
  const { userId, sessionId } = locals.session;

  const profile = await getProfile({ platform, userId });
  const sessions = await listSessions({ platform, userId });

  return {
    profile,
    sessions,
    currentSessionId: sessionId
  };
}
```

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

The merchant layout provides common elements:

```svelte
<!-- routes/(logged-in)/merchant/[domain]/+layout.svelte -->
<script>
  let { data, children } = $props();
  const { merchantAccess, onboardingStatus, isFirmlyAdmin } = data;
</script>

<div class="merchant-layout">
  <!-- Header with merchant selector -->
  <MerchantHeader
    {merchantAccess}
    currentDomain={data.domain}
    {isFirmlyAdmin}
  />

  <div class="content">
    <!-- Sidebar navigation -->
    <MerchantNavbar domain={data.domain} />

    <!-- Main content -->
    <main>
      {@render children()}
    </main>

    <!-- Onboarding sidebar (if not complete) -->
    {#if !onboardingStatus.integration?.completed}
      <IntegrationProgress status={onboardingStatus} />
    {/if}
  </div>

  <!-- Admin banner for Firmly admins -->
  {#if isFirmlyAdmin}
    <FirmlyAdminBanner />
  {/if}
</div>
```

### Layout Server

```javascript
// routes/(logged-in)/merchant/[domain]/+layout.server.js
export async function load({ platform, locals, params }) {
  const { domain } = params;
  const { userId, isFirmlyAdmin } = locals.session;

  // Get user's access to this merchant
  const merchantAccess = await getMerchantAccess({ platform, userId });
  const currentAccess = merchantAccess.find(a => a.merchantDomain === domain);

  // Check authorization
  if (!currentAccess && !isFirmlyAdmin) {
    redirect(302, '/');
  }

  // Get onboarding status
  const onboardingStatus = await getOnboardingStatus({ platform, merchantDomain: domain });

  return {
    domain,
    role: currentAccess?.role || (isFirmlyAdmin ? 'admin' : null),
    merchantAccess,
    onboardingStatus,
    isFirmlyAdmin
  };
}
```

## Orders (`/merchant/[domain]/orders`)

### List Page

```javascript
// routes/(logged-in)/merchant/[domain]/orders/+page.svelte
<script>
  let { data } = $props();
  let orders = $state([]);
  let loading = $state(true);

  onMount(async () => {
    const response = await fetch(`/merchant/${data.domain}/api/orders`);
    orders = await response.json();
    loading = false;
  });
</script>
```

Features:
- Filterable by status, date, partner
- Search by order ID
- Pagination
- Export to CSV

### Detail Page

```javascript
// routes/(logged-in)/merchant/[domain]/orders/[order_id]/+page.svelte
```

Shows:
- Order header (ID, status, date)
- Order items
- Customer info
- Shipping/billing addresses
- Payment info
- Navigation between orders

## Destinations (`/merchant/[domain]/destinations`)

Configure which payment destinations are enabled:

```javascript
// Page loads current state
const { destinations } = await getMerchantDestinations({
  platform,
  merchantDomain: domain
});

// User toggles destinations
await updateMerchantDestinations({
  platform,
  merchantDomain: domain,
  enabledDestinations: ['amazon', 'walmart'],
  actor: { id: userId, email }
});
```

## Team (`/merchant/[domain]/team`)

Team management (owner only for modifications):

```javascript
// routes/(logged-in)/merchant/[domain]/team/+page.server.js
export async function load({ platform, params }) {
  const team = await getMerchantTeam({
    platform,
    merchantDomain: params.domain
  });

  return { team };
}
```

Features:
- Team member list with roles
- Invite new members (owner only)
- Change roles (owner only)
- Remove members (owner only)

## Agreement (`/merchant/[domain]/agreement`)

Service agreement signing (owner only):

```javascript
// routes/(logged-in)/merchant/[domain]/agreement/+page.svelte
<script>
  let scrolledToBottom = $state(false);

  function handleScroll(e) {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50;
  }

  async function signAgreement() {
    await fetch(`/merchant/${domain}/api/agreement`, {
      method: 'POST',
      body: JSON.stringify({
        browserInfo: navigator.userAgent
      })
    });
  }
</script>
```

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

```javascript
// Example: Team invite (owner only)
export async function POST({ request, platform, locals, params }) {
  const { userId, isFirmlyAdmin } = locals.session;

  if (!isFirmlyAdmin) {
    const access = await getMerchantAccess({ platform, userId });
    const current = access.find(a => a.merchantDomain === params.domain);

    if (!current || current.role !== 'owner') {
      return json({ error: 'Not authorized' }, { status: 403 });
    }
  }

  // Process invite...
}
```

## Related Documentation

- [Routes Overview](./overview.md) - Route structure
- [JWT Sessions](../authentication/jwt-sessions.md) - Session handling
- [Dashboard System](../merchant/dashboard-system.md) - Dashboard concept
- [Team Management](../merchant/team-management.md) - Team operations
- [API Reference](../api/README.md) - All API endpoints
