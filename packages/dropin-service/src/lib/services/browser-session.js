/**
 * @fileoverview Browser session functions for managing user sessions.
 * This is a legacy compatibility layer that uses the simplified SessionManager.
 */

import { sessionManager } from '../../lib-v4/utils/session-manager.js';
import { telemetryDeviceCreated } from './telemetry';

/**
 * Gets the browser session from local storage or the current session.
 * @returns {object|null} The browser session object, or null if not found.
 */
export function getBrowserSession() {
	return sessionManager.getStoredSession();
}

/**
 * Sets the browser session in local storage and memory.
 * @param {object} browserSession The browser session object to set.
 */
export function setBrowserSession(browserSession) {
	sessionManager.setStoredSession(browserSession);
}

/**
 * Gets the session ID from session storage.
 * @returns {string|null} The session ID, or null if not found.
 */
export function getSessionId() {
	return sessionManager.getSessionId();
}

/**
 * Sets the session ID in session storage.
 * @param {string} value The session ID to set.
 */
export function setSessionId(value) {
	sessionManager.setSessionId(value);
}

/**
 * Initializes the session ID if it doesn't exist.
 * @returns {string} The initialized session ID.
 */
export function initSessionId() {
	const result = sessionManager.initializeSessionId();
	if (window.firmly) {
		window.firmly.isNewSessionId = result.isNew;
	}
	return result.sessionId;
}

/**
 * Gets the current timestamp in seconds since the epoch.
 * @returns {number} The number of seconds since the epoch.
 */
export function getSecondsSinceEpoch() {
	return Math.floor(Date.now() / 1000);
}

/**
 * Fetches a new browser session from the server.
 * @returns {Promise<object|null>} The browser session object, or null if the fetch fails.
 */
export async function fetchBrowserSession() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) return null;

	try {
		const session = await sessionManager.fetchBrowserSession(
			window.firmly.appId,
			window.firmly.apiServer,
			{
				onDeviceCreated: (sessionData) => {
					window.firmly.deviceId = sessionData.device_id;
					telemetryDeviceCreated();
				}
			}
		);
		return session;
	} catch (error) {
		return null;
	}
}

/**
 * Gets the API access token, fetching a new session if needed.
 * @returns {Promise<string|null>} The API access token, or null if not available.
 */
export async function getApiAccessToken() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) return null;

	try {
		return await sessionManager.getAccessToken(window.firmly.appId, window.firmly.apiServer, {
			allowStaleToken: true
		});
	} catch (error) {
		return null;
	}
}

/**
 * Gets the device ID from the current session.
 * @returns {string|null} The device ID, or null if not found.
 */
export function getDeviceId() {
	return sessionManager.getDeviceId();
}

/**
 * Gets headers with the API access token for authenticated requests.
 * @returns {Promise<object>} The headers object with the access token.
 */
export async function getHeaders() {
	if (!window.firmly?.appId || !window.firmly?.apiServer) {
		return {
			headers: {
				'Content-Type': 'application/json'
			}
		};
	}

	try {
		return await sessionManager.getAuthHeaders(window.firmly.appId, window.firmly.apiServer, {
			allowStaleToken: true
		});
	} catch (error) {
		return {
			headers: {
				'Content-Type': 'application/json'
			}
		};
	}
}
