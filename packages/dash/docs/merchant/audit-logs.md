# Audit Logs

All sensitive operations on merchant dashboards are logged for compliance, security, and debugging purposes.

## Overview

Audit logs capture:
- **Who** performed the action (actor)
- **What** action was performed (event type)
- **When** it happened (timestamp)
- **On whom** (target, if applicable)
- **Additional details** (role changes, settings, etc.)

## Event Types

### Team Events
- `team_member_invited` - User invited to team
- `invite_accepted` - Invitation accepted
- `invite_cancelled` - Invitation cancelled
- `member_removed` - Team member removed
- `role_changed` - Team member role changed

### Settings Events
- `settings_updated` - Merchant settings changed

### Destination Events
- `destination_enabled` - Payment destination enabled
- `destination_disabled` - Payment destination disabled

### Agreement Events
- `agreement_signed` - Merchant agreement signed

### Integration Events
- `integration_completed` - Integration fully completed
- `integration_reset` - Integration reset
- `integration_step_completed` - Single step completed
- `integration_step_updated` - Step status changed
- `integration_steps_synced` - Steps synced from external source

### Other Events
- `catalog_configured` - Product catalog configured
- `cdn_whitelisting_completed` - CDN whitelisting finished

## Log Structure

| Field | Description |
|-------|-------------|
| `id` | Unique log ID |
| `eventType` | Event type from list above |
| `actorId` | User ID who performed action |
| `actorEmail` | User email |
| `actorType` | Role: firmly_admin, owner, editor, viewer, system |
| `targetId` | Target user ID (for team events) |
| `targetEmail` | Target user email |
| `details` | Additional event-specific data (JSON) |
| `isFirmlyAdmin` | Whether actor is Firmly admin |
| `createdAt` | ISO timestamp |

## Storage

Audit logs are stored in MerchantDO with:
- Primary key on log ID
- Index on created_at for chronological queries
- Index on event_type for filtering

## Actor Types

| Type | Description |
|------|-------------|
| `firmly_admin` | Firmly employee via Azure AD |
| `owner` | Dashboard owner |
| `editor` | Team member with editor role |
| `viewer` | Team member with viewer role |
| `system` | Automated/API actions |
| `user` | Generic user (fallback) |

## Event Details by Type

### Team Events

**`invite_accepted`**: Contains role assigned

**`role_changed`**: Contains new role

**`member_removed`**: No additional details

### Destination Events

**`destination_enabled`** / **`destination_disabled`**: Contains destination ID and name

### Agreement Events

**`agreement_signed`**: Contains client IP, location, and browser info

### Integration Events

**`integration_step_completed`**: Contains step ID, substep ID, status, and source

**`integration_steps_synced`**: Contains count of updated steps

### Settings Events

**`settings_updated`**: Contains field name, old value, and new value

## Audit Log Page

The audit logs page (`/merchant/{domain}/audit-logs`) displays:

1. **Filterable log list** with:
   - Event type filter
   - Date range filter
   - Actor filter

2. **Log entries** showing:
   - Event icon and description
   - Actor name and type badge
   - Target (if applicable)
   - Timestamp
   - Expandable details

3. **Pagination** for large log sets

## Filtering Firmly Admin Actions

By default, Firmly admin actions can be hidden from merchant view. Admin view shows all actions including those by Firmly staff.

## Retention

Audit logs are retained indefinitely in MerchantDO:
- Logs are stored per-merchant (isolated)
- Timestamps are in UTC ISO format
- Actor information is captured at time of action (not looked up later)

## Security Considerations

1. **Immutability** - Logs are write-only, no updates or deletes
2. **Actor capture** - Actor info captured at write time, not referenced
3. **Per-merchant isolation** - Each merchant has separate log storage
4. **Admin visibility flag** - Control what merchants see

## Related Documentation

- [Dashboard System](./dashboard-system.md) - Dashboard overview
- [Team Management](./team-management.md) - Team operations
- [Onboarding](./onboarding.md) - Onboarding events
