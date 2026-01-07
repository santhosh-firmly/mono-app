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

		// Check if user already exists (shouldn't be on this page if they do)
		const existingUser = await db
			.prepare('SELECT id, email FROM users WHERE email = ?')
			.bind(inviteData.email)
			.first();

		if (existingUser) {
			// User already exists, they should use the main invite page
			return {
				valid: false,
				error: 'You already have an account. Please use the invitation link again to accept.',
				redirectTo: `/invite?token=${token}`
			};
		}

		return {
			valid: true,
			token,
			email: inviteData.email,
			merchantDomain: inviteData.merchantDomain,
			role: inviteData.role
		};
	} catch (error) {
		console.error('Error loading invite profile:', error);
		return {
			valid: false,
			error: 'Failed to load invitation details'
		};
	}
}
