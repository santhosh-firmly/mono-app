import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import {
	startOfMonth,
	startOfWeek,
	subMonths,
	format,
	eachDayOfInterval,
	startOfDay,
	addDays,
	endOfMonth
} from 'date-fns';

/**
 * GET /merchant/[domain]/api/dashboard
 * Get dashboard statistics for the merchant.
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

		const today = new Date();
		const monthStart = startOfMonth(today);
		const weekStart = startOfWeek(today);
		const lastMonthStart = startOfMonth(subMonths(today, 1));
		// Same day in previous month (capped for shorter months, e.g., Mar 31 -> Feb 28/29)
		const sameTimeLastMonth = subMonths(today, 1);
		// Add 1 day for exclusive end in query (to include full day of orders)
		const lastMonthCompareEnd = startOfDay(addDays(sameTimeLastMonth, 1));

		// Prepare queries
		const summaryQuery = `
			SELECT
				COALESCE(SUM(order_total), 0) as total_revenue,
				COUNT(*) as total_orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE shop_id = ? AND created_dt >= ?
		`;

		const lastPeriodQuery = `
			SELECT
				COALESCE(SUM(order_total), 0) as total_revenue,
				COUNT(*) as total_orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE shop_id = ? AND created_dt >= ? AND created_dt < ?
		`;

		const dailyRevenueQuery = `
			SELECT
				DATE(created_dt) as date,
				SUM(order_total) as revenue,
				COUNT(*) as orders
			FROM orders
			WHERE shop_id = ? AND created_dt >= ?
			GROUP BY DATE(created_dt)
			ORDER BY date ASC
		`;

		const dailyRevenueBoundedQuery = `
			SELECT
				DATE(created_dt) as date,
				SUM(order_total) as revenue,
				COUNT(*) as orders
			FROM orders
			WHERE shop_id = ? AND created_dt >= ? AND created_dt < ?
			GROUP BY DATE(created_dt)
			ORDER BY date ASC
		`;

		const destinationQuery = `
			SELECT
				app_id,
				COALESCE(SUM(order_total), 0) as revenue,
				COUNT(*) as orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE shop_id = ? AND created_dt >= ?
			GROUP BY app_id
			ORDER BY revenue DESC
		`;

		const recentOrdersQuery = `
			SELECT * FROM orders
			WHERE shop_id = ?
			ORDER BY created_dt DESC
			LIMIT 5
		`;

		const topProductsQuery = `
			SELECT order_info FROM orders
			WHERE shop_id = ? AND created_dt >= ?
		`;

		// Execute queries in parallel
		const [
			currentMonthResult,
			lastMonthResult,
			currentWeekResult,
			dailyRevenueResult,
			lastMonthDailyRevenueResult,
			destinationResult,
			recentOrdersResult,
			topProductsResult,
			destinationsInfoResult
		] = await Promise.all([
			platform.env.reporting
				.prepare(summaryQuery)
				.bind(domain, monthStart.toISOString())
				.first(),
			platform.env.reporting
				.prepare(lastPeriodQuery)
				.bind(domain, lastMonthStart.toISOString(), lastMonthCompareEnd.toISOString())
				.first(),
			platform.env.reporting
				.prepare(summaryQuery)
				.bind(domain, weekStart.toISOString())
				.first(),
			platform.env.reporting
				.prepare(dailyRevenueQuery)
				.bind(domain, monthStart.toISOString())
				.all(),
			platform.env.reporting
				.prepare(dailyRevenueBoundedQuery)
				.bind(domain, lastMonthStart.toISOString(), monthStart.toISOString())
				.all(),
			platform.env.reporting
				.prepare(destinationQuery)
				.bind(domain, monthStart.toISOString())
				.all(),
			platform.env.reporting.prepare(recentOrdersQuery).bind(domain).all(),
			platform.env.reporting
				.prepare(topProductsQuery)
				.bind(domain, monthStart.toISOString())
				.all(),
			platform.env.firmlyConfigs.prepare('SELECT key, info FROM app_identifiers').all()
		]);

		// Build destinations map from app_identifiers
		const destinationsMap = {};
		const destinationsList = destinationsInfoResult?.results || [];
		for (const dest of destinationsList) {
			try {
				const info = typeof dest.info === 'string' ? JSON.parse(dest.info) : dest.info;
				destinationsMap[dest.key] = info?.subject || dest.key;
			} catch {
				destinationsMap[dest.key] = dest.key;
			}
		}

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

		// Process destination data
		const destinationData = (destinationResult.results || []).map((d) => ({
			id: d.app_id,
			name: destinationsMap[d.app_id] || d.app_id || 'Unknown',
			revenue: d.revenue || 0,
			orders: d.orders || 0,
			aov: d.aov || 0
		}));

		// Process top products from order_info
		const productMap = new Map();
		for (const order of topProductsResult.results || []) {
			try {
				const orderInfo = JSON.parse(order.order_info);
				const items = orderInfo?.line_items || orderInfo?.items || [];
				for (const item of items) {
					const productId = item.product_id || item.sku || item.title;
					if (!productId) continue;

					const existing = productMap.get(productId) || {
						id: productId,
						name: item.title || item.name || productId,
						orders: 0,
						revenue: 0,
						quantity: 0
					};

					existing.orders += 1;
					existing.quantity += item.quantity || 1;
					existing.revenue += (item.price || 0) * (item.quantity || 1);
					productMap.set(productId, existing);
				}
			} catch {
				// Skip invalid order_info
			}
		}

		const topProducts = Array.from(productMap.values())
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		// Process recent orders
		const recentOrders = (recentOrdersResult.results || []).map((order) => {
			let orderInfo = {};
			try {
				orderInfo = JSON.parse(order.order_info);
			} catch {
				// Keep empty object
			}

			return {
				id: order.platform_order_number,
				destination: destinationsMap[order.app_id] || order.app_id || 'Unknown',
				amount: order.order_total || 0,
				date: order.created_dt,
				itemCount: orderInfo?.line_items?.length || orderInfo?.items?.length || 0
			};
		});

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
				aovChange,
				weeklyRevenue: currentWeekResult?.total_revenue || 0,
				weeklyOrders: currentWeekResult?.total_orders || 0
			},
			revenueChart: {
				currentMonth: currentMonthChartData,
				previousMonth: previousMonthChartData,
				currentMonthLabel: 'This month',
				previousMonthLabel: 'Last month'
			},
			destinationChart: destinationData,
			topProducts,
			recentOrders,
			activeDestinations: destinationData.filter((d) => d.orders > 0).length
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
	}
}
