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

## Team (`team/`)

Components for team management.

| Component | Description |
|-----------|-------------|
| `team-members-table.svelte` | Team list with roles |
| `team-invite-dialog.svelte` | Invite form modal |
| `change-role-dialog.svelte` | Role change confirmation |
| `remove-member-dialog.svelte` | Member removal confirmation |

## Profile (`profile/`)

Components for user profile management.

| Component | Description |
|-----------|-------------|
| `profile-edit-card.svelte` | Profile information form |
| `active-sessions-card.svelte` | Session management |
| `avatar-editor.svelte` | Avatar upload/selection |

## Charts (`charts/`)

Data visualization components using Chart.js.

| Component | Description |
|-----------|-------------|
| `area-chart.svelte` | Area/line chart with optional comparison |
| `bar-chart.svelte` | Bar chart |
| `pie-chart.svelte` | Pie/donut chart |

## Admin (`admin/dashboards/`)

Components for admin functionality.

| Component | Description |
|-----------|-------------|
| `dashboards-table.svelte` | Dashboard list table |
| `create-dashboard-dialog.svelte` | New dashboard form |
| `invite-user-dialog.svelte` | User invitation modal |
| `cancel-invite-dialog.svelte` | Cancel invite confirmation |

## Custom (`custom/`)

### DataTable

Advanced table with svelte-headless-table featuring:
- Column sorting
- Full-text search
- Faceted filters
- Pagination
- Row selection
- Custom cell renderers

### Combobox

Search-and-select dropdown for picking from a list of options.

### CopyToClipboard

Click-to-copy utility button.

## Related Documentation

- [Components Overview](./overview.md) - Component architecture
- [UI Library](./ui-library.md) - UI primitives
