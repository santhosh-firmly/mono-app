import { startOfWeek, startOfMonth, startOfYear } from 'date-fns';

/** @type {import('./$types').PageLoad} */
export async function load({ platform }) {
	const lastOrdersStmt = platform.env.reporting.prepare(
		'SELECT * FROM orders ORDER BY created_dt desc limit 10'
	);
	const [orders] = await Promise.all([lastOrdersStmt.all()]);

	return {
		orders
	};
}
