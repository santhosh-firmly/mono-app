# API Reference

This section documents all API endpoints in the Firmly Dashboard.

## Base URL

All API endpoints are relative to the dashboard origin (e.g., `https://dash.firmly.ai`).

## Authentication

### Session Cookie

Most endpoints require authentication via a session cookie:

```
Cookie: session=<jwt_token>
```

The JWT token is automatically set after successful login and renewed transparently by the middleware.

### Route Protection

| Route Pattern | Auth Required | Additional Requirements |
|---------------|---------------|------------------------|
| `/api/otp/*`, `/api/magic-link/*` | No | Public auth endpoints |
| `/api/invite/*` | No | Token validation |
| `/(logged-in)/api/*` | Yes | Valid session |
| `/(logged-in)/merchant/[domain]/api/*` | Yes | Merchant access |
| `/(firmly-user-only)/admin/api/*` | Yes | Firmly admin (Azure AD) |

## Request Format

### Content Type

All POST/PUT requests use JSON:

```http
Content-Type: application/json
```

### Request Body

```json
{
  "field": "value"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

Or for data fetching:

```json
{
  "items": [...],
  "total": 100,
  "limit": 25,
  "offset": 0
}
```

### Error Response

```json
{
  "error": "Human-readable error message"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - No valid session |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `409` | Conflict - Resource already exists |
| `410` | Gone - Token expired |
| `429` | Too Many Requests - Rate limited |
| `500` | Internal Server Error |

## Error Handling

### Common Error Patterns

**Validation Error:**
```json
{
  "error": "Email is required"
}
```

**Authentication Error:**
```json
{
  "error": "Invalid or expired session"
}
```

**Permission Error:**
```json
{
  "error": "Only owners can perform this action"
}
```

**Resource Error:**
```json
{
  "error": "No account found with this email"
}
```

## Rate Limiting

All authentication endpoints are rate limited using KV-based counters to prevent brute-force attacks and abuse.

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `POST /api/otp/send` | 3 requests | 1 hour | Email address |
| `POST /api/otp/verify` | 5 attempts | 5 minutes | Email address |
| `POST /api/magic-link/send` | 3 requests | 1 hour | Email address |
| `POST /api/login/otp/send` | 3 requests | 1 hour | Email address |
| `POST /api/login/otp/verify` | 5 attempts | 5 minutes | Email address |
| `POST /api/invite/send-otp` | 3 requests | 1 hour | Invite token |

### Rate Limit Response

When rate limited, endpoints return:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
```

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 1704542400
}
```

For implementation details, see [Security Considerations](../security-considerations.md#rate-limiting).

## API Categories

### Authentication APIs

Public endpoints for login and signup flows.

| Endpoint | Description |
|----------|-------------|
| [POST /api/otp/send](./auth/otp-send.md) | Send OTP code for signup |
| [POST /api/otp/verify](./auth/otp-verify.md) | Verify OTP and create session |
| [POST /api/magic-link/send](./auth/magic-link-send.md) | Send magic link for login |
| [POST /api/magic-link/verify](./auth/magic-link-verify.md) | Verify magic link token |
| [GET /api/invite/verify](./auth/invite-verify.md) | Validate invite token |
| [POST /api/invite/send-otp](./auth/invite-send-otp.md) | Send OTP for invite verification |
| [POST /api/invite/accept](./auth/invite-accept.md) | Accept team invitation |
| [GET /api/auth/logout](./auth/logout.md) | End session and logout |

### User APIs

Endpoints for user profile and session management.

| Endpoint | Description |
|----------|-------------|
| [GET/PUT /api/profile](./user/profile.md) | Get or update user profile |
| [GET/DELETE /api/sessions](./user/sessions.md) | Manage active sessions |

### Merchant APIs

Endpoints for merchant dashboard operations.

| Endpoint | Description |
|----------|-------------|
| [GET /merchant/{domain}/api/team](./merchant/team.md) | Get team members |
| [POST /merchant/{domain}/api/team/invite](./merchant/team-invite.md) | Invite team member |
| [GET /merchant/{domain}/api/orders](./merchant/orders.md) | Get orders |
| [GET/POST /merchant/{domain}/api/destinations](./merchant/destinations.md) | Manage destinations |
| [GET/POST /merchant/{domain}/api/agreement](./merchant/agreement.md) | Agreement signing |
| [GET /merchant/{domain}/api/audit-logs](./merchant/audit-logs.md) | View audit logs |

### Admin APIs

Endpoints for Firmly administrators (Azure AD authenticated).

| Endpoint | Description |
|----------|-------------|
| [GET/POST /admin/api/dashboards](./admin/dashboards.md) | Manage dashboards |
| [POST /admin/api/invites/send](./admin/invites.md) | Send admin invites |
| [POST /admin/api/invites/cancel](./admin/invites.md) | Cancel invites |

## Pagination

List endpoints support pagination:

```
GET /api/endpoint?limit=25&offset=0
```

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `limit` | 25 | 100 | Items per page |
| `offset` | 0 | - | Starting index |

Response includes pagination info:

```json
{
  "items": [...],
  "total": 150,
  "limit": 25,
  "offset": 0
}
```

## Search

Endpoints that support search:

```
GET /api/endpoint?search=query
```

Search behavior varies by endpoint - see individual documentation.

## Related Documentation

- [Routes Overview](../routes/overview.md) - Route structure
- [Authentication](../authentication/overview.md) - Auth flows
- [JWT Sessions](../authentication/jwt-sessions.md) - Token details
- [Security Considerations](../security-considerations.md) - Rate limiting, security headers, known risks
