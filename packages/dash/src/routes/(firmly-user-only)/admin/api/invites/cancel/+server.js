import { json } from '@sveltejs/kit';
import { getUserIdByEmail, removePendingInvite } from '$lib/server/user.js';
import { createAuditLog, AuditEventTypes } from '$lib/server/merchant.js';

/**
 * POST /admin/api/invites/cancel
 * Cancel a pending invitation for a merchant.
 * Body: { merchantDomain } - token is looked up from KV
 */
export async function POST({ request, platform, locals }) {
	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;

	if (!db || !kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		const { merchantDomain } = await request.json();

		if (!merchantDomain) {
			return json({ error: 'Merchant domain is required' }, { status: 400 });
		}

		// Lookup the token by merchant domain
		const token = await kv.get(`invite-domain:${merchantDomain}`);
		if (!token) {
			return json({ error: 'No pending invite found for this merchant' }, { status: 404 });
		}

		// Get invite data
		const inviteDataStr = await kv.get(`invite:${token}`);
		if (!inviteDataStr) {
			// Token reference exists but invite is gone - clean up
			await kv.delete(`invite-domain:${merchantDomain}`);
			return json({ error: 'Invite not found' }, { status: 404 });
		}

		const inviteData = JSON.parse(inviteDataStr);

		// Remove from user's pending invites if they have an account
		const inviteeUser = await getUserIdByEmail({ platform, email: inviteData.email });
		if (inviteeUser) {
			await removePendingInvite({ platform, userId: inviteeUser.userId, token });
		}

		// Delete the invite KV entries
		await kv.delete(`invite:${token}`);
		await kv.delete(`invite-domain:${merchantDomain}`);

		// Clear owner_email from merchant_dashboards if this was an owner invite
		// and no user has accepted ownership yet
		if (inviteData.role === 'owner') {
			await db
				.prepare(
					`UPDATE merchant_dashboards
					 SET owner_email = NULL
					 WHERE domain = ? AND owner_user_id IS NULL AND owner_email = ?`
				)
				.bind(merchantDomain, inviteData.email)
				.run();
		}

		// Create audit log for the cancellation (marked as Firmly admin action)
		const actorId = locals.authInfo?.oid || locals.authInfo?.sub || 'admin';
		const actorEmail =
			locals.authInfo?.preferred_username || locals.authInfo?.email || 'admin@firmly.ai';

		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.INVITE_CANCELLED,
			actorId,
			actorEmail,
			targetEmail: inviteData.email,
			details: { role: inviteData.role, source: 'admin' },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return json({
			success: true,
			message: `Invitation cancelled for ${inviteData.email}`
		});
	} catch (error) {
		console.error('Error cancelling invite:', error);
		return json({ error: 'Failed to cancel invitation' }, { status: 500 });
	}
}
