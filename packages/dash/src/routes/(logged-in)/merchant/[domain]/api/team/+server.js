import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { getMerchantTeam } from '$lib/server/merchant.js';

/**
 * GET /merchant/[domain]/api/team
 * Get all team members for this merchant.
 */
export async function GET({ locals, params, platform }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Firmly admins have access to all merchants
		if (!isFirmlyAdmin) {
			// Verify user has access to this merchant (check DashUserDO)
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const hasAccess = merchantAccess.some((a) => a.merchant_domain === domain);

			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		// Get team members from MerchantDO
		const team = await getMerchantTeam({ platform, merchantDomain: domain });

		return json({ team });
	} catch (error) {
		console.error('Error fetching team:', error);
		return json({ error: 'Failed to fetch team' }, { status: 500 });
	}
}
