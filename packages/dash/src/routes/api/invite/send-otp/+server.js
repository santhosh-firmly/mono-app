import { json } from '@sveltejs/kit';
import { sendOTPEmail } from '$lib/server/email.js';
import { checkRateLimit, rateLimitedResponse, RATE_LIMIT_PRESETS } from '$lib/server/rate-limit.js';

/**
 * Generate a random 6-digit OTP code.
 */
function generateOTP() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/invite/send-otp
 * Send an OTP verification code to the invite email.
 * This is required for new users accepting invites to verify email ownership.
 * Rate limited: 3 requests per hour per invite token.
 */
export async function POST({ request, platform }) {
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

		// Check rate limit before proceeding
		const rateLimit = await checkRateLimit({
			kv,
			key: token,
			config: RATE_LIMIT_PRESETS.inviteOtpSend
		});

		if (!rateLimit.allowed) {
			return rateLimitedResponse(rateLimit.resetAt);
		}

		// Get invite from KV to get the email
		const stored = await kv.get(`invite:${token}`);

		if (!stored) {
			return json({ error: 'Invalid or expired invitation' }, { status: 404 });
		}

		const inviteData = JSON.parse(stored);

		// Check if expired
		if (Date.now() > inviteData.expiresAt) {
			await kv.delete(`invite:${token}`);
			return json({ error: 'This invitation has expired' }, { status: 410 });
		}

		const email = inviteData.email;

		// Generate OTP code
		const code = generateOTP();
		const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

		// Store OTP in KV with reference to the invite token
		const otpData = JSON.stringify({
			code,
			email,
			inviteToken: token,
			expiresAt
		});
		await kv.put(`invite-otp:${token}`, otpData, {
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
			console.error('Failed to send invite OTP email:', result.error);
			return json({ error: 'Failed to send verification email' }, { status: 500 });
		}

		return json({
			success: true,
			message: 'Verification code sent',
			// Mask email for display
			maskedEmail: maskEmail(email)
		});
	} catch (error) {
		console.error('Invite OTP send error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * Mask email for display (e.g., "j***@example.com")
 */
function maskEmail(email) {
	const [local, domain] = email.split('@');
	if (local.length <= 2) {
		return `${local[0]}***@${domain}`;
	}
	return `${local[0]}***${local[local.length - 1]}@${domain}`;
}
