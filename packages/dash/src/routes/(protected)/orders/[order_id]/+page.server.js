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
	let orderInfo;
	try {
		orderInfo = JSON.parse(orderResult.order_info);
	} catch {
		throw error(500, 'Failed to parse order data');
	}

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
	const order = {
		...orderResult,
		order_info: orderInfo
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
