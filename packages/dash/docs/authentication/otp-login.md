# OTP Login

OTP (One-Time Password) authentication sends a 6-digit code via email for passwordless login.

## Flow Overview

```mermaid
sequenceDiagram
    participant User
    participant Client as Browser
    participant API as API Server
    participant KV as KV Store
    participant Email as MailerSend
    participant DO as DashUserDO

    User->>Client: Enter email at /login
    Client->>API: POST /api/otp/send

    API->>API: Check user exists in D1
    alt User doesn't exist
        API-->>Client: Error: User not found
    end

    API->>API: Generate 6-digit code
    API->>KV: Store otp:{email} with 5-min TTL
    API->>Email: Send OTP email
    API-->>Client: Success

    User->>Client: Enter OTP code
    Client->>API: POST /api/otp/verify

    API->>KV: Get otp:{email}
    alt Code invalid or expired
        API->>KV: Increment attempts
        API-->>Client: Error: Invalid code
    end

    API->>KV: Delete otp:{email}
    API->>API: Get/create user in D1
    API->>DO: Create session
    API->>API: Issue JWT
    API-->>Client: Set-Cookie + redirect
```

## KV Storage

OTP codes are stored in KV with automatic expiration:

- **Key format**: `otp:{email}`
- **Value**: JSON object containing the 6-digit code and attempt counter
- **TTL**: 5 minutes

## How It Works

### Sending OTP

1. User enters email on login page
2. Server checks if user exists in D1 database
3. If user exists, generate a random 6-digit numeric code
4. Store code in KV with 5-minute TTL and zero attempt counter
5. Send email via MailerSend with the code

### Verifying OTP

1. User enters the 6-digit code
2. Server retrieves stored OTP from KV
3. If code doesn't exist, return "Code expired" error
4. If attempt count exceeds 3, invalidate code and return "Too many attempts"
5. If code doesn't match, increment attempt counter and return error
6. If code matches, delete from KV, create session, issue JWT, set cookie

## Rate Limiting

| Limit | Value | Action on Exceed |
|-------|-------|------------------|
| Code expiry | 5 minutes | Must request new code |
| Max attempts | 3 | Code invalidated, must request new |

## Security Considerations

### Why 6-Digit Codes?

- **Brute force resistant** - 1 million combinations
- **User-friendly** - Easy to type on mobile
- **Industry standard** - Familiar to users

### Why 5-Minute Expiry?

- **Short window** - Limits exposure if email intercepted
- **Long enough** - Time to switch apps and type code
- **Balance** - Security vs. UX

### Why 3 Attempts?

- **Prevents brute force** - Even with 3 attempts, only 0.0003% chance of guessing
- **Forgiving** - Allows for typos
- **Simple recovery** - Just request a new code

## Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 404 | User not found | Email not registered |
| 400 | Code expired | OTP TTL exceeded |
| 400 | Invalid code | Wrong code entered |
| 429 | Too many attempts | 3+ failed attempts |
| 500 | Failed to send email | MailerSend error |

## Related Documentation

- [Authentication Overview](./overview.md)
- [Magic Link](./magic-link.md) - Alternative login method
- [JWT Sessions](./jwt-sessions.md) - Session created after verification
