/**
 * JWT utilities for session tokens using jose library.
 *
 * Uses HS256 (HMAC-SHA256) signing.
 * JWT structure: { sub, email, jti, iat, exp }
 */

import * as jose from 'jose';

const ALGORITHM = 'HS256';

/**
 * Verify and decode a JWT token.
 * @param {string} token - The JWT token
 * @param {string} secret - The signing secret
 * @returns {Promise<Object|null>} The decoded payload or null if invalid
 */
export async function verifyToken(token, secret) {
	try {
		const secretKey = new TextEncoder().encode(secret);
		const { payload } = await jose.jwtVerify(token, secretKey, {
			algorithms: [ALGORITHM]
		});
		return payload;
	} catch {
		// Token is invalid or expired
		return null;
	}
}

/**
 * Decode a JWT token without verification.
 * Useful for getting the payload even if the token is expired.
 * @param {string} token - The JWT token
 * @returns {Object|null} The decoded payload or null if malformed
 */
export function decodeToken(token) {
	try {
		const payload = jose.decodeJwt(token);
		return payload;
	} catch {
		return null;
	}
}

/**
 * Check if a JWT token is expired.
 * @param {Object} payload - The decoded JWT payload
 * @returns {boolean} True if expired
 */
export function isTokenExpired(payload) {
	if (!payload || !payload.exp) {
		return true;
	}
	return Date.now() >= payload.exp * 1000;
}

/**
 * Check if a token can be renewed (expired less than 7 days ago).
 * @param {Object} payload - The decoded JWT payload
 * @returns {boolean} True if renewable
 */
export function isTokenRenewable(payload) {
	if (!payload || !payload.exp) {
		return false;
	}

	const expiredAt = payload.exp * 1000;
	const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

	// Token must be expired but less than 7 days old
	return Date.now() >= expiredAt && Date.now() < expiredAt + sevenDaysMs;
}

/**
 * Create a session JWT.
 * @param {Object} params - Session parameters
 * @param {string} params.userId - User UUID
 * @param {string} params.email - User email
 * @param {string} params.sessionId - Session UUID (jti)
 * @param {string} secret - The signing secret
 * @returns {Promise<string>} The JWT token
 */
export async function createSessionToken({ userId, email, sessionId }, secret) {
	const secretKey = new TextEncoder().encode(secret);
	const thirtyMinutes = 30 * 60;

	return new jose.SignJWT({ sub: userId, email, jti: sessionId })
		.setProtectedHeader({ alg: ALGORITHM })
		.setIssuedAt()
		.setExpirationTime(`${thirtyMinutes}s`)
		.sign(secretKey);
}

/**
 * Create a compact admin JWT from verified Microsoft id_token claims.
 * @param {Object} params - Admin claims
 * @param {string} params.email - Admin email
 * @param {string} params.name - Admin display name
 * @param {string} params.oid - Azure AD object ID
 * @param {string} params.preferred_username - Azure AD preferred username
 * @param {string} secret - The signing secret (JWT_SECRET)
 * @returns {Promise<string>} The compact JWT token
 */
export async function createAdminToken({ email, name, oid, preferred_username }, secret) {
	const secretKey = new TextEncoder().encode(secret);
	const oneHour = 60 * 60;

	return new jose.SignJWT({ email, name, oid, preferred_username, type: 'admin' })
		.setProtectedHeader({ alg: ALGORITHM })
		.setIssuedAt()
		.setExpirationTime(`${oneHour}s`)
		.sign(secretKey);
}

/**
 * Session expiration time (7 days from now) as ISO string.
 * @returns {string} ISO date string
 */
export function getSessionExpiresAt() {
	const sevenDays = 7 * 24 * 60 * 60 * 1000;
	return new Date(Date.now() + sevenDays).toISOString();
}
