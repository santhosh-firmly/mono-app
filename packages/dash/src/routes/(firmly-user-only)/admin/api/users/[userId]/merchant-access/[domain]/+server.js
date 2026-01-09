import { json } from '@sveltejs/kit';
import { removeTeamMember } from '$lib/server/merchant.js';

/**
 * DELETE /admin/api/users/[userId]/merchant-access/[domain]
 * Revoke a user's access to a merchant (admin operation).
 * Updates both MerchantDO and DashUserDO.
 */
export async function DELETE({ params, locals, platform }) {
	const { authInfo } = locals;

	if (!authInfo?.oid || !authInfo?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { userId, domain } = params;

	if (!userId || !domain) {
		return json({ error: 'User ID and domain are required' }, { status: 400 });
	}

	try {
		// Use the existing removeTeamMember function which handles dual-write
		const success = await removeTeamMember({
			platform,
			merchantDomain: domain,
			userId,
			actor: {
				id: authInfo.oid,
				email: authInfo.email,
				isFirmlyAdmin: true
			}
		});

		if (!success) {
			return json({ error: 'Failed to revoke merchant access' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error revoking merchant access:', error);
		return json({ error: 'Failed to revoke merchant access' }, { status: 500 });
	}
}
