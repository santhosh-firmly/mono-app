/**
 * Configuration Utility
 *
 * Centralized configuration management for the Firmly SDK.
 * This replaces direct access to window.firmly with a clean, testable service.
 */

// Configuration state - exported directly for easy access
export const config = {
	appId: null,
	apiServer: null,
	telemetryServer: null,
	ccServer: null,
	domain: null,
	browserId: null,
	sessionId: null,
	deviceId: null,
	traceId: null,
	isNewSessionId: false,
	appVersion: null,
	appName: null
};

/**
 * Build domain URL helper
 * @param {string} suffix - URL suffix (e.g., 'cart', 'cart/line-items')
 * @param {string} [domain] - Domain override (uses config.domain if not provided)
 * @returns {string} Full domain URL
 */
export function buildDomainUrl(suffix, domain = null) {
	const targetDomain = domain || config.domain;
	return `${config.apiServer}/api/v1/domains/${targetDomain}/${suffix}`;
}
