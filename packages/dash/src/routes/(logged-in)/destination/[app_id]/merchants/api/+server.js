import { json } from '@sveltejs/kit';
import { getDestinationAccess, getMerchantMetrics } from '$lib/server/destination.js';
import { startOfMonth, format } from 'date-fns';

/**
 * GET /destination/[app_id]/merchants/api
 * Get all merchants with their metrics for this destination.
 * Query params: sort (revenue, orders, aov, name), order (asc, desc)
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

		// Parse query params
		const sort = url.searchParams.get('sort') || 'revenue';
		const order = url.searchParams.get('order') || 'desc';

		// Get metrics for current month
		const today = new Date();
		const monthStart = startOfMonth(today);
		const periodStart = format(monthStart, "yyyy-MM-dd'T'HH:mm:ss");
		const periodEnd = format(today, "yyyy-MM-dd'T'HH:mm:ss");

		const merchants = await getMerchantMetrics({
			platform,
			appId,
			periodStart,
			periodEnd,
			sort,
			order
		});

		return json({
			merchants,
			sort,
			order
		});
	} catch (error) {
		console.error('Error fetching merchants:', error);
		return json({ error: 'Failed to fetch merchants' }, { status: 500 });
	}
}
