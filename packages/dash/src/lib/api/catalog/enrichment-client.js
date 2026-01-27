// Enrichment API Client
// Adapted from portal-ui for dash admin

const BASE_URL = '/admin/api/catalog/enrichment';
const ANALYTICS_URL = '/admin/api/catalog/enrichment-analytics';
const ADMIN_URL = '/admin/api/catalog/admin';

class EnrichmentApiError extends Error {
	/** @type {string} */
	code;
	/** @type {Record<string, unknown> | undefined} */
	details;

	/**
	 * @param {string} code
	 * @param {string} message
	 * @param {Record<string, unknown>} [details]
	 */
	constructor(code, message, details) {
		super(message);
		this.name = 'EnrichmentApiError';
		this.code = code;
		this.details = details;
	}
}

/**
 * @template T
 * @param {Response} response
 * @returns {Promise<T>}
 */
async function handleResponse(response) {
	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new EnrichmentApiError(
			errorBody.error || 'UNKNOWN_ERROR',
			errorBody.message || `HTTP ${response.status}`,
			errorBody
		);
	}
	return response.json();
}

/**
 * @template T
 * @param {string} url
 * @returns {Promise<T>}
 */
async function get(url) {
	const response = await fetch(url);
	return handleResponse(response);
}

/**
 * @template T
 * @param {string} url
 * @param {unknown} [body]
 * @returns {Promise<T>}
 */
async function post(url, body) {
	const response = await fetch(url, {
		method: 'POST',
		headers: body ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined
	});
	return handleResponse(response);
}

/**
 * @template T
 * @param {string} url
 * @param {unknown} body
 * @returns {Promise<T>}
 */
async function put(url, body) {
	const response = await fetch(url, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return handleResponse(response);
}

/**
 * @template T
 * @param {string} url
 * @returns {Promise<T>}
 */
async function del(url) {
	const response = await fetch(url, {
		method: 'DELETE'
	});
	return handleResponse(response);
}

// === Overview / Dashboard ===

export const overview = {
	getOverview: () => get(`${ANALYTICS_URL}/overview`)
};

// === Job Management ===

export const jobs = {
	list: (options) => {
		const params = new URLSearchParams();
		if (options?.domain) params.set('domain', options.domain);
		if (options?.status) params.set('status', options.status);
		const query = params.toString();
		return get(`${BASE_URL}/jobs${query ? `?${query}` : ''}`);
	},

	get: (jobId) => get(`${BASE_URL}/jobs/${jobId}`),

	trigger: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.force) params.set('force', 'true');
		if (options?.batchSize) params.set('batchSize', String(options.batchSize));
		const query = params.toString();
		return post(`${BASE_URL}/${domain}/${countryCode}${query ? `?${query}` : ''}`);
	},

	cancel: (jobId) => post(`${BASE_URL}/jobs/${jobId}/cancel`)
};

// === Category Management ===

export const categories = {
	list: () => get(`${BASE_URL}/categories`),

	getTree: () => get(`${BASE_URL}/categories/tree`),

	get: (categoryName) => get(`${ANALYTICS_URL}/category/${encodeURIComponent(categoryName)}`),

	getProducts: (categoryName, options) => {
		const params = new URLSearchParams();
		params.set('domain', options.domain);
		if (options?.limit) params.set('limit', String(options.limit));
		if (options?.offset) params.set('offset', String(options.offset));
		return get(
			`${ANALYTICS_URL}/category/${encodeURIComponent(categoryName)}?${params.toString()}`
		);
	},

	seed: () => post(`${BASE_URL}/categories/seed`)
};

// === Domain Analytics ===

export const domainAnalytics = {
	getStats: (domain, countryCode) => get(`${ANALYTICS_URL}/${domain}/${countryCode}/stats`),

	getProducts: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.category) params.set('category', options.category);
		if (options?.status) params.set('status', options.status);
		if (options?.limit) params.set('limit', String(options.limit));
		if (options?.offset) params.set('offset', String(options.offset));
		const query = params.toString();
		return get(`${ANALYTICS_URL}/${domain}/${countryCode}/products${query ? `?${query}` : ''}`);
	}
};

// === Products API (with enrichment and overrides) ===

export const products = {
	list: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.page) params.set('page', String(options.page));
		if (options?.size) params.set('size', String(options.size));
		if (options?.enrichedType) params.set('enrichedType', options.enrichedType);
		if (options?.hasOverride !== undefined)
			params.set('hasOverride', String(options.hasOverride));
		const query = params.toString();
		return get(`${ADMIN_URL}/products/${domain}/${countryCode}${query ? `?${query}` : ''}`);
	},

	getEnrichment: (domain, countryCode, pdpUrl) =>
		get(
			`${ADMIN_URL}/products/${domain}/${countryCode}/enrichment?pdp_url=${encodeURIComponent(pdpUrl)}`
		),

	setOverride: (domain, countryCode, override) =>
		put(`${ADMIN_URL}/products/${domain}/${countryCode}/enrichment`, override),

	deleteOverride: (domain, countryCode, pdpUrl) =>
		del(
			`${ADMIN_URL}/products/${domain}/${countryCode}/enrichment?pdp_url=${encodeURIComponent(pdpUrl)}`
		),

	bulkOverride: (domain, countryCode, overrides) =>
		post(`${ADMIN_URL}/products/${domain}/${countryCode}/enrichment/bulk`, {
			updates: overrides
		}),

	listOverrides: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.page) params.set('page', String(options.page));
		if (options?.size) params.set('size', String(options.size));
		const query = params.toString();
		return get(
			`${ADMIN_URL}/products/${domain}/${countryCode}/overrides${query ? `?${query}` : ''}`
		);
	},

	getCorrections: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.page) params.set('page', String(options.page));
		if (options?.size) params.set('size', String(options.size));
		const query = params.toString();
		return get(
			`${ADMIN_URL}/products/${domain}/${countryCode}/corrections${query ? `?${query}` : ''}`
		);
	},

	getGlobalCorrections: () => get(`${ADMIN_URL}/products/corrections/global`)
};

// Default export as namespace
const enrichmentApi = {
	overview,
	jobs,
	categories,
	domainAnalytics,
	products
};

export default enrichmentApi;
