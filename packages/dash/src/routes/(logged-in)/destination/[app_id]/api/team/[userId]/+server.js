import { json } from '@sveltejs/kit';
import {
	getDestinationAccess,
	getDestinationTeam,
	updateDestinationTeamMemberRole,
	removeDestinationTeamMember
} from '$lib/server/destination.js';

/**
 * PUT /destination/[app_id]/api/team/[userId]
 * Update a team member's role.
 */
export async function PUT({ locals, params, platform, request }) {
	const { session } = locals;
	const { app_id: appId, userId: targetUserId } = params;

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

			// Only owners can change roles
			if (userRole !== 'owner') {
				return json({ error: 'Only owners can change roles' }, { status: 403 });
			}
		}

		// Can't change your own role
		if (targetUserId === session.userId) {
			return json({ error: 'Cannot change your own role' }, { status: 400 });
		}

		const body = await request.json();
		const { role: newRole } = body;

		if (!['owner', 'editor', 'viewer'].includes(newRole)) {
			return json({ error: 'Invalid role' }, { status: 400 });
		}

		// Get current team to find target member info
		const team = await getDestinationTeam({ platform, appId });
		const targetMember = team.find((m) => m.user_id === targetUserId);

		if (!targetMember) {
			return json({ error: 'Team member not found' }, { status: 404 });
		}

		const success = await updateDestinationTeamMemberRole({
			platform,
			appId,
			userId: targetUserId,
			newRole,
			oldRole: targetMember.role,
			targetEmail: targetMember.user_email,
			actor: {
				id: session.userId,
				email: session.email,
				isFirmlyAdmin: session.isFirmlyAdmin || false,
				role: userRole
			}
		});

		if (!success) {
			return json({ error: 'Failed to update role' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error updating role:', error);
		return json({ error: 'Failed to update role' }, { status: 500 });
	}
}

/**
 * DELETE /destination/[app_id]/api/team/[userId]
 * Remove a team member.
 */
export async function DELETE({ locals, params, platform }) {
	const { session } = locals;
	const { app_id: appId, userId: targetUserId } = params;

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

			// Only owners can remove members
			if (userRole !== 'owner') {
				return json({ error: 'Only owners can remove members' }, { status: 403 });
			}
		}

		// Can't remove yourself
		if (targetUserId === session.userId) {
			return json({ error: 'Cannot remove yourself' }, { status: 400 });
		}

		// Get current team to find target member info
		const team = await getDestinationTeam({ platform, appId });
		const targetMember = team.find((m) => m.user_id === targetUserId);

		if (!targetMember) {
			return json({ error: 'Team member not found' }, { status: 404 });
		}

		const success = await removeDestinationTeamMember({
			platform,
			appId,
			userId: targetUserId,
			userEmail: targetMember.user_email,
			role: targetMember.role,
			targetEmail: targetMember.user_email,
			actor: {
				id: session.userId,
				email: session.email,
				isFirmlyAdmin: session.isFirmlyAdmin || false,
				role: userRole
			}
		});

		if (!success) {
			return json({ error: 'Failed to remove member' }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error removing member:', error);
		return json({ error: 'Failed to remove member' }, { status: 500 });
	}
}
