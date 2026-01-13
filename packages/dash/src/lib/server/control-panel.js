/**
 * Control Panel API client module.
 *
 * Handles communication with the external Control Panel service for:
 * - Merchant onboarding initiation
 * - Integration status synchronization
 */

import { EXTERNAL_POINT_TO_STEP_MAP, aggregateStatuses } from '$lib/integration-steps.js';

/**
 * Normalize a domain by removing protocol, www prefix, path, and port.
 * @param {string} input - Raw URL or domain string
 * @returns {string} Normalized domain (e.g., "example.com")
 */
export function normalizeDomain(input) {
	if (!input) return '';

	let domain = input.trim().toLowerCase();

	// Remove protocol if present
	domain = domain.replace(/^https?:\/\//, '');

	// Remove www. prefix if present
	domain = domain.replace(/^www\./, '');

	// Remove path and query strings
	domain = domain.split('/')[0];

	// Remove port if present
	domain = domain.split(':')[0];

	return domain;
}

/**
 * Map external Control Panel status to internal Dash status.
 * Only maps statuses that advance the step (completed or in-progress).
 * Since internal steps start as 'pending', we skip PENDING/NOT_STARTED.
 *
 * @param {string} externalStatus - Status from Control Panel API
 * @returns {string|null} Internal status or null if should be skipped
 */
function mapExternalStatus(externalStatus) {
	const statusMap = {
		COMPLETE: 'completed',
		IN_PROGRESS: 'in-progress',
		BLOCKED: 'in-progress',
		BROKEN: 'in-progress'
	};

	// Skip statuses that don't advance the step:
	// PENDING, NOT_STARTED, NOT_NEEDED, NOT_SUPPORTED all return null
	return statusMap[externalStatus] || null;
}

/**
 * Status order for forward-only comparison.
 */
const STATUS_ORDER = {
	pending: 0,
	'in-progress': 1,
	completed: 2
};

/**
 * Check if a status transition is allowed (forward-only).
 * @param {string} currentStatus - Current internal status
 * @param {string} newStatus - Proposed new internal status
 * @returns {boolean} True if transition is allowed
 */
export function isForwardTransition(currentStatus, newStatus) {
	const currentOrder = STATUS_ORDER[currentStatus] ?? 0;
	const newOrder = STATUS_ORDER[newStatus] ?? 0;
	return newOrder > currentOrder;
}

/**
 * Get the Control Panel base URL from platform environment.
 * @param {Object} platform - SvelteKit platform object
 * @returns {string|null} Base URL or null if not configured
 */
function getControlPanelUrl(platform) {
	return platform?.env?.CONTROL_PANEL_URL || null;
}

/**
 * Get the Control Panel auth token from platform environment.
 * @param {Object} platform - SvelteKit platform object
 * @returns {string|null} Auth token or null if not configured
 */
function getControlPanelAuth(platform) {
	return platform?.env?.FIRMLY_CONTROL_PANEL_AUTH || null;
}

/**
 * Fetch integration status from Control Panel API.
 * GET /api/portal/merchants/:merchant_id/integrations/status
 *
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain (used as merchant_id)
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function fetchExternalIntegrationStatus({ platform, merchantDomain }) {
	const baseUrl = getControlPanelUrl(platform);
	const authToken = getControlPanelAuth(platform);

	if (!baseUrl) {
		console.warn('CONTROL_PANEL_URL not configured, skipping external sync');
		return { success: false, error: 'Control Panel URL not configured' };
	}

	const normalizedDomain = normalizeDomain(merchantDomain);
	const url = `${baseUrl}/api/portal/merchants/${encodeURIComponent(normalizedDomain)}/integrations/status`;

	const headers = {
		Accept: 'application/json'
	};
	if (authToken) {
		headers.Authorization = `Bearer ${authToken}`;
	}

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			// 404 means merchant doesn't exist in Control Panel yet - not an error
			if (response.status === 404) {
				return {
					success: true,
					data: null,
					notFound: true
				};
			}

			return {
				success: false,
				error: errorData.description || `HTTP ${response.status}`
			};
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error('Error fetching integration status from Control Panel:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Initiate merchant onboarding on Control Panel.
 * POST /api/portal/merchants
 *
 * This creates the merchant in Control Panel and optionally starts
 * the integration workflow automatically.
 *
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.domain - Merchant domain (will be normalized)
 * @param {string} params.name - Display name for the merchant
 * @param {boolean} params.autoStartIntegration - Whether to auto-start integration (default: true)
 * @returns {Promise<Object>} { success: boolean, data?: Object, error?: string }
 */
export async function initiateControlPanelOnboarding({
	platform,
	domain,
	name,
	autoStartIntegration = true
}) {
	const baseUrl = getControlPanelUrl(platform);
	const authToken = getControlPanelAuth(platform);

	if (!baseUrl) {
		console.warn('CONTROL_PANEL_URL not configured, skipping onboarding initiation');
		return { success: false, error: 'Control Panel URL not configured' };
	}

	const normalizedDomain = normalizeDomain(domain);
	const url = `${baseUrl}/api/portal/merchants`;

	const headers = {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	};
	if (authToken) {
		headers.Authorization = `Bearer ${authToken}`;
	}

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				domain: normalizedDomain,
				name: name || normalizedDomain,
				auto_start_integration: autoStartIntegration
			})
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));

			// 409 Conflict means merchant already exists - this is OK
			if (response.status === 409) {
				console.log(
					`Merchant ${normalizedDomain} already exists in Control Panel, continuing`
				);
				return {
					success: true,
					alreadyExists: true,
					data: { domain: normalizedDomain }
				};
			}

			return {
				success: false,
				error: errorData.description || `HTTP ${response.status}`
			};
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error) {
		console.error('Error initiating Control Panel onboarding:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Transform Control Panel integration status response to internal format.
 * Groups external integration points by their mapped internal step and aggregates statuses.
 *
 * @param {Object} externalData - Response from Control Panel API
 * @returns {Array<Object>} Array of { stepId, substepId, status } objects
 */
export function transformExternalStatus(externalData) {
	if (!externalData?.integration_points) {
		return [];
	}

	// Group by internal step ID
	const stepGroups = new Map();

	for (const [pointId, pointData] of Object.entries(externalData.integration_points)) {
		const internalStepId = EXTERNAL_POINT_TO_STEP_MAP[pointId];
		if (!internalStepId) continue; // Skip unmapped points

		const status = mapExternalStatus(pointData.status);

		// Initialize group if needed
		if (!stepGroups.has(internalStepId)) {
			stepGroups.set(internalStepId, []);
		}

		// Include ALL statuses (including null for pending) so aggregation
		// can correctly determine if ALL points are completed
		stepGroups.get(internalStepId).push(status);
	}

	// Aggregate and filter out null results (all pending)
	const result = [];
	for (const [stepId, statuses] of stepGroups.entries()) {
		const aggregatedStatus = aggregateStatuses(statuses);
		if (aggregatedStatus !== null) {
			result.push({
				stepId,
				substepId: null,
				status: aggregatedStatus
			});
		}
	}

	return result;
}
