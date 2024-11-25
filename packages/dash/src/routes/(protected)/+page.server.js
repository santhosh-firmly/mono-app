import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';

/** @type {import('./$types').PageLoad} */
export async function load({ platform }) {
    const orderSumStmt = platform.env.reporting.prepare('SELECT SUM(order_total) FROM orders WHERE created_dt > ?1');
    const lastOrdersStmt = platform.env.reporting.prepare('SELECT * FROM orders ORDER BY created_dt desc limit 10');
    const today = new Date();
    const [wtd, mtd, ytd, orders] = await Promise.all([
        orderSumStmt.bind(startOfWeek(today).toISOString()).all(),
        orderSumStmt.bind(startOfMonth(today).toISOString()).all(),
        orderSumStmt.bind(startOfYear(today).toISOString()).all(),
        lastOrdersStmt.all(),
    ]);

    return {
        wtd, mtd, ytd, orders
    };
}
