# GET /merchant/{domain}/api/orders

Get orders for a merchant with pagination and search.

## Use Case

Retrieves order data for merchant dashboards, allowing users to view their transaction history.

## Endpoint

```
GET /(logged-in)/merchant/[domain]/api/orders
```

## Authentication

Session cookie required. User must have access to the specified merchant.

## Authorization

- **All roles** (owner, editor, viewer): Can view orders
- **Firmly admins**: Can view any merchant's orders

## Request

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `domain` | string | Merchant domain (e.g., `acme.com`) |

### Query Parameters

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | number | 25 | 100 | Items per page |
| `offset` | number | 0 | - | Starting index |
| `search` | string | - | - | Search by order number |

### Example

```http
GET /merchant/acme.com/api/orders?limit=25&offset=0&search=ORD-123
Cookie: session=<jwt>
```

## Response

### Success (200)

```json
{
  "orders": [
    {
      "id": "ord_abc123",
      "shop_id": "acme.com",
      "app_id": "amazon",
      "platform_order_number": "ORD-12345",
      "order_total": 149.99,
      "currency": "USD",
      "status": "completed",
      "created_dt": "2024-01-15T10:30:00Z",
      "order_info": {
        "customer": {
          "email": "customer@example.com",
          "name": "John Doe"
        },
        "items": [
          {
            "name": "Product A",
            "quantity": 2,
            "price": 49.99
          }
        ],
        "shipping": {
          "method": "Standard",
          "address": {
            "city": "San Francisco",
            "country": "US"
          }
        }
      }
    }
  ],
  "destinations": [
    { "key": "amazon", "name": "Amazon" },
    { "key": "ebay", "name": "eBay" }
  ],
  "total": 150,
  "limit": 25,
  "offset": 0
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `orders` | array | List of order objects |
| `destinations` | array | Available destination mappings |
| `total` | number | Total matching orders |
| `limit` | number | Items per page |
| `offset` | number | Current offset |

### Order Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Order identifier |
| `shop_id` | string | Merchant domain |
| `app_id` | string | Destination identifier |
| `platform_order_number` | string | External order reference |
| `order_total` | number | Order total amount |
| `currency` | string | Currency code |
| `status` | string | Order status |
| `created_dt` | string | Creation timestamp |
| `order_info` | object | Detailed order data |

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
  "error": "Failed to fetch orders"
}
```

## Implementation Details

### Access Check

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

### Query Construction

```javascript
// ALWAYS filter by shop_id for security
let ordersQuery = 'SELECT * FROM orders WHERE shop_id = ?';
let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE shop_id = ?';
const params = [domain];

if (search) {
  ordersQuery += ' AND platform_order_number LIKE ?';
  countQuery += ' AND platform_order_number LIKE ?';
  params.push(`%${search}%`);
}

ordersQuery += ' ORDER BY created_dt DESC LIMIT ? OFFSET ?';
```

### Data Sources

Orders come from the **reporting database** (D1):

```javascript
const [ordersResult, countResult, destinationsResult] = await Promise.all([
  platform.env.reporting.prepare(ordersQuery).bind(...params, limit, offset).all(),
  platform.env.reporting.prepare(countQuery).bind(...params).first(),
  platform.env.firmlyConfigs.prepare('SELECT key, info FROM app_identifiers').all()
]);
```

### JSON Parsing

Order info is stored as JSON string:

```javascript
const orders = ordersResult.results
  .map((order) => {
    try {
      return {
        ...order,
        order_info: JSON.parse(order.order_info)
      };
    } catch {
      return null;
    }
  })
  .filter(Boolean);
```

## Security Considerations

1. **Always filter by shop_id**: Never allow cross-merchant queries
2. **Input sanitization**: Search term wrapped in LIKE wildcards
3. **Limit enforcement**: Max 100 items per request
4. **Access verification**: Every request checks merchant access

## Pagination

Client-side pagination example:

```javascript
let page = $state(1);
let limit = 25;

$effect(() => {
  const offset = (page - 1) * limit;
  fetchOrders({ limit, offset });
});

function fetchOrders({ limit, offset, search }) {
  const params = new URLSearchParams({ limit, offset });
  if (search) params.set('search', search);

  return fetch(`/merchant/${domain}/api/orders?${params}`);
}
```

## Client Usage

```svelte
<script>
  import DataTable from '$lib/components/custom/data-table/data-table.svelte';

  let orders = $state([]);
  let total = $state(0);
  let loading = $state(true);

  async function loadOrders() {
    const response = await fetch(`/merchant/${domain}/api/orders`);
    const data = await response.json();
    orders = data.orders;
    total = data.total;
    loading = false;
  }
</script>

<DataTable
  data={orders}
  columns={orderColumns}
  searchable
  paginated
  {total}
/>
```

## Related

- [GET /merchant/{domain}/api/orders/{id}](./orders.md#get-single-order) - Single order
- [Merchant Dashboard](../../routes/user-routes.md) - Orders page
- [D1 Schema](../../database/d1-schema.md) - Orders table
