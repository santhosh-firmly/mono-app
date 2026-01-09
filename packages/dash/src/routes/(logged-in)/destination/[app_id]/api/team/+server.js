import { json } from '@sveltejs/kit';
import { getDestinationAccess, getDestinationTeam } from '$lib/server/destination.js';

/**
 * GET /destination/[app_id]/api/team
 * Get team members for this destination.
 */
export async function GET({ locals, params, platform }) {
	const { session } = locals;
	const { app_id: appId } = params;

	try {
		// Verify user has access to this destination (unless Firmly admin)
		if (!session?.isFirmlyAdmin) {
			const access = await getDestinationAccess({ platform, userId: session.userId });
			const hasAccess = access.some((a) => a.app_id === appId);
			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		const team = await getDestinationTeam({ platform, appId });
		return json({ team });
	} catch (error) {
		console.error('Error fetching team:', error);
		return json({ error: 'Failed to fetch team' }, { status: 500 });
	}
}
