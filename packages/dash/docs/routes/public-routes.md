# Public Routes

Public routes handle authentication flows and invite acceptance without requiring a session.

## Route Group: `(logged-out)`

Routes in this group are for unauthenticated users. Authenticated users are redirected to `/`.

## Login Flow

### Login Page (`/login`)

The main login page where users enter their email:

```svelte
<!-- routes/(logged-out)/login/+page.svelte -->
<script>
  import LoginCard from '$lib/components/auth/login-card.svelte';

  async function handleOTP(email) {
    const response = await fetch('/api/otp/send', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      goto(`/login/otp?email=${encodeURIComponent(email)}`);
    }
  }

  async function handleMagicLink(email) {
    const response = await fetch('/api/magic-link/send', {
      method: 'POST',
      body: JSON.stringify({ email })
    });

    if (response.ok) {
      // Show "check your email" message
    }
  }
</script>

<LoginCard
  onotp={handleOTP}
  onmagiclink={handleMagicLink}
/>
```

### OTP Verification (`/login/otp`)

Enter the 6-digit code:

```svelte
<!-- routes/(logged-out)/login/otp/+page.svelte -->
<script>
  import OTPVerificationCard from '$lib/components/auth/otp-verification-card.svelte';

  let email = $derived(new URLSearchParams(location.search).get('email'));

  async function verifyOTP(code) {
    const response = await fetch('/api/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code })
    });

    if (response.ok) {
      goto('/'); // Smart redirect happens server-side
    }
  }
</script>

<OTPVerificationCard
  {email}
  onverify={verifyOTP}
/>
```

### Magic Link Verification (`/login/verify`)

Handles magic link clicks:

```svelte
<!-- routes/(logged-out)/login/verify/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import VerificationStatusCard from '$lib/components/auth/verification-status-card.svelte';

  let status = $state('verifying');
  let error = $state('');

  onMount(async () => {
    const token = new URLSearchParams(location.search).get('token');

    const response = await fetch('/api/magic-link/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      const { redirectUrl } = await response.json();
      goto(redirectUrl || '/');
    } else {
      status = 'error';
      error = 'Invalid or expired link';
    }
  });
</script>

<VerificationStatusCard {status} {error} />
```

## Signup Flow

### Email Verification (`/signup/verify-email`)

Verify email during signup:

```svelte
<!-- routes/(logged-out)/signup/verify-email/+page.svelte -->
```

### Domain Verification (`/signup/verify-domain`)

Verify merchant domain ownership:

```svelte
<!-- routes/(logged-out)/signup/verify-domain/+page.svelte -->
```

## Public Auth APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/otp/send` | POST | Send OTP code |
| `/api/otp/verify` | POST | Verify OTP code |
| `/api/magic-link/send` | POST | Send magic link |
| `/api/magic-link/verify` | POST | Verify magic link |
| `/api/login/otp/send` | POST | Send login OTP |
| `/api/login/otp/verify` | POST | Verify login OTP |

### OTP Send

```javascript
// routes/(logged-out)/api/otp/send/+server.js
export async function POST({ request, platform }) {
  const { email } = await request.json();

  // Check user exists
  const exists = await userExists({ platform, email });
  if (!exists) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  // Generate and store OTP
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await platform.env.OTP_STORE.put(
    `otp:${email}`,
    JSON.stringify({ code, attempts: 0 }),
    { expirationTtl: 300 }
  );

  // Send email
  await sendOTPEmail(email, code, platform.env.MAILERSEND_API_KEY);

  return json({ success: true });
}
```

### OTP Verify

```javascript
// routes/(logged-out)/api/otp/verify/+server.js
export async function POST({ request, platform, cookies }) {
  const { email, code } = await request.json();

  // Get stored OTP
  const stored = await platform.env.OTP_STORE.get(`otp:${email}`);
  if (!stored) {
    return json({ error: 'Code expired' }, { status: 400 });
  }

  const data = JSON.parse(stored);

  // Check attempts
  if (data.attempts >= 3) {
    await platform.env.OTP_STORE.delete(`otp:${email}`);
    return json({ error: 'Too many attempts' }, { status: 429 });
  }

  // Verify code
  if (code !== data.code) {
    await platform.env.OTP_STORE.put(
      `otp:${email}`,
      JSON.stringify({ ...data, attempts: data.attempts + 1 }),
      { expirationTtl: 300 }
    );
    return json({ error: 'Invalid code' }, { status: 400 });
  }

  // Delete OTP and create session
  await platform.env.OTP_STORE.delete(`otp:${email}`);

  const user = await getUser({ platform, email });
  const { token } = await createSession({
    platform,
    userId: user.userId,
    email,
    userAgent: request.headers.get('user-agent'),
    ipAddress: request.headers.get('cf-connecting-ip'),
    jwtSecret: platform.env.JWT_SECRET
  });

  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  });

  return json({ success: true });
}
```

