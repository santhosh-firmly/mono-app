/**
 * Address Autocomplete Service
 *
 * API calls for address search and completion.
 * Uses api-client for DRY request handling.
 */

import { domainRequest } from '$lib/utils/api-client.js';
import { getHeaders } from './browser-session.js';

/**
 * Search for address suggestions based on user input
 * @param {string} query - The address search query (minimum 4 characters)
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data: {predictions: Array}}>}
 */
export async function searchAddress(query, domain) {
	if (!query || query.length < 4) {
		return { status: 200, data: { predictions: [] } };
	}

	try {
		const { headers } = await getHeaders();
		const encodedQuery = encodeURIComponent(query);
		const response = await domainRequest(`addresses?q=${encodedQuery}`, domain, { headers });

		if (response.status === 200) {
			// Map predictions to include address1 extracted from full address
			const predictions = (response.data?.predictions || []).map((prediction) => {
				let address1 = prediction.address1;
				if (prediction.address && !address1) {
					const split = prediction.address.split(',');
					if (split && split.length >= 1) {
						address1 = split[0];
					}
				}
				return {
					id: prediction.id,
					value: prediction.address,
					address1
				};
			});

			return {
				status: 200,
				data: { predictions }
			};
		}

		return { status: response.status, data: { predictions: [] } };
	} catch (error) {
		console.error('Address search error:', error);
		return { status: 500, data: { predictions: [] } };
	}
}

/**
 * Get full address details by prediction ID
 * @param {string} id - The address prediction ID
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function getAddress(id, domain) {
	if (!id) {
		return { status: 400, data: null };
	}

	try {
		const { headers } = await getHeaders();
		const response = await domainRequest(`addresses/${id}`, domain, { headers });

		if (response.status === 200) {
			return {
				status: 200,
				data: response.data
			};
		}

		return { status: response.status, data: null };
	} catch (error) {
		console.error('Get address error:', error);
		return { status: 500, data: null };
	}
}
