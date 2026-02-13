import { error } from '@sveltejs/kit';
import { fetchOrderStatus, enhanceOrderInfo } from '$lib/server/orders.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const orderId = params.order_id;

	// Fetch the specific order from the database
	const orderStmt = platform.env.reporting.prepare(
		'SELECT * FROM orders WHERE platform_order_number = ?'
	);
	const merchantsStmt = platform.env.firmlyConfigs.prepare('SELECT info FROM stores');
	const partnersStmt = platform.env.firmlyConfigs.prepare(
		'SELECT key, info FROM app_identifiers'
	);

	const [orderResult, merchantsResult, partnersResult] = await Promise.all([
		orderStmt.bind(orderId).first(),
		merchantsStmt.all(),
		partnersStmt.all()
	]);

	if (!orderResult) {
		throw error(404, 'Order not found');
	}

	// Parse the order_info JSON
	let orderInfo;
	try {
		orderInfo = JSON.parse(orderResult.order_info);
	} catch {
		throw error(500, 'Failed to parse order data');
	}

	// Fetch order status from orders-service and enhance order_info
	const orderStatusData = await fetchOrderStatus(
		platform,
		orderId,
		orderResult.shop_id,
		orderResult.app_id
	);
	enhanceOrderInfo(orderInfo, orderStatusData);

	// Build merchant map
	const merchantMap = new Map();
	for (const row of merchantsResult.results) {
		try {
			const info = JSON.parse(row.info);
			if (info.store_id) {
				merchantMap.set(info.store_id, info.display_name || info.store_id);
			}
		} catch {
			// Skip malformed data
		}
	}

	// Build partner map
	const partnerMap = new Map();
	for (const row of partnersResult.results) {
		try {
			const info = JSON.parse(row.info);
			partnerMap.set(row.key, info.subject || row.key);
		} catch {
			partnerMap.set(row.key, row.key);
		}
	}

	const order = {
		...orderResult,
		order_info: orderInfo,
		merchant_display_name: merchantMap.get(orderResult.shop_id) || orderResult.shop_id,
		partner_display_name: partnerMap.get(orderResult.app_id) || orderResult.app_id
	};

	// Fetch related orders from the same shop for navigation
	const relatedOrdersStmt = platform.env.reporting.prepare(
		'SELECT platform_order_number FROM orders WHERE shop_id = ? ORDER BY created_dt DESC LIMIT 20'
	);

	const relatedOrders = await relatedOrdersStmt.bind(order.shop_id).all();

	// Find current order index for navigation
	const currentIndex = relatedOrders.results.findIndex(
		(o) => o.platform_order_number === order.platform_order_number
	);

	const prevOrder = currentIndex > 0 ? relatedOrders.results[currentIndex - 1] : null;
	const nextOrder =
		currentIndex < relatedOrders.results.length - 1
			? relatedOrders.results[currentIndex + 1]
			: null;

	return {
		order,
		navigation: {
			prevOrder,
			nextOrder,
			currentIndex: currentIndex + 1,
			totalOrders: relatedOrders.results.length
		}
	};
}
