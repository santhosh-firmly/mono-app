import { json } from '@sveltejs/kit';
import {
	getMerchantAccess,
	getUserIdByEmail,
	removePendingInvite as removePendingInviteFromUser
} from '$lib/server/user.js';
import {
	createAuditLog,
	AuditEventTypes,
	removePendingInvite as removePendingInviteFromMerchant
} from '$lib/server/merchant.js';

/**
 * POST /merchant/[domain]/api/team/invite/cancel
 * Cancel a pending team invitation.
 * Body: { token }
 */
export async function POST({ locals, params, platform, request }) {
	const { userId, email: actorEmail, isFirmlyAdmin } = locals.session;
	const { domain } = params;
	const kv = platform?.env?.OTP_STORE;

	if (!kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		// Verify current user is an owner (check DashUserDO) or a Firmly admin
		let isOwner = isFirmlyAdmin === true;
		let currentRole = null;
		if (!isOwner) {
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);
			currentRole = currentAccess?.role;
			isOwner = currentRole === 'owner';
		}

		if (!isOwner) {
			return json({ error: 'Only owners can cancel team invitations' }, { status: 403 });
		}

		// Determine actor type for audit log
		const actorType = isFirmlyAdmin ? 'firmly_admin' : currentRole || 'user';

		const { token } = await request.json();

		if (!token) {
			return json({ error: 'Token is required' }, { status: 400 });
		}

		// Get invite data
		const inviteDataStr = await kv.get(`invite:${token}`);
		if (!inviteDataStr) {
			return json({ error: 'Invite not found' }, { status: 404 });
		}

		const inviteData = JSON.parse(inviteDataStr);

		// Verify invite is for this merchant
		if (inviteData.merchantDomain !== domain) {
			return json({ error: 'Invite not found for this merchant' }, { status: 404 });
		}

		// Remove from KV
		await kv.delete(`invite:${token}`);

		// Remove from MerchantDO
		await removePendingInviteFromMerchant({ platform, merchantDomain: domain, token });

		// Remove from invitee's DashUserDO if they have an account
		const inviteeUser = await getUserIdByEmail({ platform, email: inviteData.email });
		if (inviteeUser) {
			await removePendingInviteFromUser({ platform, userId: inviteeUser.userId, token });
		}

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain: domain,
			eventType: AuditEventTypes.INVITE_CANCELLED,
			actorId: userId,
			actorEmail,
			targetEmail: inviteData.email,
			details: { role: inviteData.role, source: 'team' },
			isFirmlyAdmin,
			actorType
		});

		return json({
			success: true,
			message: `Invitation cancelled for ${inviteData.email}`
		});
	} catch (error) {
		console.error('Error cancelling team invite:', error);
		return json({ error: 'Failed to cancel invitation' }, { status: 500 });
	}
}
