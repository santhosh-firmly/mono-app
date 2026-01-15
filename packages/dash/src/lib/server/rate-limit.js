/**
 * KV-based rate limiting utility for authentication endpoints.
 *
 * Provides protection against:
 * - Brute force attacks on OTP codes
 * - Email enumeration via send endpoints
 * - DDoS on authentication endpoints
 */

/**
 * Rate limiter configuration presets
 */
export const RATE_LIMIT_PRESETS = {
	// OTP/Magic link send - 5 requests per hour per email
	otpSend: {
		maxRequests: 5,
		windowMs: 60 * 60 * 1000, // 1 hour
		keyPrefix: 'ratelimit:otp-send:'
	},
	// OTP verify - 5 attempts per code
	otpVerify: {
		maxRequests: 5,
		windowMs: 5 * 60 * 1000, // 5 minutes (OTP lifetime)
		keyPrefix: 'ratelimit:otp-verify:'
	},
	// Login OTP send - 3 requests per hour per email
	loginOtpSend: {
		maxRequests: 3,
		windowMs: 60 * 60 * 1000, // 1 hour
		keyPrefix: 'ratelimit:login-otp-send:'
	},
	// Magic link send - 3 requests per hour per email
	magicLinkSend: {
		maxRequests: 3,
		windowMs: 60 * 60 * 1000, // 1 hour
		keyPrefix: 'ratelimit:magic-link-send:'
	},
	// Invite OTP send - 3 requests per hour per token
	inviteOtpSend: {
		maxRequests: 3,
		windowMs: 60 * 60 * 1000, // 1 hour
		keyPrefix: 'ratelimit:invite-otp-send:'
	}
};

/**
 * Check if a request is rate limited.
 *
 * @param {Object} params
 * @param {Object} params.kv - KV namespace (platform.env.OTP_STORE)
 * @param {string} params.key - Unique identifier (email, IP, token)
 * @param {Object} params.config - Rate limit configuration
 * @returns {Promise<{allowed: boolean, remaining: number, resetAt: number}>}
 */
export async function checkRateLimit({ kv, key, config }) {
	const { maxRequests, windowMs, keyPrefix } = config;
	const fullKey = `${keyPrefix}${key}`;

	try {
		// Get existing rate limit data
		const stored = await kv.get(fullKey);
		const now = Date.now();

		if (stored) {
			const data = JSON.parse(stored);

			// Check if window has expired
			if (now > data.resetAt) {
				// Window expired, start fresh
				const newData = {
					count: 1,
					resetAt: now + windowMs
				};
				await kv.put(fullKey, JSON.stringify(newData), {
					expirationTtl: Math.ceil(windowMs / 1000)
				});
				return {
					allowed: true,
					remaining: maxRequests - 1,
					resetAt: newData.resetAt
				};
			}

			// Window still active
			if (data.count >= maxRequests) {
				return {
					allowed: false,
					remaining: 0,
					resetAt: data.resetAt
				};
			}

			// Increment counter
			data.count += 1;
			await kv.put(fullKey, JSON.stringify(data), {
				expirationTtl: Math.ceil((data.resetAt - now) / 1000)
			});

			return {
				allowed: true,
				remaining: maxRequests - data.count,
				resetAt: data.resetAt
			};
		}

		// No existing record, create new
		const newData = {
			count: 1,
			resetAt: now + windowMs
		};
		await kv.put(fullKey, JSON.stringify(newData), {
			expirationTtl: Math.ceil(windowMs / 1000)
		});

		return {
			allowed: true,
			remaining: maxRequests - 1,
			resetAt: newData.resetAt
		};
	} catch (error) {
		console.error('Rate limit check error:', error);
		// On error, allow the request (fail open)
		// In production, you may want to fail closed instead
		return {
			allowed: true,
			remaining: maxRequests,
			resetAt: Date.now() + windowMs
		};
	}
}

/**
 * Create a rate limited response.
 *
 * @param {number} resetAt - Unix timestamp when rate limit resets
 * @returns {Response}
 */
export function rateLimitedResponse(resetAt) {
	const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
	return new Response(
		JSON.stringify({
			error: 'Too many requests. Please try again later.',
			retryAfter
		}),
		{
			status: 429,
			headers: {
				'Content-Type': 'application/json',
				'Retry-After': String(retryAfter),
				'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000))
			}
		}
	);
}

/**
 * Reset rate limit for a specific key.
 * Useful when user successfully verifies (clear verify attempts).
 *
 * @param {Object} params
 * @param {Object} params.kv - KV namespace
 * @param {string} params.key - Unique identifier
 * @param {Object} params.config - Rate limit configuration
 */
export async function resetRateLimit({ kv, key, config }) {
	const fullKey = `${config.keyPrefix}${key}`;
	try {
		await kv.delete(fullKey);
	} catch (error) {
		console.error('Rate limit reset error:', error);
	}
}
