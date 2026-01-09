import { json } from '@sveltejs/kit';
import { sendMagicLinkEmail } from '$lib/server/email.js';
import { userExists } from '$lib/server/user.js';
import { validateBusinessEmail } from '$lib/server/email-validation.js';
import { checkRateLimit, rateLimitedResponse, RATE_LIMIT_PRESETS } from '$lib/server/rate-limit.js';

/**
 * Generate a secure random token for the magic link.
 */
function generateToken() {
	const array = new Uint8Array(32);
	crypto.getRandomValues(array);
	return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * POST /api/magic-link/send
 * Send a magic link login email to the provided address.
 * Only works for existing users - new users must sign up first.
 * Rate limited: 3 requests per hour per email.
 */
export async function POST({ request, url, platform }) {
	try {
		const { email } = await request.json();

		if (!email) {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: 'Invalid email format' }, { status: 400 });
		}

		// Validate business email (block free email providers)
		const emailValidation = validateBusinessEmail(email);
		if (!emailValidation.valid) {
			return json({ error: emailValidation.error }, { status: 400 });
		}

		// Check rate limit before proceeding
		const kv = platform?.env?.OTP_STORE;
		if (kv) {
			const rateLimit = await checkRateLimit({
				kv,
				key: email.toLowerCase(),
				config: RATE_LIMIT_PRESETS.magicLinkSend
			});

			if (!rateLimit.allowed) {
				return rateLimitedResponse(rateLimit.resetAt);
			}
		}

		// Check if user exists - login only works for existing users
		const exists = await userExists({ platform, email });
		if (!exists) {
			return json(
				{ error: 'No account found with this email. Please sign up first.' },
				{ status: 404 }
			);
		}

		// Generate secure token
		const token = generateToken();
		const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

		// Store token in KV
		if (!platform?.env?.OTP_STORE) {
			console.error('OTP_STORE KV namespace not configured');
			return json({ error: 'Service configuration error' }, { status: 500 });
		}

		const tokenData = JSON.stringify({ email, expiresAt });
		await platform.env.OTP_STORE.put(`magic:${token}`, tokenData, {
			expirationTtl: 900 // 15 minutes
		});

		// Build magic link URL
		const magicLinkUrl = `${url.origin}/login/verify?token=${token}`;

		// Send magic link email
		const apiKey = platform?.env?.MAILERSEND_API_KEY;
		if (!apiKey) {
			console.error('MAILERSEND_API_KEY not configured');
			return json({ error: 'Email service not configured' }, { status: 500 });
		}

		const result = await sendMagicLinkEmail(email, magicLinkUrl, apiKey);

		if (!result.success) {
			console.error('Failed to send magic link email:', result.error);
			return json({ error: 'Failed to send login email' }, { status: 500 });
		}

		return json({ success: true, message: 'Login link sent' });
	} catch (error) {
		console.error('Magic link send error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
