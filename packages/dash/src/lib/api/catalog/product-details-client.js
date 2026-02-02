// Product Details API Client
// Adapted from portal-ui for dash admin

const BASE_URL = '/admin/api/catalog/pd';
const JOBS_BASE_URL = '/admin/api/catalog/pd-jobs';
const WORKFLOWS_BASE_URL = '/admin/api/catalog/workflows';

class ProductDetailsApiError extends Error {
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
		this.name = 'ProductDetailsApiError';
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
		throw new ProductDetailsApiError(
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

// === Cross-Domain Statistics ===

export const crossDomainStats = {
	getStats: () => get(`${BASE_URL}/stats`),

	getPending: () => get(`${BASE_URL}/pending`),

	getVariantStats: () => get(`${BASE_URL}/variant-stats`)
};

// === Domain Management ===

export const domainManagement = {
	sync: (domain, countryCode) => post(`${BASE_URL}/${domain}/${countryCode}/sync`),

	getStats: (domain, countryCode) => get(`${BASE_URL}/${domain}/${countryCode}/stats`),

	getStatus: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.status) params.set('status', options.status);
		if (options?.page) params.set('page', String(options.page));
		if (options?.size) params.set('size', String(options.size));
		const query = params.toString();
		return get(`${BASE_URL}/${domain}/${countryCode}/status${query ? `?${query}` : ''}`);
	},

	getConfig: (domain, countryCode) => get(`${BASE_URL}/${domain}/${countryCode}/config`),

	updateConfig: (domain, countryCode, config) =>
		put(`${BASE_URL}/${domain}/${countryCode}/config`, config),

	migrate: (domain, countryCode) => post(`${BASE_URL}/${domain}/${countryCode}/migrate`)
};

// === Workflow Operations ===

export const workflows = {
	trigger: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.limit !== undefined) params.set('limit', String(options.limit));
		if (options?.batchSize) params.set('batchSize', String(options.batchSize));
		if (options?.delayBetweenBatchesMs)
			params.set('delayBetweenBatchesMs', String(options.delayBetweenBatchesMs));
		if (options?.freshnessThresholdHours)
			params.set('freshnessThresholdHours', String(options.freshnessThresholdHours));
		const query = params.toString();
		return post(`${BASE_URL}/${domain}/${countryCode}${query ? `?${query}` : ''}`);
	},

	getJobStatus: (jobId) => get(`${JOBS_BASE_URL}/${jobId}`),

	getMetadata: (domain, countryCode) => get(`${BASE_URL}/${domain}/${countryCode}`),

	getProduct: (domain, countryCode, pdpUrl) =>
		get(`${BASE_URL}/${domain}/${countryCode}/product?pdp_url=${encodeURIComponent(pdpUrl)}`),

	listRuns: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.type) params.set('type', options.type);
		if (options?.status) params.set('status', options.status);
		if (options?.limit) params.set('limit', String(options.limit));
		const query = params.toString();
		return get(`${BASE_URL}/${domain}/${countryCode}/workflow-runs${query ? `?${query}` : ''}`);
	},

	getLatestRuns: (domain, countryCode) =>
		get(`${BASE_URL}/${domain}/${countryCode}/workflow-runs/latest`)
};

// === Variant Analytics ===

export const variantAnalytics = {
	getStats: (domain, countryCode) => get(`${BASE_URL}/${domain}/${countryCode}/variant-stats`),

	getPriceChanges: (domain, countryCode, limit = 50) =>
		get(`${BASE_URL}/${domain}/${countryCode}/price-changes?limit=${limit}`),

	getAvailabilityChanges: (domain, countryCode, limit = 50) =>
		get(`${BASE_URL}/${domain}/${countryCode}/availability-changes?limit=${limit}`),

	getProductVariants: (domain, countryCode, pdpUrl) =>
		get(
			`${BASE_URL}/${domain}/${countryCode}/product-variants?pdp_url=${encodeURIComponent(pdpUrl)}`
		),

	getVariantsByProductId: (domain, countryCode, productId) =>
		get(`${BASE_URL}/${domain}/${countryCode}/variants?product_id=${productId}`),

	getPriceHistory: (domain, countryCode, variantId, limit = 100) =>
		get(
			`${BASE_URL}/${domain}/${countryCode}/variant-price-history?variant_id=${variantId}&limit=${limit}`
		),

	getAvailabilityHistory: (domain, countryCode, variantId, limit = 100) =>
		get(
			`${BASE_URL}/${domain}/${countryCode}/variant-availability-history?variant_id=${variantId}&limit=${limit}`
		),

	getPriceVariance: (domain, countryCode, pdpUrl) =>
		get(
			`${BASE_URL}/${domain}/${countryCode}/price-variance?pdp_url=${encodeURIComponent(pdpUrl)}`
		)
};

// === Cross-Domain Workflows API ===

export const crossDomainWorkflows = {
	getRunning: () => get(`${WORKFLOWS_BASE_URL}/running`),

	getStats: () => get(`${WORKFLOWS_BASE_URL}/stats`)
};

// Default export as namespace
const productDetailsApi = {
	crossDomainStats,
	domainManagement,
	workflows,
	variantAnalytics,
	crossDomainWorkflows
};

export default productDetailsApi;
