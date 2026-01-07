# GET/POST /merchant/{domain}/api/destinations

Manage merchant's destination configuration and view order statistics.

## Use Case

Destinations are the marketplaces (Amazon, eBay, etc.) where a merchant can sell. This endpoint:
- Lists available destinations with the merchant's enabled status
- Shows order statistics per destination
- Allows merchants to update their enabled destinations

## Endpoints

```
GET  /(logged-in)/merchant/[domain]/api/destinations
POST /(logged-in)/merchant/[domain]/api/destinations
```

## Authentication

Session cookie required. User must have access to the specified merchant.

---

## GET /merchant/{domain}/api/destinations

Get all destinations with merchant's configuration and statistics.

### Authorization

All roles (owner, editor, viewer) can view destinations.

### Request

```http
GET /merchant/acme.com/api/destinations
Cookie: session=<jwt>
```

### Response (200)

```json
{
  "destinations": [
    {
      "id": "amazon",
      "name": "Amazon",
      "enabled": true,
      "isComingSoon": false,
      "orders": 150,
      "aov": 89.50,
      "totalRevenue": 13425.00,
      "disputeRate": null,
      "reputationScore": null
    },
    {
      "id": "ebay",
      "name": "eBay",
      "enabled": false,
      "isComingSoon": false,
      "orders": 0,
      "aov": null,
      "totalRevenue": 0,
      "disputeRate": null,
      "reputationScore": null
    },
    {
      "id": "tiktok",
      "name": "TikTok Shop",
      "enabled": false,
      "isComingSoon": true,
      "orders": "Coming Soon",
      "aov": null,
      "totalRevenue": 0,
      "disputeRate": null,
      "reputationScore": null
    }
  ],
  "hasExistingConfig": true
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `destinations` | array | List of destination objects |
| `hasExistingConfig` | boolean | Whether merchant has saved config |

### Destination Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Destination identifier |
| `name` | string | Display name |
| `enabled` | boolean | Whether merchant has enabled |
| `isComingSoon` | boolean | Not yet available |
| `orders` | number/string | Order count or "Coming Soon" |
| `aov` | number | Average order value |
| `totalRevenue` | number | Total revenue |
| `disputeRate` | number | Dispute percentage (future) |
| `reputationScore` | number | Reputation metric (future) |

---

## POST /merchant/{domain}/api/destinations

Update merchant's enabled destinations.

### Authorization

Only **owners** and **editors** can update destinations.

### Request

```http
POST /merchant/acme.com/api/destinations
Content-Type: application/json
Cookie: session=<jwt>
```

```json
{
  "enabledDestinations": ["amazon", "ebay"]
}
```

### Response (200)

```json
{
  "success": true,
  "isFirstTimeSave": false,
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### Errors

**400 - Invalid Input**
```json
{
  "error": "enabledDestinations must be an array"
}
```

**403 - Access Denied**
```json
{
  "error": "Access denied"
}
```

**403 - Insufficient Permissions**
```json
{
  "error": "Insufficient permissions. Only owners and editors can update destinations."
}
```

## Implementation Details

### Access Check (GET)

```javascript
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

### Access Check (POST)

```javascript
if (!isFirmlyAdmin) {
  const access = merchantAccess.find(
    (a) => (a.merchant_domain || a.merchantDomain) === domain
  );
  const role = access?.role;

  if (role !== 'owner' && role !== 'editor') {
    return json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }
}
```

### Order Statistics Query

```javascript
const statsStmt = platform.env.reporting.prepare(`
  SELECT
    app_id,
    COUNT(*) as total_orders,
    SUM(order_total) as total_revenue,
    AVG(order_total) as aov
  FROM orders
  WHERE shop_id = ?
  GROUP BY app_id
`);

const statsResult = await statsStmt.bind(domain).all();
```

### Destination Storage

Merchant's config stored in **MerchantDO**:

```javascript
const result = await updateMerchantDestinations({
  platform,
  merchantDomain: domain,
  enabledDestinations,
  actor: { id: userId, email }
});
```

### First-Time Save Tracking

```javascript
// MerchantDO
async updateDestinations(destinations, actor) {
  const isFirstTimeSave = !this.config.destinationsConfigured;

  this.config.enabledDestinations = destinations;
  this.config.destinationsConfigured = true;

  // Create audit log
  await this.createAuditLog({
    eventType: 'destinations_updated',
    actor,
    details: { destinations }
  });

  await this.persist();
  return { success: true, isFirstTimeSave };
}
```

## Data Sources

| Data | Source |
|------|--------|
| Available destinations | firmlyConfigs D1 (app_identifiers) |
| Merchant config | MerchantDO |
| Order statistics | reporting D1 (orders table) |

## Role Permissions

| Role | View | Update |
|------|------|--------|
| owner | ✅ | ✅ |
| editor | ✅ | ✅ |
| viewer | ✅ | ❌ |
| Firmly admin | ✅ | ✅ |

## Onboarding Context

Destinations configuration is part of the onboarding flow:

```mermaid
flowchart LR
    A[Sign Agreement] --> B[Configure Destinations]
    B --> C[Complete Integration]

    style B fill:#f9f,stroke:#333
```

When `isFirstTimeSave` is true, the UI may:
- Update onboarding progress
- Show congratulatory message
- Advance to next step

## Client Usage

```svelte
<script>
  let destinations = $state([]);
  let enabledIds = $state([]);

  async function loadDestinations() {
    const response = await fetch(`/merchant/${domain}/api/destinations`);
    const data = await response.json();
    destinations = data.destinations;
    enabledIds = destinations.filter(d => d.enabled).map(d => d.id);
  }

  async function saveDestinations() {
    await fetch(`/merchant/${domain}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabledDestinations: enabledIds })
    });
  }
</script>
```

## Related

- [Onboarding](../../merchant/onboarding.md) - Integration steps
- [MerchantDO](../../database/durable-objects.md) - Data structure
- [D1 Schema](../../database/d1-schema.md) - Tables
