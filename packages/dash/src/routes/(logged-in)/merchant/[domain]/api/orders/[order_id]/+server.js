import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { fetchOrderStatus, enhanceOrderInfo } from '$lib/server/orders.js';

/**
 * GET /merchant/[domain]/api/orders/[order_id]
 * Get a specific order with security check.
 */
export async function GET({ locals, params, platform }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain, order_id: orderId } = params;

	try {
		// Firmly admins have access to all merchants
		if (!isFirmlyAdmin) {
			// Verify user has access to this merchant
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const hasAccess = merchantAccess.some((a) => a.merchant_domain === domain);

			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		// Fetch order with domain filter for security
		const orderStmt = platform.env.reporting.prepare(
			'SELECT * FROM orders WHERE platform_order_number = ? AND shop_id = ?'
		);

		const orderResult = await orderStmt.bind(orderId, domain).first();

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
		const orderStatusData = await fetchOrderStatus(platform, orderId, domain, orderResult.app_id);
		enhanceOrderInfo(orderInfo, orderStatusData);

		const order = {
			...orderResult,
			order_info: orderInfo
		};

		// Fetch destination name
		const destStmt = platform.env.firmlyConfigs.prepare(
			'SELECT info FROM app_identifiers WHERE key = ?'
		);
		const destResult = await destStmt.bind(order.app_id).first();

		let destinationName = order.app_id;
		if (destResult) {
			try {
				const info = JSON.parse(destResult.info);
				destinationName = info.subject || order.app_id;
			} catch {
				// Use app_id as fallback
			}
		}

		// Fetch related orders for navigation (same merchant)
		const relatedOrdersStmt = platform.env.reporting.prepare(
			'SELECT platform_order_number FROM orders WHERE shop_id = ? ORDER BY created_dt DESC LIMIT 20'
		);

		const relatedOrders = await relatedOrdersStmt.bind(domain).all();

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
			destinationName,
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
