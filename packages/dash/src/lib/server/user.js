/**
 * User operations helper module.
 *
 * Provides a unified interface for working with:
 * - D1 (user index)
 * - dash-do service (user data, sessions, preferences via service binding)
 * - JWT (session tokens)
 */

import { createSessionToken, getSessionExpiresAt } from './jwt.js';

/**
 * Helper to make requests to the dash-do service.
 * @param {Object} platform - SvelteKit platform object
 * @param {string} userId - User UUID
 * @param {string} path - Request path (e.g., '/profile')
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchDashDO(platform, userId, path, options = {}) {
	const DASH_DO = platform?.env?.DASH_DO;
	if (!DASH_DO) {
		throw new Error('DASH_DO service binding not configured');
	}

	const headers = new Headers(options.headers || {});
	headers.set('X-User-ID', userId);

	return DASH_DO.fetch(`https://dash-do${path}`, {
		...options,
		headers
	});
}

/**
 * Parse user agent to extract device information.
 * @param {string} userAgent - The User-Agent header
 * @returns {Object} Device info
 */
function parseUserAgent(userAgent) {
	if (!userAgent) {
		return { deviceName: 'Unknown Device', deviceType: 'desktop' };
	}

	let browser = 'Browser';
	let os = 'Unknown';
	let deviceType = 'desktop';

	// Detect browser
	if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
		browser = 'Chrome';
	} else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
		browser = 'Safari';
	} else if (userAgent.includes('Firefox')) {
		browser = 'Firefox';
	} else if (userAgent.includes('Edg')) {
		browser = 'Edge';
	}

	// Detect OS
	if (userAgent.includes('Mac OS')) {
		os = 'macOS';
	} else if (userAgent.includes('Windows')) {
		os = 'Windows';
	} else if (userAgent.includes('Linux')) {
		os = 'Linux';
	} else if (userAgent.includes('Android')) {
		os = 'Android';
		deviceType = 'mobile';
	} else if (userAgent.includes('iPhone')) {
		os = 'iOS';
		deviceType = 'mobile';
	} else if (userAgent.includes('iPad')) {
		os = 'iOS';
		deviceType = 'tablet';
	}

	return {
		deviceName: `${browser} on ${os}`,
		deviceType
	};
}

/**
 * Check if a user exists in D1 by email.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.email - User email
 * @returns {Promise<boolean>} True if user exists
 */
export async function userExists({ platform, email }) {
	const db = platform?.env?.dashUsers;
	if (!db) {
		throw new Error('D1 database not configured');
	}

	const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
	return !!user;
}

/**
 * Get an existing user from D1. Returns null if user doesn't exist.
 * Use this for login flows where user must already exist.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.email - User email
 * @returns {Promise<Object|null>} User data with userId, or null if not found
 */
export async function getUser({ platform, email }) {
	const db = platform?.env?.dashUsers;
	if (!db) {
		throw new Error('D1 database not configured');
	}

	const user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
	if (!user) {
		return null;
	}

	// Update last login
	await db
		.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?')
		.bind(user.id)
		.run();

	// Get profile from dash-do service
	let userProfile = {};
	try {
		const profileResponse = await fetchDashDO(platform, user.id, '/profile');
		if (profileResponse.ok) {
			userProfile = await profileResponse.json();
		} else {
			console.warn(`Profile not found for user ${user.id}, using defaults`);
		}
	} catch (e) {
		console.warn(`Error fetching profile for user ${user.id}:`, e.message);
	}

	return { userId: user.id, email: user.email, ...userProfile };
}

/**
 * Get or create a user in D1 and dash-do service.
 * Use this for signup flows where new users should be created.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.email - User email
 * @param {Object} params.profile - Profile data (name, company, etc.)
 * @returns {Promise<Object>} User data with userId
 */
