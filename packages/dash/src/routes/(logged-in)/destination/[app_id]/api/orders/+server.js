import { json } from '@sveltejs/kit';
import { getDestinationAccess, getAccessibleMerchants } from '$lib/server/destination.js';

/**
 * GET /destination/[app_id]/api/orders
 * Get orders for this destination across all accessible merchants with pagination and search.
 * Query params: limit (default 25), offset (default 0), search, merchant (filter by specific merchant)
 */
export async function GET({ locals, params, platform, url }) {
	const { session } = locals;
	const { app_id: appId } = params;

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

		// Parse pagination params
		const limit = Math.min(parseInt(url.searchParams.get('limit') || '25', 10), 100);
		const offset = parseInt(url.searchParams.get('offset') || '0', 10);
		const search = url.searchParams.get('search') || '';
		const merchantFilter = url.searchParams.get('merchant') || '';

		// Get accessible merchants for this destination
		const accessible = await getAccessibleMerchants({ platform, appId });
		if (accessible.length === 0) {
			return json({
				orders: [],
				merchants: [],
				total: 0,
				limit,
				offset
			});
		}

		const merchantMap = new Map(accessible.map((m) => [m.domain, m.displayName]));

		// Apply merchant filter if provided
		let merchantDomains = accessible.map((m) => m.domain);
		if (merchantFilter && merchantDomains.includes(merchantFilter)) {
			merchantDomains = [merchantFilter];
		}

		const placeholders = merchantDomains.map(() => '?').join(',');

		// Build queries
		let whereClause = `app_id = ? AND shop_id IN (${placeholders})`;
		const bindParams = [appId, ...merchantDomains];

		if (search) {
			whereClause += ' AND platform_order_number LIKE ?';
			bindParams.push(`%${search}%`);
		}

		// Get total count
		const countResult = await reporting
			.prepare(`SELECT COUNT(*) as total FROM orders WHERE ${whereClause}`)
			.bind(...bindParams)
			.first();

		const total = countResult?.total || 0;

		// Get paginated orders
		const ordersResult = await reporting
			.prepare(
				`SELECT
					platform_order_number,
					shop_id,
					order_total,
					created_dt,
					order_info
				 FROM orders
				 WHERE ${whereClause}
				 ORDER BY created_dt DESC
				 LIMIT ? OFFSET ?`
			)
			.bind(...bindParams, limit, offset)
			.all();

		// Process orders
		const orders = (ordersResult.results || []).map((row) => {
			let orderInfo = {};
			try {
				orderInfo = JSON.parse(row.order_info || '{}');
			} catch {
				// Use defaults
			}
			return {
				id: row.platform_order_number,
				platform_order_number: row.platform_order_number,
				shop_id: row.shop_id,
				merchantName: merchantMap.get(row.shop_id) || row.shop_id,
				order_total: row.order_total,
				created_dt: row.created_dt,
				order_info: orderInfo
			};
		});

		return json({
			orders,
			merchants: accessible,
			total,
			limit,
			offset
		});
	} catch (error) {
		console.error('Error fetching destination orders:', error);
		return json({ error: 'Failed to fetch orders' }, { status: 500 });
	}
}
