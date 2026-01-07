import { json } from '@sveltejs/kit';
import { sendOTPEmail } from '$lib/server/email.js';
import { validateBusinessEmail } from '$lib/server/email-validation.js';
import { checkRateLimit, rateLimitedResponse, RATE_LIMIT_PRESETS } from '$lib/server/rate-limit.js';

/**
 * Generate a random 6-digit OTP code.
 */
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/otp/send
 * Send an OTP verification code to the provided email.
 * Used during signup flow - allows any email.
 * Rate limited: 3 requests per hour per email.
 */
export async function POST({ request, platform }) {
	try {
		const { email, domain } = await request.json();

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
				config: RATE_LIMIT_PRESETS.otpSend
			});

			if (!rateLimit.allowed) {
				return rateLimitedResponse(rateLimit.resetAt);
			}
		}

		// Generate OTP code
		const code = generateOTP();
		const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

		// Store OTP in KV
		if (!platform?.env?.OTP_STORE) {
			console.error('OTP_STORE KV namespace not configured');
			return json({ error: 'Service configuration error' }, { status: 500 });
		}

		const otpData = JSON.stringify({ code, email, domain, expiresAt });
		await platform.env.OTP_STORE.put(`otp:${email}`, otpData, {
			expirationTtl: 300 // 5 minutes
		});

		// Send OTP email
		const apiKey = platform?.env?.MAILERSEND_API_KEY;
		if (!apiKey) {
			console.error('MAILERSEND_API_KEY not configured');
			return json({ error: 'Email service not configured' }, { status: 500 });
		}

		const result = await sendOTPEmail(email, code, apiKey);

		if (!result.success) {
			console.error('Failed to send OTP email:', result.error);
			return json({ error: 'Failed to send verification email' }, { status: 500 });
		}

		return json({ success: true, message: 'Verification code sent' });
	} catch (error) {
		console.error('OTP send error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}
