import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';

/**
 * GET /merchant/[domain]/api/orders
 * Get orders for this merchant with pagination and search.
 * Query params: limit (default 25), offset (default 0), search
 */
export async function GET({ locals, params, platform, url }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

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

		// Parse pagination params
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '25', 10), 100);
		const offset = parseInt(url.searchParams.get('offset') || '0', 10);
		const search = url.searchParams.get('search') || '';

		// Build queries - ALWAYS filter by shop_id = domain for security
		let ordersQuery = 'SELECT * FROM orders WHERE shop_id = ?';
		let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE shop_id = ?';
		const params_arr = [domain];

		if (search) {
			ordersQuery += ' AND platform_order_number LIKE ?';
			countQuery += ' AND platform_order_number LIKE ?';
			params_arr.push(`%${search}%`);
		}

		ordersQuery += ' ORDER BY created_dt DESC LIMIT ? OFFSET ?';

		// Execute queries in parallel
		const ordersStmt = platform.env.reporting.prepare(ordersQuery);
		const countStmt = platform.env.reporting.prepare(countQuery);
		const destinationsStmt = platform.env.firmlyConfigs.prepare(
			'SELECT key, info FROM app_identifiers'
		);

		const [ordersResult, countResult, destinationsResult] = await Promise.all([
			ordersStmt.bind(...params_arr, limit, offset).all(),
			countStmt.bind(...params_arr).first(),
			destinationsStmt.all()
		]);

		// Parse order_info JSON
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

		// Build destinations map for client-side lookup
		const destinations = destinationsResult.results.map((dest) => {
			try {
				const info = JSON.parse(dest.info);
				return {
					key: dest.key,
					name: info.subject || dest.key
				};
			} catch {
				return { key: dest.key, name: dest.key };
			}
		});

		const total = countResult?.total || 0;

		return json({
			orders,
			destinations,
			total,
			limit,
			offset
		});
	} catch (error) {
		console.error('Error fetching orders:', error);
		return json({ error: 'Failed to fetch orders' }, { status: 500 });
	}
}