export async function getOrCreateUser({ platform, email, profile = {} }) {
	const db = platform?.env?.dashUsers;
	if (!db) {
		throw new Error('D1 database not configured');
	}

	// Check if user exists in D1
	let user = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();

	if (!user) {
		// Create new user
		const userId = crypto.randomUUID();
		await db
			.prepare(
				'INSERT INTO users (id, email, created_at, last_login_at) VALUES (?, ?, datetime("now"), datetime("now"))'
			)
			.bind(userId, email)
			.run();

		user = { id: userId, email };

		// Initialize profile in dash-do service
		if (Object.keys(profile).length > 0) {
			await fetchDashDO(platform, userId, '/profile', {
				method: 'PUT',
				body: JSON.stringify(profile)
			});
		}
	} else {
		// Update last login
		await db
			.prepare('UPDATE users SET last_login_at = datetime("now") WHERE id = ?')
			.bind(user.id)
			.run();
	}

	// Get profile from dash-do service
	let userProfile = {};
	try {
		const profileResponse = await fetchDashDO(platform, user.id, '/profile');
		if (profileResponse.ok) {
			userProfile = await profileResponse.json();
		}
	} catch (e) {
		console.warn(`Error fetching profile for user ${user.id}:`, e.message);
	}

	return { userId: user.id, email: user.email, ...userProfile };
}

/**
 * Create a new session for a user.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.email - User email
 * @param {string} params.userAgent - User-Agent header
 * @param {string} params.ipAddress - Client IP address
 * @param {string} params.jwtSecret - JWT signing secret
 * @returns {Promise<Object>} Session token and metadata
 */
export async function createSession({ platform, userId, email, userAgent, ipAddress, jwtSecret }) {
	const { deviceName, deviceType } = parseUserAgent(userAgent);
	const expiresAt = getSessionExpiresAt();

	// Create session via dash-do service
	const response = await fetchDashDO(platform, userId, '/sessions', {
		method: 'POST',
		body: JSON.stringify({ deviceName, deviceType, ipAddress, userAgent, expiresAt })
	});

	const { sessionId } = await response.json();
	const token = await createSessionToken({ userId, email, sessionId }, jwtSecret);

	return { token, sessionId, expiresAt };
}

/**
 * Validate a session exists in the user's data store.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.sessionId - Session UUID (jti from JWT)
 * @returns {Promise<Object|null>} Session data or null if invalid
 */
export async function validateSession({ platform, userId, sessionId }) {
	try {
		const response = await fetchDashDO(platform, userId, `/sessions/${sessionId}`);
		if (!response.ok) return null;

		const { valid, session } = await response.json();
		return valid ? session : null;
	} catch {
		return null;
	}
}

/**
 * Refresh a session's last access time.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.sessionId - Session UUID
 * @returns {Promise<boolean>} Success
 */
