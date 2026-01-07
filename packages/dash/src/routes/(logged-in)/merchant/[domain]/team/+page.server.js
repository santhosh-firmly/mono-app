import { getMerchantAccess } from '$lib/server/user.js';
import { getMerchantTeam, addTeamMember } from '$lib/server/merchant.js';

/**
 * Load function for the team management page.
 * Access check is already done by the parent layout, so we just need to
 * get the team data and check if the current user is an owner.
 */
export async function load({ locals, params, platform, parent }) {
	const { userId, email } = locals.session;
	const { domain } = params;

	// Get parent data which includes userRole (already verified access)
	const parentData = await parent();
	const isOwner = parentData.userRole === 'owner';

	// Get team members from MerchantDO
	let team = await getMerchantTeam({ platform, merchantDomain: domain });

	// If team is empty, bootstrap from current user's DashUserDO access
	// This handles the transition for existing users who don't have MerchantDO data yet
	if (team.length === 0) {
		const merchantAccess = await getMerchantAccess({ platform, userId });
		const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);

		if (currentAccess) {
			// Add current user to MerchantDO (bootstrap the team)
			await addTeamMember({
				platform,
				merchantDomain: domain,
				userId,
				userEmail: email,
				role: currentAccess.role || 'owner',
				grantedBy: null
			});

			// Refresh team list
			team = await getMerchantTeam({ platform, merchantDomain: domain });
		}
	}

	return {
		team,
		isOwner,
		currentUserId: userId
	};
}
