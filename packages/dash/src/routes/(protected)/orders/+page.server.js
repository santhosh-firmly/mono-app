/** @type {import('./$types').PageServerLoad} */
export async function load({ platform, url }) {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '10');
	const search = url.searchParams.get('search') || '';
	const offset = (page - 1) * limit;

	let ordersQuery = 'SELECT * FROM orders';
	let countQuery = 'SELECT COUNT(*) as total FROM orders';
	const params = [];

	if (search) {
		const searchClause = ' WHERE platform_order_number LIKE ? OR shop_id LIKE ?';
		ordersQuery += searchClause;
		countQuery += searchClause;
		params.push(`%${search}%`, `%${search}%`);
	}

	ordersQuery += ' ORDER BY created_dt DESC LIMIT ? OFFSET ?';

	const ordersStmt = platform.env.reporting.prepare(ordersQuery);
	const countStmt = platform.env.reporting.prepare(countQuery);
	const merchantsStmt = platform.env.firmlyConfigs.prepare('SELECT info FROM stores');

	const [ordersResult, countResult, merchantsResult] = await Promise.all([
		ordersStmt.bind(...params, limit, offset).all(),
		countStmt.bind(...params).first(),
		merchantsStmt.all()
	]);

	// Build a map of store_id to display_name
	const merchantMap = new Map();
	for (const row of merchantsResult.results) {
		try {
			const info = JSON.parse(row.info);
			if (info.store_id) {
				merchantMap.set(info.store_id, info.display_name || info.store_id);
			}
		} catch {
			// Skip malformed merchant data
		}
	}

<<<<<<< Updated upstream
	// Parse order_info JSON and add merchant display_name
=======
	// Build a map of app_id to partner name and list of partners
	const partnerMap = new Map();
	const partners = [];
	for (const row of partnersResult.results) {
		try {
			const info = JSON.parse(row.info);
			const partnerName = info.subject || row.key;
			partnerMap.set(row.key, partnerName);
			partners.push({ id: row.key, name: partnerName });
		} catch {
			// Skip malformed partner data
			partnerMap.set(row.key, row.key);
			partners.push({ id: row.key, name: row.key });
		}
	}

	// Parse order_info JSON and add merchant/partner display names
>>>>>>> Stashed changes
	const orders = {
		...ordersResult,
		results: ordersResult.results
			.map((order) => {
				try {
					return {
						...order,
						order_info: JSON.parse(order.order_info),
						merchant_display_name: merchantMap.get(order.shop_id) || order.shop_id
					};
				} catch {
					// Skip orders with malformed JSON
					return null;
				}
			})
			.filter(Boolean)
	};

	const totalOrders = countResult?.total || 0;
	const totalPages = Math.ceil(totalOrders / limit);

	return {
		orders,
		pagination: {
			page,
			limit,
			totalOrders,
			totalPages
		},
		search
	};
}
