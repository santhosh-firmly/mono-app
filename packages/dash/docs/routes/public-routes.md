# Public Routes

Public routes handle authentication flows and invite acceptance without requiring a session.

## Route Group: `(logged-out)`

Routes in this group are for unauthenticated users. Authenticated users are redirected to `/`.

## Login Flow

### Login Page (`/login`)

The main login page where users enter their email:

- User chooses between OTP (6-digit code) or Magic Link (clickable link)
- For OTP: Redirects to `/login/otp` with email in query string
- For Magic Link: Shows "check your email" message

### OTP Verification (`/login/otp`)

Enter the 6-digit code:

- Email is passed via query parameter
- User enters code
- On success, session is created and user is redirected to `/`
- On failure, shows error with remaining attempts

### Magic Link Verification (`/login/verify`)

Handles magic link clicks:

- Token is extracted from URL
- Automatically verifies on page load
- On success, redirects to `/` (or specific merchant if stored in token)
- On failure, shows error with option to try again

## Signup Flow

### Email Verification (`/signup/verify-email`)

Verify email during signup process.

### Domain Verification (`/signup/verify-domain`)

Verify merchant domain ownership.

## Public Auth APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/otp/send` | POST | Send OTP code |
| `/api/otp/verify` | POST | Verify OTP code |
| `/api/magic-link/send` | POST | Send magic link |
| `/api/magic-link/verify` | POST | Verify magic link |
| `/api/login/otp/send` | POST | Send login OTP |
| `/api/login/otp/verify` | POST | Verify login OTP |

### OTP Send Flow

1. Check if user exists in D1
2. Generate 6-digit random code
3. Store in KV with 5-minute TTL and attempt counter
4. Send email via MailerSend

### OTP Verify Flow

1. Retrieve stored OTP from KV
2. Check attempt count (max 3)
3. Verify code matches
4. Delete OTP from KV
5. Create session in DashUserDO
6. Set JWT cookie
7. Return success

## Invite Routes (Root Level)

Invite routes are at the root level (not in a route group) for public access.

### Invite Landing (`/invite`)

When user clicks invite link:

1. Validate token exists in KV
2. Check if user already has an account
3. If existing user: Show accept button
4. If new user: Redirect to profile setup (`/invite/profile`)

### New User Profile (`/invite/profile`)

For new users accepting an invite:

1. Validate token
2. Display profile form (name, company, etc.)
3. On submit: Create user, grant access, create session
4. Redirect to merchant dashboard

### Invite Accept API

The `/api/invite/accept` endpoint handles:

1. Validate token and expiration
2. Get or create user account
3. Grant merchant access (updates D1, DashUserDO, MerchantDO)
4. Add to merchant team
5. Delete invite tokens from KV
6. Create session and set cookie
7. Return redirect URL

## Redirect Behavior

### Authenticated Users on Login Pages

`hooks.server.js` redirects authenticated users away from login pages. If a user with a valid session visits `/login` or `/signup`, they are redirected to `/`.

### Post-Login Redirect

After successful login, users go to `/` where smart redirect logic applies:
- 1 dashboard → Direct to `/merchant/{domain}`
- 0 or 2+ dashboards → Show selection grid

## Related Documentation

- [Routes Overview](./overview.md) - Route structure
- [OTP Login](../authentication/otp-login.md) - OTP flow details
- [Magic Link](../authentication/magic-link.md) - Magic link details
- [Invite System](../authentication/invite-system.md) - Invite flow
