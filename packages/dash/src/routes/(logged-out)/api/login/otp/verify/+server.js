import { json } from '@sveltejs/kit';
import { getUser, createSession, grantMerchantAccess } from '$lib/server/user.js';
import {
	checkRateLimit,
	rateLimitedResponse,
	resetRateLimit,
	RATE_LIMIT_PRESETS
} from '$lib/server/rate-limit.js';

/**
 * POST /api/login/otp/verify
 * Verify a login OTP code and create a session.
 * Rate limited: 5 attempts per email per OTP window.
 */
export async function POST({ request, platform, cookies }) {
	try {
		const { email, code } = await request.json();

		if (!email || !code) {
			return json({ error: 'Email and code are required' }, { status: 400 });
		}

		// Validate code format (6 digits)
		if (!/^\d{6}$/.test(code)) {
			return json({ error: 'Invalid code format' }, { status: 400 });
		}

		// Get OTP from KV
		if (!platform?.env?.OTP_STORE) {
			console.error('OTP_STORE KV namespace not configured');
			return json({ error: 'Service configuration error' }, { status: 500 });
		}

		const kv = platform.env.OTP_STORE;

		// Check rate limit before proceeding
		const rateLimit = await checkRateLimit({
			kv,
			key: email.toLowerCase(),
			config: RATE_LIMIT_PRESETS.otpVerify
		});

		if (!rateLimit.allowed) {
			return rateLimitedResponse(rateLimit.resetAt);
		}

		const stored = await kv.get(`login-otp:${email}`);
		if (!stored) {
			return json(
				{ error: 'No verification code found. Please request a new one.' },
				{ status: 400 }
			);
		}

		const storedData = JSON.parse(stored);

		// Check if code has expired
		if (Date.now() > storedData.expiresAt) {
			await kv.delete(`login-otp:${email}`);
			return json(
				{ error: 'Verification code has expired. Please request a new one.' },
				{ status: 400 }
			);
		}

		// Verify the code
		if (storedData.code !== code) {
			return json({ error: 'Invalid verification code' }, { status: 400 });
		}

		// OTP verified successfully - reset rate limit
		await resetRateLimit({
			kv,
			key: email.toLowerCase(),
			config: RATE_LIMIT_PRESETS.otpVerify
		});

		// Code is valid - clean up
		await kv.delete(`login-otp:${email}`);

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
		const { token } = await createSession({
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
		cookies.set('session', token, {
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
		console.error('Login OTP verify error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
