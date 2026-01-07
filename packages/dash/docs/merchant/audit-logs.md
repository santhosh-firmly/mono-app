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

```javascript
// merchant.js
export const AuditEventTypes = {
  // Team events
  TEAM_MEMBER_INVITED: 'team_member_invited',
  INVITE_ACCEPTED: 'invite_accepted',
  INVITE_CANCELLED: 'invite_cancelled',
  MEMBER_REMOVED: 'member_removed',
  ROLE_CHANGED: 'role_changed',

  // Settings events
  SETTINGS_UPDATED: 'settings_updated',

  // Destination events
  DESTINATION_ENABLED: 'destination_enabled',
  DESTINATION_DISABLED: 'destination_disabled',

  // Agreement events
  AGREEMENT_SIGNED: 'agreement_signed',

  // Integration events
  INTEGRATION_COMPLETED: 'integration_completed',
  INTEGRATION_RESET: 'integration_reset',
  INTEGRATION_STEP_COMPLETED: 'integration_step_completed',
  INTEGRATION_STEP_UPDATED: 'integration_step_updated',
  INTEGRATION_STEPS_SYNCED: 'integration_steps_synced',

  // Catalog events
  CATALOG_CONFIGURED: 'catalog_configured',

  // CDN events
  CDN_WHITELISTING_COMPLETED: 'cdn_whitelisting_completed'
};
```

## Log Structure

```typescript
interface AuditLog {
  id: string;              // UUID
  eventType: string;       // Event type from AuditEventTypes
  actorId: string;         // User ID who performed action
  actorEmail: string;      // User email
  actorType: string;       // 'firmly_admin', 'owner', 'editor', 'viewer', 'system'
  targetId?: string;       // Target user ID (for team events)
  targetEmail?: string;    // Target user email
  details?: object;        // Additional event-specific data
  isFirmlyAdmin: boolean;  // Whether actor is Firmly admin
  createdAt: string;       // ISO timestamp
}
```

## Storage

Audit logs are stored in MerchantDO:

```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_email TEXT,
  actor_type TEXT,
  target_id TEXT,
  target_email TEXT,
  details TEXT,
  is_firmly_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
```

## Creating Audit Logs

```javascript
// merchant.js
export async function createAuditLog({
  platform,
  merchantDomain,
  eventType,
  actorId,
  actorEmail,
  targetId = null,
  targetEmail = null,
  details = null,
  isFirmlyAdmin = false,
  actorType = 'user'
}) {
  await fetchMerchantDO(platform, merchantDomain, '/audit-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventType,
      actorId,
      actorEmail,
      targetId,
      targetEmail,
      details,
      isFirmlyAdmin,
      actorType
    })
  });

  return true;
}
```

## Retrieving Audit Logs

```javascript
// merchant.js
export async function getAuditLogs({
  platform,
  merchantDomain,
  limit = 50,
  offset = 0,
  includeFirmlyAdmin = false
}) {
  const response = await fetchMerchantDO(
    platform,
    merchantDomain,
    `/audit-logs?limit=${limit}&offset=${offset}&includeFirmlyAdmin=${includeFirmlyAdmin}`
  );

  if (!response.ok) {
    return { logs: [], total: 0, limit, offset };
  }

  return response.json();
}

// Returns:
{
  "logs": [
    {
      "id": "log-uuid-1",
      "eventType": "role_changed",
      "actorId": "user-uuid",
      "actorEmail": "owner@merchant.com",
      "actorType": "owner",
      "targetId": "user-uuid-2",
      "targetEmail": "editor@merchant.com",
      "details": { "newRole": "editor" },
      "isFirmlyAdmin": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

## Actor Types

| Type | Description |
|------|-------------|
| `firmly_admin` | Firmly employee via Azure AD |
| `owner` | Dashboard owner |
| `editor` | Team member with editor role |
| `viewer` | Team member with viewer role |
| `system` | Automated/API actions |
| `user` | Generic user (fallback) |

Derived automatically:

```javascript
function getActorType(actor) {
  if (!actor) return 'system';
  if (actor.isFirmlyAdmin) return 'firmly_admin';
  if (actor.role) return actor.role;
  return 'user';
}
```

## Event Details by Type

### Team Events

**`invite_accepted`**
```json
{ "role": "editor" }
```

**`role_changed`**
```json
{ "newRole": "viewer" }
```

**`member_removed`**
```json
{}  // No additional details
```

### Destination Events

**`destination_enabled`** / **`destination_disabled`**
```json
{
  "destinationId": "amazon",
  "destinationName": "Amazon"
}
```

### Agreement Events

**`agreement_signed`**
```json
{
  "clientIp": "203.0.113.42",
  "clientLocation": "San Francisco, CA",
  "browserInfo": "Mozilla/5.0 (Macintosh..."
}
```

### Integration Events

**`integration_step_completed`**
```json
{
  "stepId": "api-setup",
  "substepId": "api-key",
  "status": "completed",
  "source": "admin"
}
```

**`integration_steps_synced`**
```json
{ "updatedSteps": 3 }
```

### Settings Events

**`settings_updated`**
```json
{
  "field": "company.name",
  "oldValue": "Acme Corp",
  "newValue": "Acme Corporation"
}
```

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

By default, Firmly admin actions can be hidden from merchant view:

```javascript
// Default: hide admin actions
const logs = await getAuditLogs({
  platform,
  merchantDomain,
  includeFirmlyAdmin: false
});

// Admin view: show all actions
const logs = await getAuditLogs({
  platform,
  merchantDomain,
  includeFirmlyAdmin: true
});
```

## Retention

Audit logs are retained indefinitely in MerchantDO. For compliance:
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
- [API: Audit Logs](../api/merchant/audit-logs.md) - API reference