## Invite Routes (Root Level)

Invite routes are at the root level (not in a route group) for public access.

### Invite Landing (`/invite`)

```javascript
// routes/invite/+page.server.js
export async function load({ url, platform }) {
  const token = url.searchParams.get('token');

  // Validate token
  const stored = await platform.env.OTP_STORE.get(`invite:${token}`);
  if (!stored) {
    return { error: 'Invalid or expired invitation' };
  }

  const invite = JSON.parse(stored);

  // Check if user exists
  const existingUser = await getUserIdByEmail({ platform, email: invite.email });

  return {
    invite,
    userExists: !!existingUser,
    token
  };
}
```

```svelte
<!-- routes/invite/+page.svelte -->
<script>
  let { data } = $props();

  async function acceptInvite() {
    const response = await fetch('/api/invite/accept', {
      method: 'POST',
      body: JSON.stringify({ token: data.token })
    });

    if (response.ok) {
      const { redirectUrl } = await response.json();
      goto(redirectUrl);
    }
  }
</script>

{#if data.error}
  <ErrorCard message={data.error} />
{:else if data.userExists}
  <InviteCard invite={data.invite} onaccept={acceptInvite} />
{:else}
  <!-- Redirect to profile setup -->
  <script>goto(`/invite/profile?token=${data.token}`)</script>
{/if}
```

### New User Profile (`/invite/profile`)

For new users accepting an invite:

```javascript
// routes/invite/profile/+page.server.js
export async function load({ url, platform }) {
  const token = url.searchParams.get('token');

  const stored = await platform.env.OTP_STORE.get(`invite:${token}`);
  if (!stored) {
    redirect(302, '/invite?error=invalid');
  }

  const invite = JSON.parse(stored);
  return { invite, token };
}
```

```svelte
<!-- routes/invite/profile/+page.svelte -->
<script>
  let profile = $state({ name: '', company: '' });

  async function submit() {
    const response = await fetch('/api/invite/accept', {
      method: 'POST',
      body: JSON.stringify({
        token: data.token,
        profile
      })
    });

    if (response.ok) {
      const { redirectUrl } = await response.json();
      goto(redirectUrl);
    }
  }
</script>

<ProfileEditCard bind:profile onsubmit={submit} />
```

### Invite Accept API

```javascript
// routes/api/invite/accept/+server.js
export async function POST({ request, platform, cookies }) {
  const { token, profile } = await request.json();

  // Get invite
  const stored = await platform.env.OTP_STORE.get(`invite:${token}`);
  if (!stored) {
    return json({ error: 'Invalid invitation' }, { status: 400 });
  }

  const invite = JSON.parse(stored);

  // Create or get user
  const user = await getOrCreateUser({
    platform,
    email: invite.email,
    profile: profile || {}
  });

  // Grant merchant access
  await grantMerchantAccess({
    platform,
    userId: user.userId,
    userEmail: invite.email,
    merchantDomain: invite.merchantDomain,
    role: invite.role,
    grantedBy: invite.invitedBy
  });

  // Add to merchant team
  await addTeamMember({
    platform,
    merchantDomain: invite.merchantDomain,
    userId: user.userId,
    userEmail: invite.email,
    role: invite.role,
    grantedBy: invite.invitedBy
  });

  // Delete invite
  await platform.env.OTP_STORE.delete(`invite:${token}`);

  // Create session
  const { token: sessionToken } = await createSession({
    platform,
    userId: user.userId,
    email: invite.email,
    userAgent: request.headers.get('user-agent'),
    ipAddress: request.headers.get('cf-connecting-ip'),
    jwtSecret: platform.env.JWT_SECRET
  });

  cookies.set('session', sessionToken, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60
  });

  return json({
    success: true,
    redirectUrl: `/merchant/${invite.merchantDomain}`
  });
}
```

## Redirect Behavior

### Authenticated Users on Login Pages

`hooks.server.js` redirects authenticated users away from login pages:

```javascript
if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
  if (userSession) {
    redirect(302, '/');
  }
  return resolve(event);
}
```

### Post-Login Redirect

After successful login, users go to `/` where smart redirect logic applies:
- 1 dashboard → Direct to `/merchant/{domain}`
- 0 or 2+ dashboards → Show selection grid

## Related Documentation

- [Routes Overview](./overview.md) - Route structure
- [OTP Login](../authentication/otp-login.md) - OTP flow details
- [Magic Link](../authentication/magic-link.md) - Magic link details
- [Invite System](../authentication/invite-system.md) - Invite flow
- [API: Auth](../api/auth/) - Auth API endpoints
