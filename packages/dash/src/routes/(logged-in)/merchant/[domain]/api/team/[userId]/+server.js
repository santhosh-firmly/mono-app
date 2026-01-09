import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { updateTeamMemberRole, removeTeamMember, getMerchantTeam } from '$lib/server/merchant.js';

/**
 * PUT /merchant/[domain]/api/team/[userId]
 * Update a team member's role.
 * Body: { role: 'owner' | 'editor' | 'viewer' }
 */
export async function PUT({ locals, params, platform, request }) {
	const { userId: currentUserId, email: currentUserEmail, isFirmlyAdmin } = locals.session;
	const { domain, userId: targetUserId } = params;

	try {
		// Verify current user is an owner (check DashUserDO) or a Firmly admin
		let isOwner = isFirmlyAdmin === true;
		let currentRole = null;
		if (!isOwner) {
			const merchantAccess = await getMerchantAccess({ platform, userId: currentUserId });
			const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);
			currentRole = currentAccess?.role;
			isOwner = currentRole === 'owner';
		}

		if (!isOwner) {
			return json({ error: 'Only owners can change team member roles' }, { status: 403 });
		}

		const { role } = await request.json();

		// Validate role
		const validRoles = ['owner', 'editor', 'viewer'];
		if (!role || !validRoles.includes(role)) {
			return json(
				{ error: 'Invalid role. Must be owner, editor, or viewer' },
				{ status: 400 }
			);
		}

		// Get target user's email for audit log
		const team = await getMerchantTeam({ platform, merchantDomain: domain });
		const targetMember = team.find((m) => m.user_id === targetUserId);

		// Update the role with audit logging
		const success = await updateTeamMemberRole({
			platform,
			merchantDomain: domain,
			userId: targetUserId,
			newRole: role,
			actor: {
				id: currentUserId,
				email: currentUserEmail,
				isFirmlyAdmin,
				role: currentRole
			},
			targetEmail: targetMember?.user_email
		});

		if (!success) {
			return json({ error: 'Failed to update role' }, { status: 500 });
		}

		return json({ success: true, message: 'Role updated successfully' });
	} catch (error) {
		console.error('Error updating team member role:', error);
		return json({ error: 'Failed to update role' }, { status: 500 });
	}
}

/**
 * DELETE /merchant/[domain]/api/team/[userId]
 * Remove a team member from this merchant.
 */
export async function DELETE({ locals, params, platform }) {
	const { userId: currentUserId, email: currentUserEmail, isFirmlyAdmin } = locals.session;
	const { domain, userId: targetUserId } = params;

	try {
		// Verify current user is an owner (check DashUserDO) or a Firmly admin
		let isOwner = isFirmlyAdmin === true;
		let currentRole = null;
		if (!isOwner) {
			const merchantAccess = await getMerchantAccess({ platform, userId: currentUserId });
			const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);
			currentRole = currentAccess?.role;
			isOwner = currentRole === 'owner';
		}

		if (!isOwner) {
			return json({ error: 'Only owners can remove team members' }, { status: 403 });
		}

		// Prevent self-removal
		if (currentUserId === targetUserId) {
			return json({ error: 'You cannot remove yourself from the team' }, { status: 400 });
		}

		// Get target user's email for audit log
		const team = await getMerchantTeam({ platform, merchantDomain: domain });
		const targetMember = team.find((m) => m.user_id === targetUserId);

		// Remove the team member with audit logging
		const success = await removeTeamMember({
			platform,
			merchantDomain: domain,
			userId: targetUserId,
			actor: {
				id: currentUserId,
				email: currentUserEmail,
				isFirmlyAdmin,
				role: currentRole
			},
			targetEmail: targetMember?.user_email
		});

		if (!success) {
			return json({ error: 'Failed to remove team member' }, { status: 500 });
		}

		return json({ success: true, message: 'Team member removed successfully' });
	} catch (error) {
		console.error('Error removing team member:', error);
		return json({ error: 'Failed to remove team member' }, { status: 500 });
	}
}
