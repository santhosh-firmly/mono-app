# GET /merchant/{domain}/api/team

Get all team members for a merchant dashboard.

## Use Case

Retrieves the list of users who have access to a merchant dashboard, including their roles and status.

## Endpoint

```
GET /(logged-in)/merchant/[domain]/api/team
```

## Authentication

Session cookie required. User must have access to the specified merchant.

## Authorization

- **Merchant team members**: Can view their team
- **Firmly admins**: Can view any merchant's team

## Request

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | string | Merchant domain (e.g., `acme.com`) |

### Example

```http
GET /merchant/acme.com/api/team
Cookie: session=<jwt>
```

## Response

### Success (200)

```json
{
  "team": [
    {
      "userId": "usr_abc123",
      "email": "owner@acme.com",
      "name": "Jane Owner",
      "role": "owner",
      "grantedAt": "2024-01-10T08:00:00Z",
      "grantedBy": null
    },
    {
      "userId": "usr_def456",
      "email": "editor@acme.com",
      "name": "John Editor",
      "role": "editor",
      "grantedAt": "2024-01-15T10:30:00Z",
      "grantedBy": "usr_abc123"
    },
    {
      "userId": "usr_ghi789",
      "email": "viewer@acme.com",
      "name": "Bob Viewer",
      "role": "viewer",
      "grantedAt": "2024-01-20T14:00:00Z",
      "grantedBy": "usr_abc123"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User's unique identifier |
| `email` | string | User's email address |
| `name` | string | User's display name |
| `role` | string | Role: `owner`, `editor`, `viewer` |
| `grantedAt` | string | When access was granted (ISO 8601) |
| `grantedBy` | string | UserId who granted access (null for first owner) |

### Errors

**403 - Access Denied**
```json
{
  "error": "Access denied"
}
```

**500 - Fetch Failed**
```json
{
  "error": "Failed to fetch team"
}
```

## Implementation Details

### Access Check

```javascript
// Firmly admins bypass access check
if (!isFirmlyAdmin) {
  const merchantAccess = await getMerchantAccess({ platform, userId });
  const hasAccess = merchantAccess.some(
    (a) => (a.merchant_domain || a.merchantDomain) === domain
  );

  if (!hasAccess) {
    return json({ error: 'Access denied' }, { status: 403 });
  }
}
```

### Team Retrieval

```javascript
const team = await getMerchantTeam({ platform, merchantDomain: domain });
```

### MerchantDO Operation

```javascript
// In MerchantDO
async getTeam() {
  return this.team.map(member => ({
    userId: member.userId,
    email: member.email,
    name: member.name || '',
    role: member.role,
    grantedAt: member.grantedAt,
    grantedBy: member.grantedBy
  }));
}
```

## Roles

| Role | Description | Can View Team |
|------|-------------|---------------|
| `owner` | Full control | Yes |
| `editor` | Operational access | Yes |
| `viewer` | Read-only | Yes |

All roles can view the team. Only owners can modify it.

## Data Source

Team data is stored in **MerchantDO** (Durable Object), not D1:

- Fast access without database queries
- Transactional updates with audit logging
- Consistent within merchant context

## Client Usage

```svelte
<script>
  import TeamMembersTable from '$lib/components/team/team-members-table.svelte';

  let team = $state([]);
  let { data } = $props();

  onMount(async () => {
    const response = await fetch(`/merchant/${data.domain}/api/team`);
    const result = await response.json();
    team = result.team;
  });
</script>

<TeamMembersTable
  members={team}
  currentUserId={data.userId}
  isOwner={data.role === 'owner'}
/>
```

## Related

- [POST /merchant/{domain}/api/team/invite](./team-invite.md) - Invite members
- [Team Management](../../merchant/team-management.md) - Full documentation
- [MerchantDO Schema](../../database/durable-objects.md) - Data structure
