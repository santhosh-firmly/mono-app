import { json } from '@sveltejs/kit';
import { getUserIdByEmail, removePendingInvite } from '$lib/server/user.js';
import { createDestinationAuditLog, DestinationAuditEventTypes } from '$lib/server/destination.js';

/**
 * POST /admin/api/invites/cancel-destination
 * Cancel a pending invitation for a destination.
 * Body: { appId } - token is looked up from KV
 */
export async function POST({ request, platform, locals }) {
	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;

	if (!db || !kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		const { appId } = await request.json();

		if (!appId) {
			return json({ error: 'App ID is required' }, { status: 400 });
		}

		// Lookup the token by app ID
		const token = await kv.get(`invite-destination:${appId}`);
		if (!token) {
			return json({ error: 'No pending invite found for this destination' }, { status: 404 });
		}

		// Get invite data
		const inviteDataStr = await kv.get(`invite:${token}`);
		if (!inviteDataStr) {
			// Token reference exists but invite is gone - clean up
			await kv.delete(`invite-destination:${appId}`);
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
		await kv.delete(`invite-destination:${appId}`);

		// Clear owner_email from destination_dashboards if this was an owner invite
		// and no user has accepted ownership yet
		if (inviteData.role === 'owner') {
			await db
				.prepare(
					`UPDATE destination_dashboards
					 SET owner_email = NULL
					 WHERE app_id = ? AND owner_user_id IS NULL AND owner_email = ?`
				)
				.bind(appId, inviteData.email)
				.run();
		}

		// Create audit log for the cancellation (marked as Firmly admin action)
		const actorId = locals.authInfo?.oid || locals.authInfo?.sub || 'admin';
		const actorEmail =
			locals.authInfo?.preferred_username || locals.authInfo?.email || 'admin@firmly.ai';

		await createDestinationAuditLog({
			platform,
			appId,
			eventType: DestinationAuditEventTypes.INVITE_CANCELLED,
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
		console.error('Error cancelling destination invite:', error);
		return json({ error: 'Failed to cancel invitation' }, { status: 500 });
	}
}
