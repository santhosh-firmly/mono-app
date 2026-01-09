# GET/PUT /api/profile

Retrieve or update the current user's profile information.

## Use Case

Allows users to view and update their profile details stored in DashUserDO.

## Endpoints

```
GET  /(logged-in)/api/profile
PUT  /(logged-in)/api/profile
```

## Authentication

Session cookie required.

---

## GET /api/profile

Retrieve the current user's profile.

### Request

```http
GET /api/profile
Cookie: session=<jwt>
```

### Response (200)

```json
{
  "name": "John Smith",
  "company": "Acme Corp",
  "title": "Operations Manager",
  "location": "San Francisco, CA",
  "email": "john@acme.com",
  "avatarUrl": "https://r2.firmly.ai/avatars/usr_abc123.jpg"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | User's full name |
| `company` | string | Company name |
| `title` | string | Job title |
| `location` | string | Location/city |
| `email` | string | Email address (read-only) |
| `avatarUrl` | string | Profile image URL (if set) |

---

## PUT /api/profile

Update the current user's profile.

### Request

```http
PUT /api/profile
Content-Type: application/json
Cookie: session=<jwt>
```

### Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | User's full name |
| `company` | string | No | Company name |
| `title` | string | No | Job title |
| `location` | string | No | Location/city |

Only provided fields are updated. Omitted fields remain unchanged.

### Example

```json
{
  "name": "John Smith",
  "title": "Senior Operations Manager"
}
```

### Response (200)

```json
{
  "success": true,
  "profile": {
    "name": "John Smith",
    "company": "Acme Corp",
    "title": "Senior Operations Manager",
    "location": "San Francisco, CA"
  }
}
```

### Errors

**400 - No Valid Fields**
```json
{
  "error": "No valid fields to update"
}
```

## Implementation Details

### Field Validation

Only whitelisted fields are accepted:

```javascript
const allowedFields = ['name', 'company', 'title', 'location'];
const filteredUpdates = {};

for (const field of allowedFields) {
  if (updates[field] !== undefined) {
    filteredUpdates[field] = String(updates[field]).trim();
  }
}
```

### Storage

Profile data stored in DashUserDO:

```javascript
// Get profile
const profile = await getProfile({ platform, userId });

// Update profile
const updatedProfile = await updateProfile({
  platform,
  userId,
  profile: filteredUpdates
});
```

### DashUserDO Operations

```javascript
// In DashUserDO
async getProfile() {
  return {
    name: this.profile.name || '',
    company: this.profile.company || '',
    title: this.profile.title || '',
    location: this.profile.location || '',
    email: this.email,
    avatarUrl: this.profile.avatarUrl || null
  };
}

async updateProfile(updates) {
  this.profile = { ...this.profile, ...updates };
  await this.persist();
  return this.getProfile();
}
```

## Read-Only Fields

These fields cannot be updated via this endpoint:

| Field | Reason |
|-------|--------|
| `email` | Changed through separate flow |
| `avatarUrl` | Updated via `/api/profile/avatar` |
| `userId` | System-generated, immutable |

## Client Usage

### Fetch Profile

```javascript
const response = await fetch('/api/profile');
const profile = await response.json();
```

### Update Profile

```javascript
const response = await fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Smith',
    title: 'Senior Manager'
  })
});

const { profile } = await response.json();
```

## Security Considerations

1. **Field whitelist**: Only allowed fields accepted
2. **String sanitization**: Values trimmed
3. **Session-bound**: Only updates own profile
4. **No email change**: Prevents account takeover

## Related

- [GET/DELETE /api/sessions](./sessions.md) - Session management
- [User Profile Page](../routes/user-routes.md#profile) - Profile UI
