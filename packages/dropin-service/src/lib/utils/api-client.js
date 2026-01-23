/**
 * API Client Utility
 *
 * Provides reusable functions for making API requests.
 * Does NOT import from services - receives headers as parameter.
 */

import { browserFetch } from './browser-fetch.js';
import { config, buildDomainUrl } from './config.js';

/**
 * Make API request to domain endpoint
 * @param {string} endpoint - API endpoint path (e.g., 'cart', 'cart/line-items')
 * @param {string} [domain] - Domain override (uses config.domain if not provided)
 * @param {Object} [options] - Request options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.body] - Request body (will be JSON stringified)
 * @param {Object} [options.headers] - Request headers
 * @returns {Promise<{status: number, data?: any}>} Response with status and data
 */
export async function domainRequest(endpoint, domain, options = {}) {
	const url = buildDomainUrl(endpoint, domain);

	const fetchOptions = {
		method: options.method || 'GET',
		headers: options.headers || { 'Content-Type': 'application/json' }
	};

	if (options.body) {
		fetchOptions.body = JSON.stringify(options.body);
	}

	return browserFetch(url, fetchOptions);
}

/**
 * Make API request to base API server
 * @param {string} endpoint - API endpoint path (e.g., '/api/v1/attribution')
 * @param {Object} [options] - Request options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {Object} [options.body] - Request body (will be JSON stringified)
 * @param {Object} [options.headers] - Request headers
 * @returns {Promise<{status: number, data?: any}>} Response with status and data
 */
export async function apiRequest(endpoint, options = {}) {
	const url = `${config.apiServer}${endpoint}`;

	const fetchOptions = {
		method: options.method || 'GET',
		headers: options.headers || { 'Content-Type': 'application/json' }
	};

	if (options.body) {
		fetchOptions.body = JSON.stringify(options.body);
	}

	return browserFetch(url, fetchOptions);
}
