import { json } from '@sveltejs/kit';
import { getProfile, getMerchantAccess } from '$lib/server/user.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, locals, platform }) {
	const { authInfo } = locals;

	if (!authInfo?.oid) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { userId } = params;

	if (!userId) {
		return json({ error: 'User ID is required' }, { status: 400 });
	}

	try {
		// Fetch user profile from DashUserDO
		const [profile, merchantAccess] = await Promise.all([
			getProfile({ platform, userId }),
			getMerchantAccess({ platform, userId })
		]);

		return json({
			profile,
			merchantAccess
		});
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return json({ error: 'Failed to fetch user profile' }, { status: 500 });
	}
}
