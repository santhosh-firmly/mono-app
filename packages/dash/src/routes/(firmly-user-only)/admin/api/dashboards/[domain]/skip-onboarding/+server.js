import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, locals, platform }) {
	const { domain } = params;
	const { authInfo } = locals;

	if (!authInfo?.oid || !authInfo?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!domain) {
		return json({ error: 'Domain is required' }, { status: 400 });
	}

	const db = platform?.env?.dashUsers;
	if (!db) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
		// Get the current value
		const { results } = await db
			.prepare('SELECT allow_skip_onboarding FROM merchant_dashboards WHERE domain = ?')
			.bind(domain)
			.all();

		const currentValue = results[0]?.allow_skip_onboarding || 0;
		const newValue = currentValue ? 0 : 1;

		// Update the value (upsert)
		await db
			.prepare(
				`INSERT INTO merchant_dashboards (domain, allow_skip_onboarding)
				 VALUES (?, ?)
				 ON CONFLICT(domain) DO UPDATE SET allow_skip_onboarding = excluded.allow_skip_onboarding`
			)
			.bind(domain, newValue)
			.run();

		return json({
			success: true,
			allow_skip_onboarding: newValue
		});
	} catch (error) {
		console.error('Error toggling skip onboarding:', error);
		return json({ error: 'Failed to toggle skip onboarding' }, { status: 500 });
	}
}
