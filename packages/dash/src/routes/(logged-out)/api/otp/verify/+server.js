import { json } from '@sveltejs/kit';
import { getOrCreateUser, createSession, grantMerchantAccess } from '$lib/server/user.js';
import {
	checkRateLimit,
	rateLimitedResponse,
	resetRateLimit,
	RATE_LIMIT_PRESETS
} from '$lib/server/rate-limit.js';

/**
 * POST /api/otp/verify
 * Verify an OTP code for the provided email and create a session.
 * Used during signup flow - creates user if not exists.
 * Rate limited: 5 attempts per email per OTP window.
 */
export async function POST({ request, platform, cookies }) {
	try {
		const { email, code, profile } = await request.json();

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

		const stored = await kv.get(`otp:${email}`);
		if (!stored) {
			return json(
				{ error: 'No verification code found. Please request a new one.' },
				{ status: 400 }
			);
		}

		const storedData = JSON.parse(stored);

		// Check if code has expired
		if (Date.now() > storedData.expiresAt) {
			await kv.delete(`otp:${email}`);
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
		await kv.delete(`otp:${email}`);

		// Get or create user in D1 and DashUserDO with profile info
		const user = await getOrCreateUser({
			platform,
			email: storedData.email,
			profile: profile || {}
		});

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

		// Grant access to the domain merchant
		const merchantDomain = storedData.domain || storedData.email.split('@')[1];
		if (merchantDomain) {
			await grantMerchantAccess({
				platform,
				userId: user.userId,
				merchantDomain,
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

		// Return success with domain info for next steps
		return json({
			success: true,
			message: 'Email verified successfully',
			email: storedData.email,
			domain: merchantDomain,
			userId: user.userId,
			redirectTo: '/'
		});
	} catch (error) {
		console.error('OTP verify error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
