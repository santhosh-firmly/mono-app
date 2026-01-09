import {
	getDestinationAccess,
	getDestinationTeam,
	addDestinationTeamMember
} from '$lib/server/destination.js';

/**
 * Load function for the team management page.
 * Access check is already done by the parent layout, so we just need to
 * get the team data and check if the current user is an owner.
 */
export async function load({ locals, params, platform, parent }) {
	const { userId, email } = locals.session;
	const { app_id: appId } = params;

	// Get parent data which includes userRole (already verified access)
	const parentData = await parent();
	const isOwner = parentData.userRole === 'owner';

	// Get team members from DestinationDO
	let team = await getDestinationTeam({ platform, appId });

	// If team is empty, bootstrap from current user's DashUserDO access
	// This handles the transition for existing users who don't have DestinationDO data yet
	if (team.length === 0) {
		const destinationAccess = await getDestinationAccess({ platform, userId });
		const currentAccess = destinationAccess.find((a) => a.app_id === appId);

		if (currentAccess) {
			// Add current user to DestinationDO (bootstrap the team)
			await addDestinationTeamMember({
				platform,
				appId,
				userId,
				userEmail: email,
				role: currentAccess.role || 'owner',
				grantedBy: null
			});

			// Refresh team list
			team = await getDestinationTeam({ platform, appId });
		}
	}

	return {
		team,
		isOwner,
		currentUserId: userId
	};
}
