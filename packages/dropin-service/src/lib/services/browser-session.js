/**
 * Browser Session Service
 *
 * Handles session API calls and authentication headers.
 */

import { sessionManager } from '$lib/utils/session-manager.js';
import { config } from '$lib/utils/config.js';
import { track, EVENT_TYPE_DEVICE } from './telemetry.js';

const SESSION_TIMEOUT = 5000;

/**
 * Fetches or refreshes a browser session from the API server.
 * @param {string} appId - The application identifier
 * @param {string} apiServer - The API server base URL
 * @param {Object} [options] - Optional configuration
 * @param {Function} [options.onDeviceCreated] - Callback when a new device is created
 * @returns {Promise<Object>} The session data containing access_token and device info
 * @throws {Error} If parameters are invalid or request fails/times out
 */
export async function fetchBrowserSession(appId, apiServer, options = {}) {
	if (!sessionManager.isBrowser() || !appId || !apiServer) {
		throw new Error('Invalid parameters for session fetch');
	}

	const requestOptions = {
		method: 'POST',
		headers: {
			'x-firmly-app-id': appId,
			'Content-Type': 'application/json'
		}
	};

	const currentSession = sessionManager.getStoredSession();
	if (currentSession?.access_token) {
		requestOptions.body = JSON.stringify({
			access_token: currentSession.access_token
		});
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), SESSION_TIMEOUT);

		const response = await fetch(`${apiServer}/api/v1/browser-session`, {
			...requestOptions,
			signal: controller.signal,
			credentials: 'include'
		});

		clearTimeout(timeoutId);

		if (response.ok) {
			const sessionData = await response.json();
			sessionManager.setStoredSession(sessionData);

			if (sessionData.device_created) {
				config.deviceId = sessionData.device_id;
				track('deviceCreated', EVENT_TYPE_DEVICE);
				if (options.onDeviceCreated) {
					options.onDeviceCreated(sessionData);
				}
			}

			return sessionData;
		}

		throw new Error(`Session fetch failed: ${response.status}`);
	} catch (error) {
		if (error.name === 'AbortError') {
			throw new Error('Session request timed out');
		}
		throw error;
	}
}

/**
 * Retrieves a valid API access token, refreshing the session if needed.
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.allowStaleToken] - Return stale token if refresh fails
 * @returns {Promise<string|null>} The access token or null if unavailable
 */
export async function getApiAccessToken(options = {}) {
	if (!config.appId || !config.apiServer) return null;

	let session = sessionManager.getStoredSession();

	if (!sessionManager.isSessionValid(session)) {
		try {
			session = await fetchBrowserSession(config.appId, config.apiServer, options);
		} catch (error) {
			if (options.allowStaleToken && session?.access_token) {
				return session.access_token;
			}
			console.error('Failed to get API access token:', error);
			return null;
		}
	}

	return session?.access_token || null;
}

/**
 * Builds request headers with authentication for API calls.
 * @returns {Promise<{headers: Object}>} Object containing headers with Content-Type and authorization
 */
export async function getHeaders() {
	if (!config.appId || !config.apiServer) {
		return {
			headers: { 'Content-Type': 'application/json' }
		};
	}

	try {
		const token = await getApiAccessToken({ allowStaleToken: true });
		return {
			headers: {
				'Content-Type': 'application/json',
				'x-firmly-authorization': token
			}
		};
	} catch {
		return {
			headers: { 'Content-Type': 'application/json' }
		};
	}
}

/**
 * Returns the current device identifier from session storage.
 * @returns {string|null} The device ID or null if not available
 */
export function getDeviceId() {
	return sessionManager.getDeviceId();
}
