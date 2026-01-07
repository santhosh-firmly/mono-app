import { json } from '@sveltejs/kit';
import { removePendingInvite } from '$lib/server/user.js';

/**
 * POST /api/invites/decline
 * Decline an invitation - removes from both KV and user's DashUserDO.
 * Body: { token }
 */
export async function POST({ locals, platform, request }) {
	const { userId } = locals.session;
	const kv = platform?.env?.OTP_STORE;

	if (!kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	try {
		const { token } = await request.json();

		if (!token) {
			return json({ error: 'Token is required' }, { status: 400 });
		}

		// Validate token format (64 hex chars)
		if (!/^[a-f0-9]{64}$/i.test(token)) {
			return json({ error: 'Invalid token format' }, { status: 400 });
		}

		// Remove from KV (so email link no longer works)
		await kv.delete(`invite:${token}`);

		// Remove from user's pending invites
		await removePendingInvite({ platform, userId, token });

		return json({ success: true });
	} catch (error) {
		console.error('Error declining invite:', error);
		return json({ error: 'Failed to decline invitation' }, { status: 500 });
	}
}
