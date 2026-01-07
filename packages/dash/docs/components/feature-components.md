# Feature Components

Feature components are domain-specific components organized by functionality.

## Authentication (`auth/`)

Components for login and verification flows.

| Component | Description |
|-----------|-------------|
| `login-card.svelte` | Main login form with email input |
| `otp-input.svelte` | 6-digit OTP code input |
| `otp-verification-card.svelte` | OTP verification form |
| `email-sent-card.svelte` | Email confirmation message |
| `verification-status-card.svelte` | Status display after verification |

### LoginCard

```svelte
<script>
  import LoginCard from '$lib/components/auth/login-card.svelte';
</script>

<LoginCard
  onotp={(email) => sendOTP(email)}
  onmagiclink={(email) => sendMagicLink(email)}
/>
```

### OTPInput

```svelte
<script>
  import OTPInput from '$lib/components/auth/otp-input.svelte';
  let code = $state('');
</script>

<OTPInput
  bind:value={code}
  length={6}
  oncomplete={(code) => verifyCode(code)}
/>
```

## Order (`order/`)

Components for displaying order information.

| Component | Description |
|-----------|-------------|
| `order-header.svelte` | Order ID, status, date |
| `order-summary.svelte` | Financial breakdown |
| `order-items-list.svelte` | Product items list |
| `order-navigation.svelte` | Previous/next order navigation |
| `customer-info-card.svelte` | Customer contact details |
| `shipping-address-card.svelte` | Shipping address |
| `billing-address-card.svelte` | Billing address |
| `shipping-method-card.svelte` | Shipping method info |
| `payment-info-card.svelte` | Payment details |
| `partner-info-card.svelte` | Partner/vendor info |
| `store-info-card.svelte` | Merchant store info |

### OrderHeader

```svelte
<script>
  import OrderHeader from '$lib/components/order/order-header.svelte';
</script>

<OrderHeader
  orderId="ORD-12345"
  status="completed"
  createdAt="2024-01-15T10:30:00Z"
/>
```

### OrderSummary

```svelte
<script>
  import OrderSummary from '$lib/components/order/order-summary.svelte';
</script>

<OrderSummary
  subtotal={99.00}
  discount={10.00}
  shipping={5.99}
  tax={8.50}
  total={103.49}
  currency="USD"
/>
```

## Merchant (`merchant/`)

Components for merchant dashboard functionality.

| Component | Description |
|-----------|-------------|
| `merchant-navbar.svelte` | Main navigation sidebar |
| `merchant-header.svelte` | Header with branding |
| `merchant-page-header.svelte` | Page title and actions |
| `merchant-user-menu.svelte` | User dropdown menu |
| `account-selector.svelte` | Multi-merchant dropdown |
| `integration-progress.svelte` | Onboarding progress tracker |
| `onboarding-tasks.svelte` | Task checklist |
| `merchant-agreement.svelte` | Agreement signing component |
| `login-preview.svelte` | Preview of merchant login |
| `product-card.svelte` | Product display card |
| `stats-card.svelte` | Statistics display |

### AccountSelector

```svelte
<script>
  import AccountSelector from '$lib/components/merchant/account-selector.svelte';
</script>

<AccountSelector
  accounts={[
    { domain: 'merchant1.com', role: 'owner' },
    { domain: 'merchant2.com', role: 'editor' }
  ]}
  currentDomain="merchant1.com"
  onselect={(domain) => goto(`/merchant/${domain}`)}
/>
```

### IntegrationProgress

```svelte
<script>
  import IntegrationProgress from '$lib/components/merchant/integration-progress.svelte';
</script>

<IntegrationProgress
  status={{
    agreement: { completed: true },
    destinations: { completed: true },
    integration: { completed: false }
  }}
/>
```

## Merchant Settings (`merchant-settings/`)

Components for merchant configuration pages.

| Component | Description |
|-----------|-------------|
| `general-settings.svelte` | Basic merchant settings |
| `presentation-settings.svelte` | Branding and display |
| `advanced-settings.svelte` | Advanced configuration |
| `brand-identity-card.svelte` | Logo and colors |
| `company-info-card.svelte` | Company details |
| `main-contact-card.svelte` | Contact information |
| `legal-documents-card.svelte` | Terms and policies |

### GeneralSettings

```svelte
<script>
  import GeneralSettings from '$lib/components/merchant-settings/general-settings.svelte';
</script>

<GeneralSettings
  settings={merchantSettings}
  onsave={(settings) => saveSettings(settings)}
/>
```

