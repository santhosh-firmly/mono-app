/** @type {import('./$types').PageServerLoad} */
export async function load({ url, platform }) {
	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;

	const token = url.searchParams.get('token');

	if (!token) {
		return {
			valid: false,
			error: 'No invitation token provided'
		};
	}

	// Validate token format
	if (!/^[a-f0-9]{64}$/i.test(token)) {
		return {
			valid: false,
			error: 'Invalid invitation link'
		};
	}

	if (!db || !kv) {
		return {
			valid: false,
			error: 'Service temporarily unavailable'
		};
	}

	try {
		// Get invite from KV
		const stored = await kv.get(`invite:${token}`);

		if (!stored) {
			return {
				valid: false,
				error: 'This invitation is invalid or has expired'
			};
		}

		const inviteData = JSON.parse(stored);

		// Check if expired
		if (Date.now() > inviteData.expiresAt) {
			await kv.delete(`invite:${token}`);
			return {
				valid: false,
				error: 'This invitation has expired. Please contact your administrator for a new invitation.'
			};
		}

		// Check if user already exists
		const existingUser = await db
			.prepare('SELECT id, email FROM users WHERE email = ?')
			.bind(inviteData.email)
			.first();

		return {
			valid: true,
			token,
			email: inviteData.email,
			merchantDomain: inviteData.merchantDomain,
			role: inviteData.role,
			invitedByEmail: inviteData.invitedByEmail,
			isFirmlyAdmin: inviteData.isFirmlyAdmin || false,
			existingUser: !!existingUser
		};
	} catch (error) {
		console.error('Error loading invite:', error);
		return {
			valid: false,
			error: 'Failed to load invitation details'
		};
	}
}
