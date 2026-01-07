import { json } from '@sveltejs/kit';
import { getUser, createSession, grantMerchantAccess } from '$lib/server/user.js';

/**
 * POST /api/magic-link/verify
 * Verify a magic link token and return session info.
 */
export async function POST({ request, platform, cookies }) {
	try {
		const { token } = await request.json();

		if (!token) {
			return json({ error: 'Token is required' }, { status: 400 });
		}

		// Validate token format (64 hex characters)
		if (!/^[a-f0-9]{64}$/.test(token)) {
			return json({ error: 'Invalid token format' }, { status: 400 });
		}

		// Get token from KV
		if (!platform?.env?.OTP_STORE) {
			console.error('OTP_STORE KV namespace not configured');
			return json({ error: 'Service configuration error' }, { status: 500 });
		}

		const stored = await platform.env.OTP_STORE.get(`magic:${token}`);
		if (!stored) {
			return json(
				{ error: 'Invalid or expired link. Please request a new one.' },
				{ status: 400 }
			);
		}

		const storedData = JSON.parse(stored);

		// Check if token has expired
		if (Date.now() > storedData.expiresAt) {
			await platform.env.OTP_STORE.delete(`magic:${token}`);
			return json({ error: 'Link has expired. Please request a new one.' }, { status: 400 });
		}

		// Token is valid - clean up (single use)
		await platform.env.OTP_STORE.delete(`magic:${token}`);

		// Get existing user from D1 - login only works for existing users
		const user = await getUser({
			platform,
			email: storedData.email
		});

		if (!user) {
			return json(
				{ error: 'No account found with this email. Please sign up first.' },
				{ status: 404 }
			);
		}

		// Get JWT secret
		const jwtSecret = platform?.env?.JWT_SECRET;
		if (!jwtSecret) {
			console.error('JWT_SECRET not configured');
			return json({ error: 'Service configuration error' }, { status: 500 });
		}

		// Get device info from request
		const userAgent = request.headers.get('user-agent') || '';
		const ipAddress =
			request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';

		// Create session
		const { token: sessionToken } = await createSession({
			platform,
			userId: user.userId,
			email: user.email,
			userAgent,
			ipAddress,
			jwtSecret
		});

		// Grant access to the user's email domain merchant (if applicable)
		const emailDomain = storedData.email.split('@')[1];
		if (emailDomain) {
			await grantMerchantAccess({
				platform,
				userId: user.userId,
				merchantDomain: emailDomain,
				role: 'owner'
			});
		}

		// Set session cookie with JWT
		cookies.set('session', sessionToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 // 7 days - JWT inside expires every 30min and gets renewed
		});

		return json({
			success: true,
			message: 'Login successful',
			email: storedData.email,
			userId: user.userId,
			redirectTo: '/'
		});
	} catch (error) {
		console.error('Magic link verify error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
