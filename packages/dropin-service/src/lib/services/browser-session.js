/**
 * @fileoverview Browser session functions for managing user sessions.
 */

import { browserFetch } from './browser-fetch';
import { telemetryDeviceCreated } from './telemetry';

const BROWSER_SESSION = 'FBS';
const SESSION_ID = 'FRSID';

let currentBrowserSession;

/**
 * Gets the browser session from local storage or the current session.
 * @returns {object|null} The browser session object, or null if not found.
 */
export function getBrowserSession() {
	const lbs = localStorage.getItem(BROWSER_SESSION);
	let lbj = null;
	if (lbs) {
		lbj = JSON.parse(lbs);
	}
	return currentBrowserSession || lbj || null;
}

/**
 * Sets the browser session in local storage and the current session.
 * @param {object} browserSession The browser session object to set.
 */
export function setBrowserSession(browserSession) {
	currentBrowserSession = browserSession;
	const stringifiedBrowserSession = JSON.stringify(browserSession);
	localStorage.setItem(BROWSER_SESSION, stringifiedBrowserSession);
}

/**
 * Gets the session ID from session storage.
 * @returns {string|null} The session ID, or null if not found.
 */
export function getSessionId() {
	const value = sessionStorage.getItem(SESSION_ID);
	if (value) {
		return value;
	}
	return null;
}

/**
 * Sets the session ID in session storage.
 * @param {string} value The session ID to set.
 */
export function setSessionId(value) {
	sessionStorage.setItem(SESSION_ID, value);
}

/**
 * Initializes the session ID, creating a new one if it doesn't exist.
 * @returns {string} The initialized session ID.
 */
export function initSessionId() {
	let id = getSessionId();
	if (!id) {
		id = 's' + crypto.randomUUID();
		setSessionId(id);
		window.firmly.isNewSessionId = true;
	} else {
		window.firmly.isNewSessionId = false;
	}

	return id;
}

/**
 * Gets the number of seconds since the epoch.
 * @returns {number} The number of seconds since the epoch.
 */
export function getSecondsSinceEpoch() {
	return ~~(Date.now() / 1000);
}

/**
 * Fetches the browser session from the server.
 * @returns {Promise<object|null>} The browser session object, or null if the fetch fails.
 */
export async function fetchBrowserSession() {
	const firmly = window.firmly;

	const requestOptions = {
		method: 'POST',
		headers: {
			'x-firmly-app-id': firmly.appId,
			'Content-type': 'application/json'
		}
	};

	const accessToken = currentBrowserSession?.access_token;

	if (accessToken) {
		requestOptions.headers['Content-Type'] = 'application/json';
		requestOptions.body = JSON.stringify({
			access_token: accessToken
		});
	}

	const ret = await browserFetch(`${firmly.apiServer}/api/v1/browser-session`, requestOptions);

	if (ret.status == 200) {
		setBrowserSession(ret.data);
		firmly.deviceId = ret.data.device_id;
		if (ret.data.device_created) {
			telemetryDeviceCreated();
		}
		return ret.data;
	}

	return null;
}

/**
 * Gets the API access token, fetching a new session if necessary.
 * @returns {Promise<string|null>} The API access token, or null if not available.
 */
export async function getApiAccessToken() {
	let session = getBrowserSession();
	if (!session || session.expires - 300 <= getSecondsSinceEpoch()) {
		session = await fetchBrowserSession();
	}

	if (session) {
		return session.access_token;
	}
	return null;
}

/**
 * Gets the device ID from the browser session.
 * @returns {string|null} The device ID, or null if not found.
 */
export function getDeviceId() {
	let session = getBrowserSession();
	if (session) {
		return session.device_id;
	}
	return null;
}


/**
 * Gets the headers for API requests, including the access token.
 * @returns {Promise<object>} The headers object with the access token.
 */
export async function getHeaders() {
	const auth = await getApiAccessToken();
	const ret = {
		headers: {
			'Content-Type': 'application/json',
			'x-firmly-authorization': auth
		}
	};

	return ret;
}