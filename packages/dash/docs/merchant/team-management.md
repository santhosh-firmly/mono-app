# Team Management

Team management allows dashboard owners to invite members, assign roles, and control access to merchant dashboards.

## Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `owner` | Dashboard owner (original invitee) | Full access + team management |
| `editor` | Team member with edit rights | Edit settings, manage orders |
| `viewer` | Read-only access | View orders and settings |

### Role Permissions Matrix

| Action | Owner | Editor | Viewer |
|--------|-------|--------|--------|
| View orders | Yes | Yes | Yes |
| View destinations | Yes | Yes | Yes |
| View settings | Yes | Yes | Yes |
| Edit settings | Yes | Yes | No |
| Manage destinations | Yes | Yes | No |
| View audit logs | Yes | Yes | Yes |
| Invite team members | Yes | No | No |
| Remove team members | Yes | No | No |
| Change member roles | Yes | No | No |
| Sign agreement | Yes | No | No |

## Data Storage

Team data is stored in multiple places using the dual-write pattern:

```mermaid
graph TB
    subgraph "Write Operations"
        API[Team API] -->|1. Write| MerchantDO
        API -->|2. Write| DashUserDO
        API -->|3. Write| D1
    end

    subgraph "Read Operations"
        MerchantTeamRead[Get Team List] -->|Fast query| MerchantDO
        AdminQuery[Admin Query] -->|All teams| D1
        UserAccess[User's Dashboards] -->|Per-user| DashUserDO
    end
```

### Storage Locations

| Location | Purpose |
|----------|---------|
| **MerchantDO** `team` | Per-merchant team list, stores user_id, email, role, granted_at, granted_by |
| **DashUserDO** `merchant_access` | Per-user merchant access list, stores merchant_domain, role, granted_at |
| **D1** `merchant_team` | Global index for admin queries, stores composite key of merchant_domain + user_id |

## Team Operations

### Getting Team Members

Fetch from MerchantDO `/team` endpoint. Returns list with userId, email, role, grantedAt, grantedBy.

### Adding Team Members

Members are added through the invite system:

1. Add to MerchantDO team table
2. Add to user's DashUserDO merchant_access table
3. Create audit log

### Updating Roles

1. Update in MerchantDO
2. Update in user's DashUserDO
3. Create audit log

### Removing Team Members

1. Remove from MerchantDO
2. Remove from user's DashUserDO
3. Create audit log

## Team Invite Flow

```mermaid
sequenceDiagram
    participant Owner
    participant API as Team API
    participant KV as KV Store
    participant Email as MailerSend
    participant Invitee

    Owner->>API: POST /merchant/{domain}/api/team/invite
    API->>KV: Store invite token (7 days)
    API->>Email: Send invite email
    API-->>Owner: Success

    Invitee->>Invitee: Click email link
    Invitee->>API: POST /api/invite/accept
    API->>API: Add to team (dual-write)
    API->>API: Create audit log
    API-->>Invitee: Redirect to dashboard
```

## Team Page UI

The team management page (`/merchant/{domain}/team`) shows:

1. **Team members table** with:
   - Name/email
   - Role badge
   - Join date
   - Actions (change role, remove)

2. **Invite dialog** (owner only):
   - Email input
   - Role selector
   - Send button

3. **Pending invites** (owner only):
   - Pending invite list
   - Cancel button for each

## Authorization Checks

All team operations verify the user has permission:

- Check if user is owner or Firmly admin
- If not owner and not admin, return 403 Forbidden

## Self-Removal Prevention

Owners cannot remove themselves to prevent orphaned dashboards.

## Related Documentation

- [Dashboard System](./dashboard-system.md) - Dashboard overview
- [Invite System](../authentication/invite-system.md) - Invitation flow
- [Audit Logs](./audit-logs.md) - Team action logging
