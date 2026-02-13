import { json } from '@sveltejs/kit';

/**
 * GET /admin/api/orders
 * Fetch paginated orders with search, partner/merchant/platform filtering, and sorting.
 *
 * Query params:
 * - limit (default: 10, max: 100)
 * - offset (default: 0)
 * - search - searches platform_order_number OR shop_id
 * - partner - filters by app_id
 * - merchant - filters by shop_id
 * - platform - filters by platform (comma-separated for multiple)
 * - orderBy - column to sort by (default: created_dt)
 * - orderDir - sort direction: 'asc' or 'desc' (default: desc)
 */
export async function GET({ url, platform }) {
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 100);
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const search = url.searchParams.get('search') || '';
	const partner = url.searchParams.get('partner') || '';
	const merchant = url.searchParams.get('merchant') || '';
	const platformFilter = url.searchParams.get('platform') || '';
	const orderBy = url.searchParams.get('orderBy') || 'created_dt';
	const orderDir = url.searchParams.get('orderDir')?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

	// Validate orderBy against allowed columns to prevent SQL injection
	const allowedColumns = [
		'created_dt',
		'order_total',
		'platform_order_number',
		'shop_id',
		'platform'
	];
	const safeOrderBy = allowedColumns.includes(orderBy) ? orderBy : 'created_dt';

	const reporting = platform?.env?.reporting;
	const firmlyConfigs = platform?.env?.firmlyConfigs;

	if (!reporting || !firmlyConfigs) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
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

		if (merchant) {
			conditions.push('shop_id = ?');
			params.push(merchant);
		}

		if (platformFilter) {
			// Support multiple platforms (comma-separated)
			const platforms = platformFilter
				.split(',')
				.map((p) => p.trim())
				.filter(Boolean);
			if (platforms.length === 1) {
				conditions.push('platform = ?');
				params.push(platforms[0]);
			} else if (platforms.length > 1) {
				const placeholders = platforms.map(() => '?').join(', ');
				conditions.push(`platform IN (${placeholders})`);
				params.push(...platforms);
			}
		}

		if (conditions.length > 0) {
			const whereClause = ' WHERE ' + conditions.join(' AND ');
			ordersQuery += whereClause;
			countQuery += whereClause;
		}

		ordersQuery += ` ORDER BY ${safeOrderBy} ${orderDir} LIMIT ? OFFSET ?`;

		const ordersStmt = reporting.prepare(ordersQuery);
		const countStmt = reporting.prepare(countQuery);
		const merchantsStmt = firmlyConfigs.prepare('SELECT info FROM stores');
		const partnersStmt = firmlyConfigs.prepare('SELECT key, info FROM app_identifiers');
		const platformsStmt = reporting.prepare(
			'SELECT DISTINCT platform FROM orders WHERE platform IS NOT NULL AND platform != "" ORDER BY platform'
		);

		const [ordersResult, countResult, merchantsResult, partnersResult, platformsResult] =
			await Promise.all([
				ordersStmt.bind(...params, limit, offset).all(),
				countStmt.bind(...params).first(),
				merchantsStmt.all(),
				partnersStmt.all(),
				platformsStmt.all()
			]);

		// Build a map of store_id to display_name and list of merchants for filtering
		const merchantMap = new Map();
		const merchants = [];
		for (const row of merchantsResult.results) {
			try {
				const info = JSON.parse(row.info);
				if (info.store_id) {
					const displayName = info.display_name || info.store_id;
					merchantMap.set(info.store_id, displayName);
					merchants.push({ shop_id: info.store_id, display_name: displayName });
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

		// Build list of platforms for filtering
		const platforms = platformsResult.results.map((row) => row.platform);

		// Parse order_info JSON and add merchant/partner display names
		const orders = ordersResult.results
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
			.filter(Boolean);

		const total = countResult?.total || 0;

		return json({
			orders,
			partners,
			merchants,
			platforms,
			total,
			limit,
			offset
		});
	} catch (error) {
		console.error('Error fetching orders:', error);
		return json({ error: 'Failed to fetch orders' }, { status: 500 });
	}
}
