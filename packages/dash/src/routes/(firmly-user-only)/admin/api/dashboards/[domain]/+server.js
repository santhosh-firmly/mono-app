import { json } from '@sveltejs/kit';
import { resetMerchantDashboard } from '$lib/server/merchant.js';

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, locals, platform }) {
	const { domain } = params;
	const { authInfo } = locals;

	if (!authInfo?.oid || !authInfo?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!domain) {
		return json({ error: 'Domain is required' }, { status: 400 });
	}

	const result = await resetMerchantDashboard({
		platform,
		merchantDomain: domain,
		actor: {
			id: authInfo.oid,
			email: authInfo.email
		}
	});

	if (!result.success) {
		return json({ error: result.error || 'Failed to reset dashboard' }, { status: 500 });
	}

	return json({
		success: true,
		clearedTeamMembers: result.clearedTeamMembers
	});
}
