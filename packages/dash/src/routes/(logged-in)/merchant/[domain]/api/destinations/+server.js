import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { getMerchantDestinations, updateMerchantDestinations } from '$lib/server/merchant.js';

/**
 * GET /merchant/[domain]/api/destinations
 * Get all destinations with merchant's enabled status and order statistics.
 */
export async function GET({ locals, params, platform }) {
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

		// Get destinations with merchant's config
		const { destinations, hasConfig } = await getMerchantDestinations({
			platform,
			merchantDomain: domain
		});

		// Get order statistics per destination from reporting database
		let orderStats = new Map();
		try {
			const statsStmt = platform.env.reporting.prepare(`
				SELECT
					app_id,
					COUNT(*) as total_orders,
					SUM(order_total) as total_revenue,
					AVG(order_total) as aov
				FROM orders
				WHERE shop_id = ?
				GROUP BY app_id
			`);
			const statsResult = await statsStmt.bind(domain).all();

			for (const row of statsResult.results || []) {
				orderStats.set(row.app_id, {
					orders: row.total_orders || 0,
					totalRevenue: row.total_revenue || 0,
					aov: row.aov || 0
				});
			}
		} catch (error) {
			console.error('Error fetching order stats:', error);
			// Continue without stats
		}

		// Merge destinations with stats
		const destinationsWithStats = destinations.map((dest) => {
			const stats = orderStats.get(dest.id) || { orders: 0, totalRevenue: 0, aov: 0 };
			return {
				...dest,
				orders: dest.isComingSoon ? 'Coming Soon' : stats.orders,
				aov: dest.isComingSoon ? null : stats.aov,
				// Placeholder values for dispute rate and reputation score
				// These would come from a different data source in production
				disputeRate: dest.isComingSoon ? null : null,
				reputationScore: dest.isComingSoon ? null : null
			};
		});

		return json({
			destinations: destinationsWithStats,
			hasExistingConfig: hasConfig
		});
	} catch (error) {
		console.error('Error fetching destinations:', error);
		return json({ error: 'Failed to fetch destinations' }, { status: 500 });
	}
}

/**
 * POST /merchant/[domain]/api/destinations
 * Save merchant's destination configuration.
 * Body: { enabledDestinations: ['dest1', 'dest2', ...] }
 */
export async function POST({ locals, params, platform, request }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Firmly admins have owner access to all merchants
		if (!isFirmlyAdmin) {
			// Verify user has owner or editor access to this merchant
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const access = merchantAccess.find((a) => a.merchant_domain === domain);

			if (!access) {
				return json({ error: 'Access denied' }, { status: 403 });
			}

			const role = access.role;
			if (role !== 'owner' && role !== 'editor') {
				return json(
					{
						error: 'Insufficient permissions. Only owners and editors can update destinations.'
					},
					{ status: 403 }
				);
			}
		}

		// Parse request body
		const body = await request.json();
		const { enabledDestinations } = body;

		if (!Array.isArray(enabledDestinations)) {
			return json({ error: 'enabledDestinations must be an array' }, { status: 400 });
		}

		// Update destinations
		const result = await updateMerchantDestinations({
			platform,
			merchantDomain: domain,
			enabledDestinations,
			actor: { id: userId, email }
		});

		if (!result.success) {
			return json(
				{ error: result.error || 'Failed to update destinations' },
				{ status: 500 }
			);
		}

		return json({
			success: true,
			isFirstTimeSave: result.isFirstTimeSave,
			updatedAt: new Date().toISOString()
		});
	} catch (error) {
		console.error('Error saving destinations:', error);
		return json({ error: 'Failed to save destinations' }, { status: 500 });
	}
}
