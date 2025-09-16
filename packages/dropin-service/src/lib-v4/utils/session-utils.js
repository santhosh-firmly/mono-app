/**
 * @fileoverview Shared session utilities to reduce code duplication between different parts of the application.
 * These utilities provide common patterns for session management across SDK, dropin, and legacy compatibility layers.
 */

import { dropinSessionManager, sdkSessionManager } from './session-manager.js';

/**
 * Session context types
 */
export const SESSION_CONTEXT = {
	SDK: 'sdk',
	DROPIN: 'dropin'
};

/**
 * Get the appropriate session manager for the given context
 */
function getSessionManager(context = SESSION_CONTEXT.DROPIN) {
	return context === SESSION_CONTEXT.SDK ? sdkSessionManager : dropinSessionManager;
}

/**
 * Get API access token with consistent error handling and fallback behavior
 * @param {string} context - Session context (SDK or DROPIN)
 * @param {object} options - Options for token retrieval
 * @returns {Promise<string|null>} The access token or null
 */
export async function getApiAccessToken(context = SESSION_CONTEXT.DROPIN, options = {}) {
	if (!window.firmly?.appId || !window.firmly?.apiServer) {
		return null;
	}

	const sessionManager = getSessionManager(context);
	const defaultOptions = {
		allowStaleToken: true,
		...options
	};

	try {
		return await sessionManager.getAccessToken(
			window.firmly.appId,
			window.firmly.apiServer,
			defaultOptions
		);
	} catch (error) {
		console.warn(`${context} session token retrieval failed:`, error);
		return null;
	}
}

/**
 * Get headers with authorization token and consistent error handling
 * @param {string} context - Session context (SDK or DROPIN)
 * @param {object} options - Options for header retrieval
 * @returns {Promise<object>} Headers object with or without authorization
 */
export async function getAuthHeaders(context = SESSION_CONTEXT.DROPIN, options = {}) {
	if (!window.firmly?.appId || !window.firmly?.apiServer) {
		return {
			headers: {
				'Content-Type': 'application/json'
			}
		};
	}

	const sessionManager = getSessionManager(context);
	const defaultOptions = {
		allowStaleToken: true,
		...options
	};

	try {
		return await sessionManager.getAuthHeaders(
			window.firmly.appId,
			window.firmly.apiServer,
			defaultOptions
		);
	} catch (error) {
		console.warn(`${context} session header retrieval failed:`, error);
		return {
			headers: {
				'Content-Type': 'application/json'
			}
		};
	}
}

/**
 * Initialize session with device creation callback and consistent error handling
 * @param {string} context - Session context (SDK or DROPIN)
 * @param {function} onDeviceCreated - Callback for when device is created
 * @returns {Promise<object|null>} Session data or null
 */
export async function initializeSession(context = SESSION_CONTEXT.DROPIN, onDeviceCreated = null) {
	if (!window.firmly?.appId || !window.firmly?.apiServer) {
		throw new Error('Invalid session parameters: missing appId or apiServer');
	}

	const sessionManager = getSessionManager(context);
	const options = {};

	if (onDeviceCreated && typeof onDeviceCreated === 'function') {
		options.onDeviceCreated = onDeviceCreated;
	}

	try {
		const session = await sessionManager.fetchBrowserSession(
			window.firmly.appId,
			window.firmly.apiServer,
			options
		);

		// Update global device ID if available
		if (session?.device_id && window.firmly) {
			window.firmly.deviceId = session.device_id;
		}

		return session;
	} catch (error) {
		console.error(`${context} session initialization failed:`, error);
		return null;
	}
}

/**
 * Get device ID from session with consistent fallback behavior
 * @param {string} context - Session context (SDK or DROPIN)
 * @returns {string|null} Device ID or null
 */
export function getDeviceId(context = SESSION_CONTEXT.DROPIN) {
	const sessionManager = getSessionManager(context);
	return sessionManager.getDeviceId();
}

/**
 * Initialize session ID with consistent behavior across contexts
 * @param {string} context - Session context (SDK or DROPIN)
 * @returns {object} Object with sessionId and isNew flag
 */
export function initializeSessionId(context = SESSION_CONTEXT.DROPIN) {
	const sessionManager = getSessionManager(context);
	const result = sessionManager.initializeSessionId();

	// Update global session state if window.firmly is available
	if (window.firmly) {
		window.firmly.isNewSessionId = result.isNew;
	}

	return result;
}
