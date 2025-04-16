import { startOfWeek, startOfMonth, startOfYear, subYears, endOfYear } from 'date-fns';

/** @type {import('./$types').PageLoad} */
export async function load({ platform }) {
	const orderSumStmt = platform.env.reporting.prepare(
		'SELECT coalesce(SUM(order_total), 0) FROM orders WHERE created_dt > ?1'
	);
	const orderSumStmt2 = platform.env.reporting.prepare(
		'SELECT coalesce(SUM(order_total), 0) FROM orders WHERE created_dt > ?1 AND created_dt < ?2'
	);
	const orderByMerchantStmt = platform.env.reporting.prepare(
		'SELECT shop_id, SUM(order_total) as net_sales, count(*) as total_orders, avg(order_total) as aov FROM orders WHERE created_dt > ?1 GROUP BY shop_id'
	);
	const orderByMerchantStmt2 = platform.env.reporting.prepare(
		'SELECT shop_id, SUM(order_total) as net_sales, count(*) as total_orders, avg(order_total) as aov FROM orders WHERE created_dt > ?1 AND created_dt < ?2 GROUP BY shop_id'
	);
	const orderByDestinationStmt = platform.env.reporting.prepare(
		'SELECT app_id, SUM(order_total) as net_sales, count(*) as total_orders, avg(order_total) as aov FROM orders WHERE created_dt > ?1 GROUP BY app_id'
	);
	const orderByDestinationStmt2 = platform.env.reporting.prepare(
		'SELECT app_id, SUM(order_total) as net_sales, count(*) as total_orders, avg(order_total) as aov FROM orders WHERE created_dt > ?1 AND created_dt < ?2 GROUP BY app_id'
	);

	const today = new Date();
	const lastYear = subYears(today, 1);
	const lastYearStartOfYear = startOfYear(lastYear);
	const lastYearEndOfYear = endOfYear(lastYear);

	const destinationsStmt = platform.env.firmlyConfigs.prepare(
		'SELECT key, info from app_identifiers'
	);

	const merchantsStmt = platform.env.firmlyConfigs.prepare('SELECT key, info from stores');

	const [
		wtd,
		mtd,
		ytd,
		lytd,
		ordersByMerchantWtd,
		ordersByMerchantMtd,
		ordersByMerchantYtd,
		ordersByMerchantLytd,
		ordersByDestinationWtd,
		ordersByDestinationMtd,
		ordersByDestinationYtd,
		ordersByDestinationLytd,
		destinations,
		merchants
	] = await Promise.all([
		orderSumStmt.bind(startOfWeek(today).toISOString()).all(),
		orderSumStmt.bind(startOfMonth(today).toISOString()).all(),
		orderSumStmt.bind(startOfYear(today).toISOString()).all(),
		orderSumStmt2.bind(lastYearStartOfYear.toISOString(), lastYearEndOfYear.toISOString()).all(),
		orderByMerchantStmt.bind(startOfWeek(today).toISOString()).all(),
		orderByMerchantStmt.bind(startOfMonth(today).toISOString()).all(),
		orderByMerchantStmt.bind(startOfYear(today).toISOString()).all(),
		orderByMerchantStmt2
			.bind(lastYearStartOfYear.toISOString(), lastYearEndOfYear.toISOString())
			.all(),
		orderByDestinationStmt.bind(startOfWeek(today).toISOString()).all(),
		orderByDestinationStmt.bind(startOfMonth(today).toISOString()).all(),
		orderByDestinationStmt.bind(startOfYear(today).toISOString()).all(),
		orderByDestinationStmt2
			.bind(lastYearStartOfYear.toISOString(), lastYearEndOfYear.toISOString())
			.all(),
		destinationsStmt.all(),
		merchantsStmt.all()
	]);

	return {
		wtd,
		mtd,
		ytd,
		lytd,
		ordersByMerchantWtd,
		ordersByMerchantMtd,
		ordersByMerchantYtd,
		ordersByMerchantLytd,
		ordersByDestinationWtd,
		ordersByDestinationMtd,
		ordersByDestinationYtd,
		ordersByDestinationLytd,
		destinations,
		merchants
	};
}
