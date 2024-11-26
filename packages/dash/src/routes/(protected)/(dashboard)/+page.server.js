import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';

/** @type {import('./$types').PageLoad} */
export async function load({ platform }) {
    const orderSumStmt = platform.env.reporting.prepare('SELECT coalesce(SUM(order_total), 0) FROM orders WHERE created_dt > ?1');
    const orderByMerchantStmt = platform.env.reporting.prepare('SELECT shop_id, SUM(order_total) as net_sales, count(*) as total_orders, avg(order_total) as aov FROM orders WHERE created_dt > ?1 GROUP BY shop_id');
    const orderByDestinationStmt = platform.env.reporting.prepare('SELECT app_id, SUM(order_total) as net_sales, count(*) as total_orders, avg(order_total) as aov FROM orders WHERE created_dt > ?1 GROUP BY app_id');
    const today = new Date();

    const destinationsStmt = platform.env.firmlyConfigs.prepare('SELECT key, info from app_identifiers');

    const [wtd, mtd, ytd, ordersByMerchantWtd, ordersByMerchantMtd, ordersByMerchantYtd, ordersByDestinationWtd, ordersByDestinationMtd, ordersByDestinationYtd, destinations] = await Promise.all([
        orderSumStmt.bind(startOfWeek(today).toISOString()).all(),
        orderSumStmt.bind(startOfMonth(today).toISOString()).all(),
        orderSumStmt.bind(startOfYear(today).toISOString()).all(),
        orderByMerchantStmt.bind(startOfWeek(today).toISOString()).all(),
        orderByMerchantStmt.bind(startOfMonth(today).toISOString()).all(),
        orderByMerchantStmt.bind(startOfYear(today).toISOString()).all(),
        orderByDestinationStmt.bind(startOfWeek(today).toISOString()).all(),
        orderByDestinationStmt.bind(startOfMonth(today).toISOString()).all(),
        orderByDestinationStmt.bind(startOfYear(today).toISOString()).all(),
        destinationsStmt.all(),
    ]);

    return {
        wtd, mtd, ytd, ordersByMerchantWtd, ordersByMerchantMtd, ordersByMerchantYtd,
        ordersByDestinationWtd, ordersByDestinationMtd, ordersByDestinationYtd, destinations,
    };
}
