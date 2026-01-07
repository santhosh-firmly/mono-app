# Security Considerations

This document outlines security considerations, known risks, and recommendations for the Firmly Dashboard application before going to production.

## Authentication Architecture

### Hybrid Authentication System

The dashboard uses a hybrid authentication approach:

1. **Azure AD SSO** - For Firmly internal admins
   - OIDC flow with JWKS validation
   - Admins have elevated access to all merchant dashboards

2. **JWT Sessions** - For merchant users
   - HS256 signed tokens with 30-minute expiry
   - 7-day renewal window for seamless UX
   - Sessions validated against DashUserDO

### Cookie Security Settings

All session cookies use secure defaults:
```javascript
{
  httpOnly: true,    // Prevents XSS from stealing tokens
  secure: true,      // HTTPS only
  sameSite: 'lax',   // CSRF protection
  maxAge: 7 days     // JWT renewed within this window
}
```

## Known Risks & Mitigations

### 1. Auto-Domain Merchant Access (HIGH RISK)

**Status:** Feature kept for onboarding convenience, requires mitigation before production.

**Description:** When a user signs up via OTP with email `user@company.com`, they are automatically granted **owner** access to the `company.com` merchant dashboard.

**Files:**
- `src/routes/(logged-out)/api/otp/verify/+server.js:85`
- `src/routes/(logged-out)/api/magic-link/verify/+server.js`
- `src/routes/(logged-out)/api/login/otp/verify/+server.js`

**Risk:** Any attacker with a corporate email can claim ownership of that domain's merchant dashboard.

**Recommended Mitigations (Pick One):**
1. **Domain Verification** - Require DNS TXT record verification before granting owner access
2. **Admin Approval** - Queue auto-domain requests for Firmly admin approval
3. **Viewer-Only Default** - Grant viewer role instead of owner, require upgrade process
4. **Remove Feature** - Only grant access via explicit invites

### 2. Durable Object Security Model (ACCEPTED RISK)

**Status:** Accepted - relying on Cloudflare service binding security.

**Description:** DashUserDO and MerchantDO accept requests based solely on HTTP headers (`X-User-ID`, `X-Merchant-Domain`) without additional authentication.

**Files:**
- `packages/dash-do/src/index.js`
- `packages/dash-do/src/DashUserDO.js`
- `packages/dash-do/src/MerchantDO.js`

**Security Model:**
- DOs are only accessible via service binding from the dash app
- Service bindings are internal to Cloudflare and not publicly routable
- Request authentication happens in the SvelteKit layer

**Assumptions:**
- Cloudflare service bindings cannot be accessed externally
- The dash app properly validates all requests before calling DOs

### 3. PII in Audit Logs (DOCUMENTATION)

**Status:** Documented for compliance awareness.

**Description:** Audit logs store client IP addresses, browser info, and location in plaintext.

**Data Stored:**
- Client IP (from `CF-Connecting-IP` header)
- Browser user agent (truncated to 100 chars)
- Client location (from Cloudflare geolocation)

**Compliance Considerations:**
- May require disclosure in privacy policy
- Consider log retention policy (auto-delete after N days)
- IP addresses may be considered PII under GDPR

### 4. Session IP Not Validated (DOCUMENTATION)

**Status:** Documented - feature not implemented.

**Description:** Session IP addresses are stored but not validated on subsequent requests.

**Impact:** Session hijacking from different IP goes undetected.

**Future Enhancement:** Consider IP anomaly detection or optional IP-pinned sessions.

## Implemented Security Controls

### Rate Limiting

All authentication endpoints are rate limited using KV-based counters:

| Endpoint | Limit | Window |
|----------|-------|--------|
| OTP Send (signup) | 3 requests | 1 hour |
| OTP Verify | 5 attempts | 5 minutes |
| Magic Link Send | 3 requests | 1 hour |
| Login OTP Send | 3 requests | 1 hour |
| Login OTP Verify | 5 attempts | 5 minutes |
| Invite OTP Send | 3 requests | 1 hour |

Implementation: `src/lib/server/rate-limit.js`

### OTP Security

- 6-digit codes with 5-minute expiry
- Single-use (deleted after verification)
- Stored in Cloudflare KV with TTL
- Rate limited to prevent brute force

### Invite Flow Security

- New users must verify email via OTP before accepting invites
- Prevents token theft attacks (link sharing, email forwarding)
- Single-use invite tokens
- 7-day token expiry

### SQL Injection Protection

All database queries use parameterized statements:
- D1 queries use `.prepare().bind().run()` pattern
- DO queries use `.exec(sql, ...params)` pattern

### Role-Based Access Control

Three merchant roles with increasing permissions:
1. **Viewer** - Read-only access
2. **Editor** - Can modify merchant settings
3. **Owner** - Full control including team management

## Pre-Launch Security Checklist

Before going to production, ensure:

- [ ] Auto-domain access risk is mitigated (see section 1)
- [ ] Security headers are configured (CSP, X-Frame-Options, etc.)
- [ ] CORS is explicitly configured if needed
- [ ] Log retention policy is defined
- [ ] Privacy policy covers audit log data
- [ ] JWT_SECRET is strong (256+ bits of entropy)
- [ ] All environment secrets are securely stored
- [ ] Rate limit thresholds are appropriate for expected traffic
- [ ] Session revocation mechanism is tested
- [ ] Error messages don't leak sensitive information

## Security Headers (Recommended)

Add to `hooks.server.js`:

```javascript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'...",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## Contact

For security concerns or vulnerability reports, contact the Firmly security team.
