import { json } from '@sveltejs/kit';
import { getDestinationAccess, createDestinationInvite } from '$lib/server/destination.js';

/**
 * POST /destination/[app_id]/api/team/invite
 * Create a team invitation.
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

			// Only owners can invite members
			if (userRole !== 'owner') {
				return json({ error: 'Only owners can invite members' }, { status: 403 });
			}
		}

		const body = await request.json();
		const { email, role = 'viewer' } = body;

		if (!email) {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		if (!['owner', 'editor', 'viewer'].includes(role)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		const result = await createDestinationInvite({
			platform,
			appId,
			email,
			role,
			actor: {
				id: session.userId,
				email: session.email,
				isFirmlyAdmin: session.isFirmlyAdmin || false,
				role: userRole
			}
		});

		if (!result.success) {
			return json({ error: result.error || 'Failed to create invite' }, { status: 500 });
		}

		return json({ success: true, invite: result.invite });
	} catch (error) {
		console.error('Error creating invite:', error);
		return json({ error: 'Failed to create invite' }, { status: 500 });
	}
}
