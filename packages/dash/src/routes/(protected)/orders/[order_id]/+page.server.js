import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const orderId = params.order_id;

	// Fetch the specific order from the database
	const orderStmt = platform.env.reporting.prepare(
		'SELECT * FROM orders WHERE platform_order_number = ?'
	);

	const orderResult = await orderStmt.bind(orderId).first();

	if (!orderResult) {
		throw error(404, 'Order not found');
	}

	// Parse the order_info JSON
	const order = {
		...orderResult,
		order_info: JSON.parse(orderResult.order_info)
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
