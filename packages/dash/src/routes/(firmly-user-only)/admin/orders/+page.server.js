/** @type {import('./$types').PageServerLoad} */
export async function load({ platform, url }) {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '10');
	const search = url.searchParams.get('search') || '';
	const partner = url.searchParams.get('partner') || '';
	const offset = (page - 1) * limit;

	let ordersQuery = 'SELECT * FROM orders';
	let countQuery = 'SELECT COUNT(*) as total FROM orders';
	const params = [];
	const conditions = [];

	if (search) {
		conditions.push('(platform_order_number LIKE ? OR shop_id LIKE ?)');
		params.push(`%${search}%`, `%${search}%`);
	}

	if (partner) {
		conditions.push('app_id = ?');
		params.push(partner);
	}

	if (conditions.length > 0) {
		const whereClause = ' WHERE ' + conditions.join(' AND ');
		ordersQuery += whereClause;
		countQuery += whereClause;
	}

	ordersQuery += ' ORDER BY created_dt DESC LIMIT ? OFFSET ?';

	const ordersStmt = platform.env.reporting.prepare(ordersQuery);
	const countStmt = platform.env.reporting.prepare(countQuery);
	const merchantsStmt = platform.env.firmlyConfigs.prepare('SELECT info FROM stores');
	const partnersStmt = platform.env.firmlyConfigs.prepare(
		'SELECT key, info FROM app_identifiers'
	);

	const [ordersResult, countResult, merchantsResult, partnersResult] = await Promise.all([
		ordersStmt.bind(...params, limit, offset).all(),
		countStmt.bind(...params).first(),
		merchantsStmt.all(),
		partnersStmt.all()
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

	// Build a map of app_id to partner name and list of partners for filtering
	const partnerMap = new Map();
	const partners = [];
	for (const row of partnersResult.results) {
		try {
			const info = JSON.parse(row.info);
			const partnerName = info.subject || row.key;
			partnerMap.set(row.key, partnerName);
			partners.push({ id: row.key, name: partnerName });
		} catch {
			// Fallback to using key as name
			partnerMap.set(row.key, row.key);
			partners.push({ id: row.key, name: row.key });
		}
	}

	// Parse order_info JSON and add merchant/partner display names
	const orders = {
		...ordersResult,
		results: ordersResult.results
			.map((order) => {
				try {
					return {
						...order,
						order_info: JSON.parse(order.order_info),
						merchant_display_name: merchantMap.get(order.shop_id) || order.shop_id,
						partner_display_name: partnerMap.get(order.app_id) || order.app_id
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
		search,
		partner,
		partners
	};
}
