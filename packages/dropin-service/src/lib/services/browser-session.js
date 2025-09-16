/**
 * @fileoverview Browser session functions for managing user sessions.
 * This is a legacy compatibility layer that uses shared session utilities.
 */

import {
	getApiAccessToken as getApiAccessTokenUtil,
	getAuthHeaders as getAuthHeadersUtil,
	initializeSession,
	getDeviceId as getDeviceIdUtil,
	initializeSessionId as initializeSessionIdUtil,
	SESSION_CONTEXT
} from '../../lib-v4/utils/session-utils.js';
import { dropinSessionManager } from '../../lib-v4/utils/session-manager.js';
import { telemetryDeviceCreated } from './telemetry';

/**
 * Gets the browser session from local storage or the current session.
 * @returns {object|null} The browser session object, or null if not found.
 */
export function getBrowserSession() {
	return dropinSessionManager.getStoredSession();
}

/**
 * Sets the browser session in local storage and the current session.
 * @param {object} browserSession The browser session object to set.
 */
export function setBrowserSession(browserSession) {
	dropinSessionManager.setStoredSession(browserSession);
}

/**
 * Gets the session ID from session storage.
 * @returns {string|null} The session ID, or null if not found.
 */
export function getSessionId() {
	return dropinSessionManager.getSessionId();
}

/**
 * Sets the session ID in session storage.
 * @param {string} value The session ID to set.
 */
export function setSessionId(value) {
	dropinSessionManager.setSessionId(value);
}

/**
 * Initializes the session ID, creating a new one if it doesn't exist.
 * @returns {string} The initialized session ID.
 */
export function initSessionId() {
	const result = initializeSessionIdUtil(SESSION_CONTEXT.DROPIN);
	return result.sessionId;
}

/**
 * Gets the number of seconds since the epoch.
 * @returns {number} The number of seconds since the epoch.
 */
export function getSecondsSinceEpoch() {
	return dropinSessionManager.getSecondsSinceEpoch();
}

/**
 * Fetches the browser session from the server.
 * @returns {Promise<object|null>} The browser session object, or null if the fetch fails.
 */
export async function fetchBrowserSession() {
	return await initializeSession(SESSION_CONTEXT.DROPIN, (sessionData) => {
		window.firmly.deviceId = sessionData.device_id;
		telemetryDeviceCreated();
	});
}

/**
 * Gets the API access token, fetching a new session if necessary.
 * @returns {Promise<string|null>} The API access token, or null if not available.
 */
export async function getApiAccessToken() {
	return await getApiAccessTokenUtil(SESSION_CONTEXT.DROPIN);
}

/**
 * Gets the device ID from the browser session.
 * @returns {string|null} The device ID, or null if not found.
 */
export function getDeviceId() {
	return getDeviceIdUtil(SESSION_CONTEXT.DROPIN);
}

/**
 * Gets the headers for API requests, including the access token.
 * @returns {Promise<object>} The headers object with the access token.
 */
export async function getHeaders() {
	return await getAuthHeadersUtil(SESSION_CONTEXT.DROPIN);
}