export async function refreshSession({ platform, userId, sessionId }) {
	try {
		await fetchDashDO(platform, userId, `/sessions/${sessionId}`, { method: 'PUT' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Terminate a specific session.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.sessionId - Session UUID
 * @returns {Promise<boolean>} Success
 */
export async function terminateSession({ platform, userId, sessionId }) {
	try {
		await fetchDashDO(platform, userId, `/sessions/${sessionId}`, { method: 'DELETE' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Terminate all sessions except the specified one.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.excludeSessionId - Session ID to keep (current session)
 * @returns {Promise<boolean>} Success
 */
export async function terminateAllSessions({ platform, userId, excludeSessionId }) {
	try {
		const path = excludeSessionId
			? `/sessions/all?exclude=${encodeURIComponent(excludeSessionId)}`
			: '/sessions/all';
		await fetchDashDO(platform, userId, path, { method: 'DELETE' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Get all sessions for a user.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @returns {Promise<Array>} List of sessions
 */
export async function listSessions({ platform, userId }) {
	try {
		const response = await fetchDashDO(platform, userId, '/sessions');
		if (response.ok) {
			return response.json();
		}
		return [];
	} catch {
		return [];
	}
}

/**
 * Get user profile from dash-do service.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @returns {Promise<Object>} Profile data
 */
export async function getProfile({ platform, userId }) {
	try {
		const response = await fetchDashDO(platform, userId, '/profile');
		if (response.ok) {
			return response.json();
		}
		return {};
	} catch {
		return {};
	}
}

/**
 * Update user profile in dash-do service.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {Object} params.profile - Profile data to merge
 * @returns {Promise<Object>} Updated profile
 */
export async function updateProfile({ platform, userId, profile }) {
	const response = await fetchDashDO(platform, userId, '/profile', {
		method: 'PUT',
		body: JSON.stringify(profile)
	});
	if (response.ok) {
		return response.json();
	}
	throw new Error(`Failed to update profile: ${response.status}`);
}

/**
 * Grant merchant access to a user.
 * Updates the user's DashUserDO merchant_access list.
 * Used for auto-granting access based on email domain during login flows.
 * For invite-based access, use addTeamMember() from merchant.js instead.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.role - Role (owner, editor, viewer)
 * @returns {Promise<boolean>} Success
 */
export async function grantMerchantAccess({ platform, userId, merchantDomain, role = 'owner' }) {
	try {
		await fetchDashDO(platform, userId, '/merchant-access', {
			method: 'POST',
			body: JSON.stringify({ merchantDomain, role })
		});

		return true;
	} catch (error) {
		console.error('Error granting merchant access:', error);
		return false;
	}
}

/**
 * Get merchant access for a user.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @returns {Promise<Array>} List of merchant access
 */
export async function getMerchantAccess({ platform, userId }) {
	try {
		const response = await fetchDashDO(platform, userId, '/merchant-access');
		if (response.ok) {
			return response.json();
		}
		return [];
	} catch {
		return [];
	}
}

// NOTE: Team management functions (getMerchantTeam, updateTeamMemberRole, removeTeamMember)
// have been moved to $lib/server/merchant.js which uses MerchantDO instead of D1.

/**
 * Get user ID from email (for storing invites in existing user's DO).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.email - User email
 * @returns {Promise<Object|null>} User ID or null if not found
 */
export async function getUserIdByEmail({ platform, email }) {
	const db = platform?.env?.dashUsers;
	if (!db) {
		return null;
	}

	const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
	return user ? { userId: user.id } : null;
}

/**
 * Add a pending invite to a user's data store.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {Object} params.invite - Invite data
 * @returns {Promise<boolean>} Success
 */
export async function addPendingInvite({ platform, userId, invite }) {
	try {
		await fetchDashDO(platform, userId, '/pending-invites', {
			method: 'POST',
			body: JSON.stringify(invite)
		});
		return true;
	} catch (error) {
		console.error('Error adding pending invite:', error);
		return false;
	}
}

/**
 * Get pending invites for a user.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @returns {Promise<Array>} List of pending invites
 */
export async function getPendingInvites({ platform, userId }) {
	try {
		const response = await fetchDashDO(platform, userId, '/pending-invites');
		if (response.ok) {
			return response.json();
		}
		return [];
	} catch {
		return [];
	}
}

/**
 * Remove a pending invite from a user's data store.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.token - Invite token
 * @returns {Promise<boolean>} Success
 */
export async function removePendingInvite({ platform, userId, token }) {
	try {
		await fetchDashDO(platform, userId, `/pending-invites/${encodeURIComponent(token)}`, {
			method: 'DELETE'
		});
		return true;
	} catch {
		return false;
	}
}

/**
 * Get user preferences from dash-do service.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @returns {Promise<Object>} Preferences data (e.g., { theme: 'system' })
 */
export async function getPreferences({ platform, userId }) {
	try {
		const response = await fetchDashDO(platform, userId, '/preferences');
		if (response.ok) {
			return response.json();
		}
		return {};
	} catch {
		return {};
	}
}

/**
 * Update user preferences in dash-do service.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {Object} params.preferences - Preferences data to merge (e.g., { theme: 'dark' })
 * @returns {Promise<Object>} Updated preferences
 */
export async function updatePreferences({ platform, userId, preferences }) {
	const response = await fetchDashDO(platform, userId, '/preferences', {
		method: 'PUT',
		body: JSON.stringify(preferences)
	});
	if (response.ok) {
		return response.json();
	}
	throw new Error(`Failed to update preferences: ${response.status}`);
}
