import { json } from '@sveltejs/kit';

/**
 * GET /admin/api/dashboards
 * List all merchant dashboards.
 */
export async function GET({ platform }) {
	const db = platform?.env?.dashUsers;
	if (!db) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
		const { results } = await db
			.prepare(
				`SELECT domain, created_at, created_by, owner_email, owner_user_id, status, notes
				 FROM merchant_dashboards
				 ORDER BY created_at DESC`
			)
			.all();

		return json({ dashboards: results });
	} catch (error) {
		console.error('Error fetching dashboards:', error);
		return json({ error: 'Failed to fetch dashboards' }, { status: 500 });
	}
}

/**
 * POST /admin/api/dashboards
 * Create a new merchant dashboard.
 * Body: { domain, notes? }
 */
export async function POST({ request, platform, locals }) {
	const db = platform?.env?.dashUsers;
	if (!db) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
		const { domain, notes } = await request.json();

		if (!domain) {
			return json({ error: 'Domain is required' }, { status: 400 });
		}

		// Validate domain format (basic check)
		const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}$/;
		if (!domainRegex.test(domain)) {
			return json({ error: 'Invalid domain format' }, { status: 400 });
		}

		// Check if dashboard already exists
		const existing = await db
			.prepare('SELECT domain FROM merchant_dashboards WHERE domain = ?')
			.bind(domain)
			.first();

		if (existing) {
			return json({ error: 'A dashboard for this domain already exists' }, { status: 409 });
		}

		// Get admin user ID from auth info
		const createdBy = locals.authInfo?.oid || locals.authInfo?.sub || 'unknown';

		// Create the dashboard
		await db
			.prepare(
				`INSERT INTO merchant_dashboards (domain, created_by, status, notes)
				 VALUES (?, ?, 'pending', ?)`
			)
			.bind(domain, createdBy, notes || null)
			.run();

		return json({
			success: true,
			dashboard: {
				domain,
				created_by: createdBy,
				status: 'pending',
				notes: notes || null
			}
		});
	} catch (error) {
		console.error('Error creating dashboard:', error);
		return json({ error: 'Failed to create dashboard' }, { status: 500 });
	}
}