## Team (`team/`)

Components for team management.

| Component | Description |
|-----------|-------------|
| `team-members-table.svelte` | Team list with roles |
| `team-invite-dialog.svelte` | Invite form modal |
| `change-role-dialog.svelte` | Role change confirmation |
| `remove-member-dialog.svelte` | Member removal confirmation |

### TeamMembersTable

```svelte
<script>
  import TeamMembersTable from '$lib/components/team/team-members-table.svelte';
</script>

<TeamMembersTable
  members={teamMembers}
  currentUserId={userId}
  isOwner={role === 'owner'}
  onchangerole={(userId, newRole) => updateRole(userId, newRole)}
  onremove={(userId) => removeMember(userId)}
/>
```

### TeamInviteDialog

```svelte
<script>
  import TeamInviteDialog from '$lib/components/team/team-invite-dialog.svelte';
  let open = $state(false);
</script>

<TeamInviteDialog
  bind:open
  oninvite={({ email, role }) => sendInvite(email, role)}
/>
```

## Profile (`profile/`)

Components for user profile management.

| Component | Description |
|-----------|-------------|
| `profile-edit-card.svelte` | Profile information form |
| `active-sessions-card.svelte` | Session management |
| `avatar-editor.svelte` | Avatar upload/selection |

### ProfileEditCard

```svelte
<script>
  import ProfileEditCard from '$lib/components/profile/profile-edit-card.svelte';
</script>

<ProfileEditCard
  profile={userProfile}
  onsave={(profile) => updateProfile(profile)}
/>
```

### ActiveSessionsCard

```svelte
<script>
  import ActiveSessionsCard from '$lib/components/profile/active-sessions-card.svelte';
</script>

<ActiveSessionsCard
  sessions={activeSessions}
  currentSessionId={sessionId}
  onterminate={(sessionId) => terminateSession(sessionId)}
  onterminateall={() => terminateAllSessions()}
/>
```

## Charts (`charts/`)

Data visualization components using Chart.js.

| Component | Description |
|-----------|-------------|
| `area-chart.svelte` | Area/line chart |
| `bar-chart.svelte` | Bar chart |
| `pie-chart.svelte` | Pie/donut chart |

### AreaChart

```svelte
<script>
  import AreaChart from '$lib/components/charts/area-chart.svelte';
</script>

<AreaChart
  data={{
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Orders',
      data: [65, 59, 80]
    }]
  }}
  comparison={{
    label: 'Last Period',
    data: [50, 45, 60]
  }}
/>
```

## Admin (`admin/dashboards/`)

Components for admin functionality.

| Component | Description |
|-----------|-------------|
| `dashboards-table.svelte` | Dashboard list table |
| `create-dashboard-dialog.svelte` | New dashboard form |
| `invite-user-dialog.svelte` | User invitation modal |
| `cancel-invite-dialog.svelte` | Cancel invite confirmation |

### DashboardsTable

```svelte
<script>
  import DashboardsTable from '$lib/components/admin/dashboards/dashboards-table.svelte';
</script>

<DashboardsTable
  dashboards={allDashboards}
  oninvite={(domain) => openInviteDialog(domain)}
  oncancel={(domain) => cancelInvite(domain)}
/>
```

## Custom (`custom/`)

### DataTable

Advanced table with svelte-headless-table:

```svelte
<script>
  import DataTable from '$lib/components/custom/data-table/data-table.svelte';
</script>

<DataTable
  data={orders}
  columns={[
    { accessorKey: 'id', header: 'Order ID' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'total', header: 'Total' }
  ]}
  searchable
  sortable
  paginated
/>
```

Features:
- Column sorting
- Full-text search
- Faceted filters
- Pagination
- Row selection
- Custom cell renderers

### Combobox

Search-and-select dropdown:

```svelte
<script>
  import Combobox from '$lib/components/custom/combobox.svelte';
</script>

<Combobox
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
  placeholder="Select country..."
  onselect={(value) => setCountry(value)}
/>
```

### CopyToClipboard

```svelte
<script>
  import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';
</script>

<CopyToClipboard text="api-key-12345" />
```

## Related Documentation

- [Components Overview](./overview.md) - Component architecture
- [UI Library](./ui-library.md) - UI primitives
- [Patterns](./patterns.md) - Design patterns
