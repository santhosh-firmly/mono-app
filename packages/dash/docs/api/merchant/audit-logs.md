# GET /merchant/{domain}/api/audit-logs

Get audit logs for a merchant dashboard.

## Use Case

Provides a compliance trail of all significant actions taken on a merchant's dashboard, including team changes, configuration updates, and administrative actions.

## Endpoint

```
GET /(logged-in)/merchant/[domain]/api/audit-logs
```

## Authentication

Session cookie required.

## Authorization

- **Owners**: Can view audit logs
- **Editors/Viewers**: Cannot view audit logs
- **Firmly admins**: Can view all audit logs including admin actions

## Request

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | string | Merchant domain (e.g., `acme.com`) |

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | number | 50 | 100 | Items per page |
| `offset` | number | 0 | - | Starting index |

### Example

```http
GET /merchant/acme.com/api/audit-logs?limit=50&offset=0
Cookie: session=<jwt>
```

## Response

### Success (200)

```json
{
  "logs": [
    {
      "id": "log_abc123",
      "timestamp": "2024-01-15T10:30:00Z",
      "eventType": "team_member_invited",
      "actorId": "usr_abc123",
      "actorEmail": "owner@acme.com",
      "actorType": "owner",
      "targetEmail": "newmember@acme.com",
      "details": {
        "role": "editor"
      }
    },
    {
      "id": "log_def456",
      "timestamp": "2024-01-14T15:45:00Z",
      "eventType": "agreement_signed",
      "actorId": "usr_abc123",
      "actorEmail": "owner@acme.com",
      "actorType": "owner",
      "details": {
        "version": "1.0"
      }
    },
    {
      "id": "log_ghi789",
      "timestamp": "2024-01-14T14:00:00Z",
      "eventType": "destinations_updated",
      "actorId": "admin_xyz",
      "actorEmail": "admin@firmly.ai",
      "actorType": "firmly_admin",
      "details": {
        "destinations": ["amazon", "ebay"]
      }
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `logs` | array | List of audit log entries |
| `total` | number | Total log entries |
| `limit` | number | Items per page |
| `offset` | number | Current offset |

### Audit Log Entry

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Log entry identifier |
| `timestamp` | string | When event occurred (ISO 8601) |
| `eventType` | string | Type of event |
| `actorId` | string | User or admin who performed action |
| `actorEmail` | string | Actor's email |
| `actorType` | string | Role of actor |
| `targetEmail` | string | Target user (if applicable) |
| `details` | object | Event-specific data |

### Errors

**403 - Not Owner**
```json
{
  "error": "Only owners can view audit logs"
}
```

**500 - Fetch Failed**
```json
{
  "error": "Failed to fetch audit logs"
}
```

## Event Types

| Event Type | Description | Details |
|------------|-------------|---------|
| `team_member_invited` | Team invite sent | `{ role }` |
| `team_member_added` | Member joined team | `{ role }` |
| `team_member_removed` | Member removed | `{ previousRole }` |
| `team_role_changed` | Role updated | `{ oldRole, newRole }` |
| `invite_cancelled` | Invite cancelled | `{ role }` |
| `agreement_signed` | Agreement signed | `{ version }` |
| `destinations_updated` | Destinations changed | `{ destinations }` |
| `settings_updated` | Config changed | `{ field, oldValue, newValue }` |

## Actor Types

| Type | Description |
|------|-------------|
| `owner` | Merchant owner |
| `editor` | Merchant editor |
| `viewer` | Merchant viewer |
| `firmly_admin` | Firmly employee via Azure AD |

## Implementation Details

### Authorization Check

```javascript
if (!isFirmlyAdmin) {
  const merchantAccess = await getMerchantAccess({ platform, userId });
  const currentAccess = merchantAccess.find(
    (a) => (a.merchant_domain || a.merchantDomain) === domain
  );
  const isOwner = currentAccess?.role === 'owner';

  if (!isOwner) {
    return json({ error: 'Only owners can view audit logs' }, { status: 403 });
  }
}
```

### Firmly Admin Filtering

Admin actions are only visible to Firmly admins:

```javascript
const result = await getAuditLogs({
  platform,
  merchantDomain: domain,
  limit: Math.min(limit, 100),
  offset,
  includeFirmlyAdmin: isFirmlyAdmin || false
});
```

### MerchantDO Query

```javascript
// In MerchantDO
async getAuditLogs({ limit, offset, includeFirmlyAdmin }) {
  let logs = this.auditLogs;

  // Filter out admin actions for non-admins
  if (!includeFirmlyAdmin) {
    logs = logs.filter(log => log.actorType !== 'firmly_admin');
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = logs.length;
  const paged = logs.slice(offset, offset + limit);

  return { logs: paged, total };
}
```

## Why Owner-Only Access?

Audit logs contain sensitive operational information:

1. **Security visibility**: Who accessed what and when
2. **Staff activity**: Which team members made changes
3. **Admin transparency**: Firmly admin actions (when viewing as admin)

Restricting to owners ensures:
- Business owners have full visibility
- Lower-privilege users can't surveil each other
- Compliance requirements are met

## Firmly Admin Visibility

When a Firmly admin views audit logs:
- All actions are visible, including other admin actions
- Helps with support and debugging
- Full transparency for Firmly operations

When a merchant owner views:
- Only team member actions visible
- Admin actions are filtered out
- Maintains privacy of internal operations

## Client Usage

```svelte
<script>
  let logs = $state([]);
  let total = $state(0);

  async function loadLogs(page = 1) {
    const offset = (page - 1) * 50;
    const response = await fetch(
      `/merchant/${domain}/api/audit-logs?limit=50&offset=${offset}`
    );
    const data = await response.json();
    logs = data.logs;
    total = data.total;
  }
</script>

<Table>
  {#each logs as log}
    <TableRow>
      <TableCell>{formatDate(log.timestamp)}</TableCell>
      <TableCell>{log.eventType}</TableCell>
      <TableCell>{log.actorEmail}</TableCell>
      <TableCell>{log.targetEmail || '-'}</TableCell>
    </TableRow>
  {/each}
</Table>
```

## Related

- [Audit Logging](../../merchant/audit-logs.md) - Full documentation
- [Team Management](../../merchant/team-management.md) - Role details
- [MerchantDO](../../database/durable-objects.md) - Data structure
