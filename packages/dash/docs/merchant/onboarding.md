# Onboarding

The onboarding system tracks merchant integration progress through a series of steps that must be completed before the dashboard is fully operational.

## Overview

```mermaid
flowchart LR
    subgraph "Onboarding Steps"
        Agreement[Sign Agreement] --> Destinations[Configure Destinations]
        Destinations --> Integration[Complete Integration]
    end

    Integration --> Active[Dashboard Active]
```

## Onboarding Tasks

| Task | Description | Required |
|------|-------------|----------|
| **Agreement** | Sign merchant service agreement | Yes |
| **Destinations** | Review and enable payment destinations | Yes |
| **Integration** | Complete technical integration steps | Yes |
| **Catalog** | Configure product catalog (optional) | No |

## Onboarding Status Storage

Onboarding status is stored in MerchantDO:

| Field | Description |
|-------|-------------|
| `task` | Task identifier (agreement, destinations, integration, catalog) |
| `completed` | Whether task is complete |
| `completed_at` | Completion timestamp |
| `completed_by` | Who completed it |
| `details` | Additional task-specific data |

## Agreement Signing

### Agreement Flow

```mermaid
sequenceDiagram
    participant User
    participant Page as Agreement Page
    participant API as Agreement API
    participant DO as MerchantDO

    User->>Page: View agreement page
    Page->>DO: Check agreement status
    DO-->>Page: { signed: false }

    User->>User: Read agreement text
    User->>User: Scroll to bottom
    Page->>Page: Enable sign button

    User->>API: POST /api/agreement
    API->>DO: Store signature
    Note over DO: userId, timestamp, IP, location
    API->>DO: Create audit log
    API-->>User: Success
```

### Signature Record

When an agreement is signed, the following is captured:

| Field | Description |
|-------|-------------|
| `signedAt` | Signature timestamp |
| `signedBy` | Signer's email |
| `signedByUserId` | Signer's user ID |
| `clientIp` | IP address at signing |
| `clientLocation` | Geographic location |
| `browserInfo` | Browser user agent |

## Destination Configuration

### Destination Flow

```mermaid
sequenceDiagram
    participant User
    participant Page as Destinations Page
    participant API as Destinations API
    participant D1 as D1 (firmlyConfigs)
    participant DO as MerchantDO

    User->>Page: View destinations page
    Page->>API: GET /api/destinations
    API->>D1: Fetch all destinations
    API->>D1: Fetch partner configs
    API->>DO: Get onboarding status
    API-->>Page: Destinations with states

    User->>User: Toggle destinations
    User->>API: POST /api/destinations
    API->>D1: Update partner configs
    API->>DO: Mark destinations completed
    API->>DO: Create audit logs
    API-->>User: Success
```

### Destination States

| State | Description |
|-------|-------------|
| `isActive` | Currently enabled for merchant |
| `canToggle` | Merchant can enable/disable |
| `isComingSoon` | Not yet available |
| `restrictMerchantAccess` | Requires explicit enablement |

## Integration Steps

Integration progress is tracked through a predefined set of steps and substeps.

### Step Structure

Steps are defined with:
- ID and title
- Description
- Optional substeps

Example steps:
- **API Setup** with substeps: Generate API Key, Configure Webhook
- **Testing** with substeps: Test in Sandbox, Production Verification

### Step Statuses

| Status | Description |
|--------|-------------|
| `pending` | Not started |
| `in-progress` | Partially complete |
| `completed` | Fully complete |

### Auto-Sync Logic

When integration steps change, the onboarding integration status is automatically synchronized:

- Fetch current integration steps
- Calculate overall completion status
- Update onboarding status if changed

## Progress Tracking UI

The merchant dashboard shows onboarding progress in the sidebar:

```mermaid
graph TD
    subgraph "Integration Progress"
        Step1[✅ Sign Agreement]
        Step2[✅ Configure Destinations]
        Step3[🔄 Integration - 2/4 steps]
        Step4[⬜ Review & Launch]
    end
```

## Related Documentation

- [Dashboard System](./dashboard-system.md) - Dashboard overview
- [Audit Logs](./audit-logs.md) - Onboarding action logging
