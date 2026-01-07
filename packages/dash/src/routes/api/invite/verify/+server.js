import { json } from '@sveltejs/kit';

/**
 * GET /api/invite/verify?token=xxx
 * Verify an invite token and return invite details.
 */
export async function GET({ url, platform }) {
	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;

	if (!db || !kv) {
		return json({ error: 'Service not configured' }, { status: 500 });
	}

	const token = url.searchParams.get('token');

	if (!token) {
		return json({ error: 'Token is required' }, { status: 400 });
	}

	// Validate token format (64 hex chars)
	if (!/^[a-f0-9]{64}$/i.test(token)) {
		return json({ valid: false, error: 'Invalid token format' }, { status: 400 });
	}

	try {
		// Get invite from KV
		const stored = await kv.get(`invite:${token}`);

		if (!stored) {
			return json({ valid: false, error: 'Invalid or expired invitation' }, { status: 404 });
		}

		const inviteData = JSON.parse(stored);

		// Check if expired
		if (Date.now() > inviteData.expiresAt) {
			// Clean up expired invite
			await kv.delete(`invite:${token}`);
			return json({ valid: false, error: 'This invitation has expired' }, { status: 410 });
		}

		// Check if user already exists in D1
		const existingUser = await db
			.prepare('SELECT id, email FROM users WHERE email = ?')
			.bind(inviteData.email)
			.first();

		return json({
			valid: true,
			email: inviteData.email,
			merchantDomain: inviteData.merchantDomain,
			role: inviteData.role,
			invitedByEmail: inviteData.invitedByEmail,
			existingUser: !!existingUser
		});
	} catch (error) {
		console.error('Error verifying invite:', error);
		return json({ error: 'Failed to verify invitation' }, { status: 500 });
	}
}
