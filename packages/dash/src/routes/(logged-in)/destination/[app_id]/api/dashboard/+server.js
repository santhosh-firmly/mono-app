import { json } from '@sveltejs/kit';
import { getDestinationAccess, getAccessibleMerchants } from '$lib/server/destination.js';
import {
	startOfMonth,
	subMonths,
	format,
	eachDayOfInterval,
	startOfDay,
	addDays,
	endOfMonth
} from 'date-fns';

/**
 * GET /destination/[app_id]/api/dashboard
 * Get dashboard statistics for the destination, consolidated across all accessible merchants.
 */
export async function GET({ locals, params, platform, url }) {
	const { session } = locals;
	const { app_id: appId } = params;

	// Get optional merchant filter from query params
	const merchantFilter = url.searchParams.get('merchant');

	try {
		// Verify user has access to this destination (unless Firmly admin)
		if (!session?.isFirmlyAdmin) {
			const access = await getDestinationAccess({ platform, userId: session.userId });
			const hasAccess = access.some((a) => a.app_id === appId);
			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		const reporting = platform?.env?.reporting;

		if (!reporting) {
			return json({ error: 'Database not configured' }, { status: 500 });
		}

		// Get accessible merchants for this destination using the helper function
		const allMerchants = await getAccessibleMerchants({ platform, appId });

		if (allMerchants.length === 0) {
			return json({
				summary: {
					totalRevenue: 0,
					totalOrders: 0,
					aov: 0,
					revenueChange: 0,
					ordersChange: 0,
					aovChange: 0
				},
				revenueChart: { currentMonth: [], previousMonth: [] },
				topMerchants: [],
				merchants: [],
				activeMerchants: 0
			});
		}

		const merchantMap = new Map(allMerchants.map((m) => [m.domain, m.displayName]));

		// Apply merchant filter if provided
		let merchantDomains = allMerchants.map((m) => m.domain);
		if (merchantFilter && merchantDomains.includes(merchantFilter)) {
			merchantDomains = [merchantFilter];
		}

		const placeholders = merchantDomains.map(() => '?').join(',');

		const today = new Date();
		const monthStart = startOfMonth(today);
		const lastMonthStart = startOfMonth(subMonths(today, 1));
		const sameTimeLastMonth = subMonths(today, 1);
		const lastMonthCompareEnd = startOfDay(addDays(sameTimeLastMonth, 1));

		// Summary queries
		const summaryQuery = `
			SELECT
				COALESCE(SUM(order_total), 0) as total_revenue,
				COUNT(*) as total_orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE app_id = ? AND shop_id IN (${placeholders}) AND created_dt >= ?
		`;

		const lastPeriodQuery = `
			SELECT
				COALESCE(SUM(order_total), 0) as total_revenue,
				COUNT(*) as total_orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE app_id = ? AND shop_id IN (${placeholders}) AND created_dt >= ? AND created_dt < ?
		`;

		const dailyRevenueQuery = `
			SELECT
				DATE(created_dt) as date,
				SUM(order_total) as revenue,
				COUNT(*) as orders
			FROM orders
			WHERE app_id = ? AND shop_id IN (${placeholders}) AND created_dt >= ?
			GROUP BY DATE(created_dt)
			ORDER BY date ASC
		`;

		const dailyRevenueBoundedQuery = `
			SELECT
				DATE(created_dt) as date,
				SUM(order_total) as revenue,
				COUNT(*) as orders
			FROM orders
			WHERE app_id = ? AND shop_id IN (${placeholders}) AND created_dt >= ? AND created_dt < ?
			GROUP BY DATE(created_dt)
			ORDER BY date ASC
		`;

		const topMerchantsQuery = `
			SELECT
				shop_id,
				COALESCE(SUM(order_total), 0) as revenue,
				COUNT(*) as orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE app_id = ? AND shop_id IN (${placeholders}) AND created_dt >= ?
			GROUP BY shop_id
			ORDER BY revenue DESC
			LIMIT 5
		`;

		const activeMerchantsQuery = `
			SELECT COUNT(DISTINCT shop_id) as count
			FROM orders
			WHERE app_id = ? AND shop_id IN (${placeholders}) AND created_dt >= ?
		`;

		// Execute queries in parallel
		const [
			currentMonthResult,
			lastMonthResult,
			dailyRevenueResult,
			lastMonthDailyRevenueResult,
			topMerchantsResult,
			activeMerchantsResult
		] = await Promise.all([
			reporting
				.prepare(summaryQuery)
				.bind(appId, ...merchantDomains, monthStart.toISOString())
				.first(),
			reporting
				.prepare(lastPeriodQuery)
				.bind(
					appId,
					...merchantDomains,
					lastMonthStart.toISOString(),
					lastMonthCompareEnd.toISOString()
				)
				.first(),
			reporting
				.prepare(dailyRevenueQuery)
				.bind(appId, ...merchantDomains, monthStart.toISOString())
				.all(),
			reporting
				.prepare(dailyRevenueBoundedQuery)
				.bind(
					appId,
					...merchantDomains,
					lastMonthStart.toISOString(),
					monthStart.toISOString()
				)
				.all(),
			reporting
				.prepare(topMerchantsQuery)
				.bind(appId, ...merchantDomains, monthStart.toISOString())
				.all(),
			reporting
				.prepare(activeMerchantsQuery)
				.bind(appId, ...merchantDomains, monthStart.toISOString())
				.first()
		]);

		// Process daily revenue into cumulative data for current month
		const dailyData = dailyRevenueResult.results || [];
		const allDays = eachDayOfInterval({ start: monthStart, end: today });
		let cumulativeRevenue = 0;
		let cumulativeOrders = 0;

		const currentMonthChartData = allDays.map((day, index) => {
			const dayStr = format(day, 'yyyy-MM-dd');
			const dayData = dailyData.find((d) => d.date === dayStr);

			if (dayData) {
				cumulativeRevenue += dayData.revenue || 0;
				cumulativeOrders += dayData.orders || 0;
			}

			return {
				day: index + 1,
				date: format(day, 'MMM dd'),
				revenue: cumulativeRevenue,
				orders: cumulativeOrders
			};
		});

		// Process daily revenue into cumulative data for previous month
		const lastMonthDailyData = lastMonthDailyRevenueResult.results || [];
		const lastMonthEnd = endOfMonth(lastMonthStart);
		const allLastMonthDays = eachDayOfInterval({ start: lastMonthStart, end: lastMonthEnd });
		let lastMonthCumulativeRevenue = 0;
		let lastMonthCumulativeOrders = 0;

		const previousMonthChartData = allLastMonthDays.map((day, index) => {
			const dayStr = format(day, 'yyyy-MM-dd');
			const dayData = lastMonthDailyData.find((d) => d.date === dayStr);

			if (dayData) {
				lastMonthCumulativeRevenue += dayData.revenue || 0;
				lastMonthCumulativeOrders += dayData.orders || 0;
			}

			return {
				day: index + 1,
				date: format(day, 'MMM dd'),
				revenue: lastMonthCumulativeRevenue,
				orders: lastMonthCumulativeOrders
			};
		});

		// Process top merchants
		const topMerchants = (topMerchantsResult.results || []).map((m) => ({
			domain: m.shop_id,
			displayName: merchantMap.get(m.shop_id) || m.shop_id,
			revenue: m.revenue || 0,
			orders: m.orders || 0,
			aov: m.aov || 0
		}));

		// Calculate percentage changes
		const currentRevenue = currentMonthResult?.total_revenue || 0;
		const lastRevenue = lastMonthResult?.total_revenue || 0;
		const revenueChange =
			lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

		const currentOrders = currentMonthResult?.total_orders || 0;
		const lastOrders = lastMonthResult?.total_orders || 0;
		const ordersChange = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0;

		const currentAov = currentMonthResult?.aov || 0;
		const lastAov = lastMonthResult?.aov || 0;
		const aovChange = lastAov > 0 ? ((currentAov - lastAov) / lastAov) * 100 : 0;

		return json({
			summary: {
				totalRevenue: currentRevenue,
				totalOrders: currentOrders,
				aov: currentAov,
				revenueChange,
				ordersChange,
				aovChange
			},
			revenueChart: {
				currentMonth: currentMonthChartData,
				previousMonth: previousMonthChartData,
				currentMonthLabel: 'This month',
				previousMonthLabel: 'Last month'
			},
			topMerchants,
			merchants: allMerchants,
			activeMerchants: activeMerchantsResult?.count || 0
		});
	} catch (error) {
		console.error('Error fetching destination dashboard data:', error);
		return json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
	}
}
