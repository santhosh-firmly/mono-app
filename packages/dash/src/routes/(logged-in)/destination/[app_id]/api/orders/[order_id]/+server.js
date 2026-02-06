import { json } from '@sveltejs/kit';
import { getDestinationAccess, getAccessibleMerchants } from '$lib/server/destination.js';
import { fetchOrderStatus, enhanceOrderInfo } from '$lib/server/orders.js';

/**
 * GET /destination/[app_id]/api/orders/[order_id]
 * Get a specific order with security check.
 */
export async function GET({ locals, params, platform }) {
	const { session } = locals;
	const { app_id: appId, order_id: orderId } = params;

	try {
		// Verify user has access to this destination (unless Firmly admin)
		if (!session?.isFirmlyAdmin) {
			const access = await getDestinationAccess({ platform, userId: session.userId });
			const hasAccess = access.some((a) => a.app_id === appId);
			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		const firmlyConfigs = platform?.env?.firmlyConfigs;
		const reporting = platform?.env?.reporting;

		if (!firmlyConfigs || !reporting) {
			return json({ error: 'Database not configured' }, { status: 500 });
		}

		// Get accessible merchants for this destination
		const accessible = await getAccessibleMerchants({ platform, appId });
		if (accessible.length === 0) {
			return json({ error: 'No accessible merchants' }, { status: 403 });
		}

		const merchantMap = new Map(accessible.map((m) => [m.domain, m.displayName]));
		const merchantDomains = accessible.map((m) => m.domain);
		const placeholders = merchantDomains.map(() => '?').join(',');

		// Fetch order with app_id and merchant filter for security
		const orderResult = await reporting
			.prepare(
				`SELECT * FROM orders
				 WHERE platform_order_number = ?
				 AND app_id = ?
				 AND shop_id IN (${placeholders})`
			)
			.bind(orderId, appId, ...merchantDomains)
			.first();

		if (!orderResult) {
			return json({ error: 'Order not found' }, { status: 404 });
		}

		// Parse order_info JSON
		let orderInfo;
		try {
			orderInfo = JSON.parse(orderResult.order_info);
		} catch {
			return json({ error: 'Failed to parse order data' }, { status: 500 });
		}

		// Fetch order status from orders-service and enhance order_info
		const orderStatusData = await fetchOrderStatus(platform, orderId, orderResult.shop_id, appId);
		enhanceOrderInfo(orderInfo, orderStatusData);

		const order = {
			...orderResult,
			order_info: orderInfo
		};

		// Get merchant name
		const merchantName = merchantMap.get(order.shop_id) || order.shop_id;

		// Fetch related orders for navigation (same destination, all merchants)
		const relatedOrders = await reporting
			.prepare(
				`SELECT platform_order_number FROM orders
				 WHERE app_id = ? AND shop_id IN (${placeholders})
				 ORDER BY created_dt DESC LIMIT 20`
			)
			.bind(appId, ...merchantDomains)
			.all();

		// Find current order index for navigation
		const currentIndex = relatedOrders.results.findIndex(
			(o) => o.platform_order_number === order.platform_order_number
		);

		const prevOrder = currentIndex > 0 ? relatedOrders.results[currentIndex - 1] : null;
		const nextOrder =
			currentIndex < relatedOrders.results.length - 1
				? relatedOrders.results[currentIndex + 1]
				: null;

		return json({
			order,
			merchantName,
			navigation: {
				prevOrder,
				nextOrder,
				currentIndex: currentIndex + 1,
				totalOrders: relatedOrders.results.length
			}
		});
	} catch (error) {
		console.error('Error fetching order:', error);
		return json({ error: 'Failed to fetch order' }, { status: 500 });
	}
}
