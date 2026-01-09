import { json } from '@sveltejs/kit';
import { getDestinationAccess, cancelDestinationInvite } from '$lib/server/destination.js';

/**
 * POST /destination/[app_id]/api/team/invite/cancel
 * Cancel a pending invitation.
 */
export async function POST({ locals, params, platform, request }) {
	const { session } = locals;
	const { app_id: appId } = params;

	try {
		// Verify user has access and is owner (unless Firmly admin)
		let userRole = null;
		if (!session?.isFirmlyAdmin) {
			const access = await getDestinationAccess({ platform, userId: session.userId });
			const userAccess = access.find((a) => a.app_id === appId);
			if (!userAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
			userRole = userAccess.role;

			// Only owners can cancel invites
			if (userRole !== 'owner') {
				return json({ error: 'Only owners can cancel invites' }, { status: 403 });
			}
		}

		const body = await request.json();
		const { inviteId } = body;

		if (!inviteId) {
			return json({ error: 'Invite ID is required' }, { status: 400 });
		}

		const success = await cancelDestinationInvite({
			platform,
			appId,
			inviteId,
			actor: {
				id: session.userId,
				email: session.email,
				isFirmlyAdmin: session.isFirmlyAdmin || false,
				role: userRole
			}
		});

		if (!success) {
			return json({ error: 'Failed to cancel invite' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error cancelling invite:', error);
		return json({ error: 'Failed to cancel invite' }, { status: 500 });
	}
}
