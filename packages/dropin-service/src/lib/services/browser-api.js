/**
 * Browser API Service
 *
 * Handles SDK initialization for V5.
 * Uses session-manager for storage, browser-session for API calls.
 */

import { initializationState, INITIALIZATION_STATES } from '$lib/utils/initialization-state.js';
import { sessionManager } from '$lib/utils/session-manager.js';
import { config } from '$lib/utils/config.js';
import { track } from './telemetry.js';
import { fetchBrowserSession } from './browser-session.js';

/**
 * Initialize the Firmly SDK
 *
 * @param {string} appId - Application ID
 * @param {string} apiServer - API server URL
 * @param {string} [domain] - Merchant domain (optional)
 */
export async function initialize(appId, apiServer, domain = null) {
	if (typeof window === 'undefined') return;

	// Check if already initialized
	if (config.appId) return;

	// Initialize config
	config.appId = appId;
	config.apiServer = apiServer;
	config.telemetryServer = `${apiServer}/api/v1/telemetry`;
	config.ccServer = apiServer.replace('api', 'cc');
	config.domain = domain;

	// Use session-manager for ID initialization (storage only)
	const { sessionId, isNew } = sessionManager.initializeSessionId();
	config.sessionId = sessionId;
	config.isNewSessionId = isNew;

	initializationState.setState(INITIALIZATION_STATES.DROPIN_READY);

	try {
		// Use browser-session service for API call
		const session = await fetchBrowserSession(appId, apiServer);
		config.browserId = session?.browser_id;
		config.deviceId = session?.device_id;

		if (isNew) {
			track('dropin_initialized', 'ux');
		}

		initializationState.complete();
	} catch (error) {
		console.warn('Session initialization delayed:', error);
		initializationState.addError(error);
	}
}

/**
 * Set the domain for the current session
 *
 * @param {string} domain - Merchant domain
 */
export function setDomain(domain) {
	config.domain = domain;
}

/**
 * Set the app version
 *
 * @param {string} version - App version
 * @param {string} [appName='dropin-service'] - App name
 */
export function setAppVersion(version, appName = 'dropin-service') {
	config.appVersion = version;
	config.appName = appName;
}
