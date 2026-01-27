/**
 * Attribution Service
 *
 * Handles attribution tracking and custom properties for the Firmly SDK.
 * This service manages UTM parameters, referrer tracking, and merchant custom properties.
 */

import { browserFetch } from '$lib/utils/browser-fetch.js';
import { getHeaders } from './browser-session.js';
import { config, buildDomainUrl } from '$lib/utils/config.js';

/**
 * Set attribution data for the current session
 * @param {Object} attributionData - Attribution data
 * @param {string} attributionData.utm - UTM parameters as query string
 * @param {string} attributionData.referrer_url - Referrer URL
 * @param {string} attributionData.landing_page - Landing page URL
 * @returns {Promise<Object>} Response from the server
 */
export async function setAttribution(attributionData) {
	if (!config.apiServer) {
		throw new Error('API server not configured');
	}

	const headers = await getHeaders();
	return browserFetch(`${config.apiServer}/api/v1/browser-session/attribution`, {
		...headers,
		method: 'POST',
		body: JSON.stringify(attributionData)
	});
}

/**
 * Set custom properties for a shop
 * @param {string} shopId - Shop/domain identifier
 * @param {Object} customProperties - Custom properties to set
 * @returns {Promise<Object>} Response from the server
 */
export async function setCustomProperties(shopId, customProperties) {
	if (!shopId) {
		throw new Error('Shop ID is required');
	}

	const headers = await getHeaders();
	return browserFetch(buildDomainUrl('custom-properties', shopId), {
		...headers,
		method: 'POST',
		body: JSON.stringify(customProperties)
	});
}
