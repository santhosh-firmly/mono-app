import { json } from '@sveltejs/kit';
import { startOfMonth, subMonths, format, eachDayOfInterval, endOfMonth } from 'date-fns';

/**
 * Build dynamic WHERE filter clauses and bind params for merchant/destination filters.
 * Only includes IN clauses when filters are actively applied, avoiding D1's 100-param limit.
 */
function buildFilterClause(merchantDomains, destinationAppIds) {
	const conditions = [];
	const params = [];

	if (merchantDomains) {
		conditions.push(`shop_id IN (${merchantDomains.map(() => '?').join(',')})`);
		params.push(...merchantDomains);
	}
	if (destinationAppIds) {
		conditions.push(`app_id IN (${destinationAppIds.map(() => '?').join(',')})`);
		params.push(...destinationAppIds);
	}

	const clause = conditions.length > 0 ? conditions.join(' AND ') + ' AND ' : '';
	return { clause, params };
}

/**
 * GET /admin/api/dashboard
 * Get admin dashboard statistics across all merchants and destinations.
 * Supports multi-value filters for merchants and destinations.
 */
export async function GET({ platform, url }) {
	try {
		const reporting = platform?.env?.reporting;
		const firmlyConfigs = platform?.env?.firmlyConfigs;

		if (!reporting || !firmlyConfigs) {
			return json({ error: 'Database not configured' }, { status: 500 });
		}

		// Get all merchants and destinations for filter options
		const [merchantsResult, destinationsResult] = await Promise.all([
			firmlyConfigs.prepare('SELECT key, info FROM stores').all(),
			firmlyConfigs.prepare('SELECT key, info FROM app_identifiers').all()
		]);

		const allMerchants = (merchantsResult.results || []).map((m) => {
			const info = JSON.parse(m.info || '{}');
			return {
				domain: m.key,
				displayName: info.display_name || m.key
			};
		});

		const allDestinations = (destinationsResult.results || []).map((d) => {
			const info = JSON.parse(d.info || '{}');
			return {
				appId: d.key,
				displayName: info.display_name || info.subject || d.key
			};
		});

		// Get filter params (multi-value)
		const merchantFilters = url.searchParams.getAll('merchant');
		const destinationFilters = url.searchParams.getAll('destination');

		// Validate filters against known values
		const validMerchantDomains = new Set(allMerchants.map((m) => m.domain));
		const validDestinationAppIds = new Set(allDestinations.map((d) => d.appId));

		const filteredMerchants =
			merchantFilters.length > 0
				? merchantFilters.filter((f) => validMerchantDomains.has(f))
				: null; // null = no filter (all merchants)

		const filteredDestinations =
			destinationFilters.length > 0
				? destinationFilters.filter((f) => validDestinationAppIds.has(f))
				: null; // null = no filter (all destinations)

		// Parse date range params (fall back to current month if absent)
		const startDateParam = url.searchParams.get('startDate');
		const endDateParam = url.searchParams.get('endDate');
		const compareStartParam = url.searchParams.get('compareStartDate');
		const compareEndParam = url.searchParams.get('compareEndDate');
		const periodLabel = url.searchParams.get('periodLabel') || 'This month';
		const comparePeriodLabel = url.searchParams.get('comparePeriodLabel') || 'Last month';

		const today = new Date();
		const hasExplicitDates = !!(startDateParam && endDateParam);

		const periodStart = hasExplicitDates ? new Date(startDateParam) : startOfMonth(today);
		const periodEnd = hasExplicitDates ? new Date(endDateParam) : today;

		const hasComparison = hasExplicitDates ? !!(compareStartParam && compareEndParam) : true;
		const compStart = compareStartParam
			? new Date(compareStartParam)
			: startOfMonth(subMonths(today, 1));
		const compEnd = compareEndParam
			? new Date(compareEndParam)
			: endOfMonth(subMonths(today, 1));

		// Return empty data if filters result in no valid selections
		if (
			(filteredMerchants && filteredMerchants.length === 0) ||
			(filteredDestinations && filteredDestinations.length === 0)
		) {
			return json({
				summary: {
					totalRevenue: 0,
					totalOrders: 0,
					aov: 0,
					revenueChange: 0,
					ordersChange: 0,
					aovChange: 0
				},
				revenueChart: {
					currentMonth: [],
					previousMonth: [],
					currentMonthLabel: periodLabel,
					previousMonthLabel: comparePeriodLabel
				},
				topMerchants: [],
				topDestinations: [],
				topProducts: [],
				merchants: allMerchants,
				destinations: allDestinations,
				activeMerchants: 0,
				activeDestinations: 0
			});
		}

		const { clause: filterClause, params: filterParams } = buildFilterClause(
			filteredMerchants,
			filteredDestinations
		);

		// Summary query
		const summaryQuery = `
			SELECT
				COALESCE(SUM(order_total), 0) as total_revenue,
				COUNT(*) as total_orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
		`;

		const lastPeriodQuery = `
			SELECT
				COALESCE(SUM(order_total), 0) as total_revenue,
				COUNT(*) as total_orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
		`;

		const dailyRevenueQuery = `
			SELECT
				DATE(created_dt) as date,
				SUM(order_total) as revenue,
				COUNT(*) as orders
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
			GROUP BY DATE(created_dt)
			ORDER BY date ASC
		`;

		const dailyRevenueBoundedQuery = `
			SELECT
				DATE(created_dt) as date,
				SUM(order_total) as revenue,
				COUNT(*) as orders
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
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
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
			GROUP BY shop_id
			ORDER BY revenue DESC
			LIMIT 5
		`;

		const topDestinationsQuery = `
			SELECT
				app_id,
				COALESCE(SUM(order_total), 0) as revenue,
				COUNT(*) as orders,
				COALESCE(AVG(order_total), 0) as aov
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
			GROUP BY app_id
			ORDER BY revenue DESC
			LIMIT 5
		`;

		const topProductsQuery = `
			SELECT order_info FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
		`;

		const activeMerchantsQuery = `
			SELECT COUNT(DISTINCT shop_id) as count
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
		`;

		const activeDestinationsQuery = `
			SELECT COUNT(DISTINCT app_id) as count
			FROM orders
			WHERE ${filterClause}created_dt >= ? AND created_dt <= ?
		`;

		const periodStartISO = periodStart.toISOString();
		const periodEndISO = periodEnd.toISOString();
		const compStartISO = compStart.toISOString();
		const compEndISO = compEnd.toISOString();

		// Execute queries in parallel
		const [
			currentPeriodResult,
			lastPeriodResult,
			dailyRevenueResult,
			compDailyRevenueResult,
			topMerchantsResult,
			topDestinationsResult,
			topProductsResult,
			activeMerchantsResult,
			activeDestinationsResult
		] = await Promise.all([
			reporting
				.prepare(summaryQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.first(),
			hasComparison
				? reporting
						.prepare(lastPeriodQuery)
						.bind(...filterParams, compStartISO, compEndISO)
						.first()
				: Promise.resolve(null),
			reporting
				.prepare(dailyRevenueQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.all(),
			hasComparison
				? reporting
						.prepare(dailyRevenueBoundedQuery)
						.bind(...filterParams, compStartISO, compEndISO)
						.all()
				: Promise.resolve({ results: [] }),
			reporting
				.prepare(topMerchantsQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.all(),
			reporting
				.prepare(topDestinationsQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.all(),
			reporting
				.prepare(topProductsQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.all(),
			reporting
				.prepare(activeMerchantsQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.first(),
			reporting
				.prepare(activeDestinationsQuery)
				.bind(...filterParams, periodStartISO, periodEndISO)
				.first()
		]);

		// Create merchant and destination maps for display names
		const merchantMap = new Map(allMerchants.map((m) => [m.domain, m.displayName]));
		const destMap = new Map(allDestinations.map((d) => [d.appId, d.displayName]));

		// Process daily revenue into cumulative data for current period
		const dailyData = dailyRevenueResult.results || [];
		const chartEnd = periodEnd > today ? today : periodEnd;
		const allDays = eachDayOfInterval({ start: periodStart, end: chartEnd });
		let cumulativeRevenue = 0;
		let cumulativeOrders = 0;

		const currentPeriodChartData = allDays.map((day, index) => {
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

		// Process daily revenue into cumulative data for comparison period
		let compPeriodChartData = [];
		if (hasComparison) {
			const compDailyData = compDailyRevenueResult.results || [];
			const allCompDays = eachDayOfInterval({ start: compStart, end: compEnd });
			let compCumulativeRevenue = 0;
			let compCumulativeOrders = 0;

			compPeriodChartData = allCompDays.map((day, index) => {
				const dayStr = format(day, 'yyyy-MM-dd');
				const dayData = compDailyData.find((d) => d.date === dayStr);

				if (dayData) {
					compCumulativeRevenue += dayData.revenue || 0;
					compCumulativeOrders += dayData.orders || 0;
				}

				return {
					day: index + 1,
					date: format(day, 'MMM dd'),
					revenue: compCumulativeRevenue,
					orders: compCumulativeOrders
				};
			});
		}

		// Process top merchants with display names
		const topMerchants = (topMerchantsResult.results || []).map((m) => ({
			domain: m.shop_id,
			displayName: merchantMap.get(m.shop_id) || m.shop_id,
			revenue: m.revenue || 0,
			orders: m.orders || 0,
			aov: m.aov || 0
		}));

		// Process top destinations with display names
		const topDestinations = (topDestinationsResult.results || []).map((d) => ({
			appId: d.app_id,
			displayName: destMap.get(d.app_id) || d.app_id,
			revenue: d.revenue || 0,
			orders: d.orders || 0,
			aov: d.aov || 0
		}));

		// Process top products from order_info JSON
		const productMap = new Map();
		for (const order of topProductsResult.results || []) {
			try {
				const orderInfo = JSON.parse(order.order_info);
				const items = orderInfo?.line_items || orderInfo?.items || [];
				for (const item of items) {
					const productId = item.product_id || item.sku || item.title || item.description;
					if (!productId) continue;

					const existing = productMap.get(productId) || {
						name: item.description || item.title || item.name || productId,
						orders: 0,
						revenue: 0,
						quantity: 0,
						image: null
					};

					existing.image = existing.image || item.image?.url || null;
					existing.orders += 1;
					existing.quantity += item.quantity || 1;

					// Handle price as object ({value, number}) or plain number
					const linePrice = item.line_price?.value ?? item.line_price;
					const unitPrice = item.price?.value ?? item.price;
					const qty = item.quantity || 1;
					existing.revenue +=
						typeof linePrice === 'number'
							? linePrice
							: typeof unitPrice === 'number'
								? unitPrice * qty
								: 0;

					productMap.set(productId, existing);
				}
			} catch {
				// Skip invalid order_info
			}
		}

		const topProducts = Array.from(productMap.values())
			.sort((a, b) => b.revenue - a.revenue)
			.slice(0, 5);

		// Calculate percentage changes
		const currentRevenue = currentPeriodResult?.total_revenue || 0;
		const lastRevenue = lastPeriodResult?.total_revenue || 0;
		const revenueChange =
			lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

		const currentOrders = currentPeriodResult?.total_orders || 0;
		const lastOrders = lastPeriodResult?.total_orders || 0;
		const ordersChange = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders) * 100 : 0;

		const currentAov = currentPeriodResult?.aov || 0;
		const lastAov = lastPeriodResult?.aov || 0;
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
				currentMonth: currentPeriodChartData,
				previousMonth: compPeriodChartData,
				currentMonthLabel: periodLabel,
				previousMonthLabel: comparePeriodLabel
			},
			topMerchants,
			topDestinations,
			topProducts,
			merchants: allMerchants,
			destinations: allDestinations,
			activeMerchants: activeMerchantsResult?.count || 0,
			activeDestinations: activeDestinationsResult?.count || 0
		});
	} catch (error) {
		console.error('Error fetching admin dashboard data:', error);
		return json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
	}
}
