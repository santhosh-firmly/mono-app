// Catalog API Client - Product ETL Portal
// Adapted from portal-ui for dash admin

const BASE_URL = '/admin/api/catalog';

class ApiError extends Error {
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
		this.name = 'ApiError';
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
		throw new ApiError(
			errorBody.error?.code || 'UNKNOWN_ERROR',
			errorBody.error?.message || `HTTP ${response.status}`,
			errorBody.error?.details
		);
	}
	return response.json();
}

/**
 * @template T
 * @param {string} path
 * @returns {Promise<T>}
 */
async function get(path) {
	const response = await fetch(`${BASE_URL}${path}`);
	return handleResponse(response);
}

/**
 * @template T
 * @param {string} path
 * @param {unknown} [body]
 * @returns {Promise<T>}
 */
async function post(path, body) {
	const response = await fetch(`${BASE_URL}${path}`, {
		method: 'POST',
		headers: body ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined
	});
	return handleResponse(response);
}

/**
 * @template T
 * @param {string} path
 * @param {unknown} body
 * @returns {Promise<T>}
 */
async function patch(path, body) {
	const response = await fetch(`${BASE_URL}${path}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	return handleResponse(response);
}

/**
 * @template T
 * @param {string} path
 * @returns {Promise<T>}
 */
async function del(path) {
	const response = await fetch(`${BASE_URL}${path}`, {
		method: 'DELETE'
	});
	return handleResponse(response);
}

// === Health ===

export const health = {
	check: () => get('/health')
};

// === Domains ===

export const domains = {
	list: () => get('/domains').then((r) => r.domains),

	get: (domain) => get(`/domains/${domain}/dashboard`),

	register: (domain, syncPlatform = true) =>
		post(`/domains/${domain}/register?sync_platform=${syncPlatform}`),

	delete: (domain, force = true) => del(`/domains/${domain}?force=${force}`),

	getConfig: (domain) => get(`/domains/${domain}/config`),

	updateConfig: (domain, config) => patch(`/domains/${domain}/config`, config),

	bulkUpdateConfig: (config) => patch('/domains/config/bulk', config),

	getSkipStatus: (domain, hours = 24) => get(`/domains/${domain}/skip-status?hours=${hours}`),

	getPlatformInfo: (domain) => get(`/domains/${domain}/platform`),

	syncPlatform: (domain) => post(`/domains/${domain}/platform/sync`),

	syncAllPlatforms: () => post('/domains/platform/sync-all')
};

// === Workflows ===

export const workflows = {
	list: (domain, options) => {
		const params = new URLSearchParams();
		if (options?.status) params.set('status', options.status);
		if (options?.limit) params.set('limit', String(options.limit));
		if (options?.offset) params.set('offset', String(options.offset));
		const query = params.toString();
		return get(`/domains/${domain}/workflows${query ? `?${query}` : ''}`);
	},

	get: (domain, workflowId) => get(`/domains/${domain}/workflows/${workflowId}`),

	start: (domain, countryCode = 'US', options) => {
		const params = new URLSearchParams();
		if (options?.force) params.set('force', 'true');
		if (options?.freshnessThresholdHours)
			params.set('freshnessThresholdHours', String(options.freshnessThresholdHours));
		const query = params.toString();
		return post(`/v1/all-products-jobs/${domain}/${countryCode}${query ? `?${query}` : ''}`);
	},

	getJobStatus: (jobId) => get(`/v1/all-products-jobs/${jobId}`),

	cancelJob: (jobId) => del(`/v1/all-products-jobs/${jobId}`),

	cancel: (domain, workflowId) => post(`/domains/${domain}/workflows/${workflowId}/cancel`),

	startBulk: (domainsList, config) =>
		post('/domains/workflows/bulk', { domains: domainsList, config }),

	getStep: (domain, workflowId, stepNumber) =>
		get(`/domains/${domain}/workflows/${workflowId}/steps/${stepNumber}`),

	getStepProducts: (domain, workflowId, stepNumber, options) => {
		const params = new URLSearchParams();
		if (options?.status) params.set('status', options.status);
		if (options?.limit) params.set('limit', String(options.limit));
		if (options?.offset) params.set('offset', String(options.offset));
		const query = params.toString();
		return get(
			`/domains/${domain}/workflows/${workflowId}/steps/${stepNumber}/products${query ? `?${query}` : ''}`
		);
	},

	retryStep: (domain, workflowId, stepNumber, errorType) =>
		post(
			`/domains/${domain}/workflows/${workflowId}/steps/${stepNumber}/retry`,
			errorType ? { errorType } : undefined
		)
};

// === Catalog ===

export const catalog = {
	getStats: (domain) => get(`/domains/${domain}/catalog/stats`),

	listProducts: (domain, options) => {
		const params = new URLSearchParams();
		if (options?.status) params.set('status', options.status);
		if (options?.limit) params.set('limit', String(options.limit));
		if (options?.offset) params.set('offset', String(options.offset));
		const query = params.toString();
		return get(`/domains/${domain}/catalog/products${query ? `?${query}` : ''}`);
	},

	deleteDomain: (domain) => del(`/v1/catalog/${domain}`)
};

// === Exports ===

export const exports = {
	getLatest: (domain) => get(`/domains/${domain}/exports/latest`),

	getManifest: (domain, workflowId) => get(`/domains/${domain}/exports/${workflowId}/manifest`),

	getFileUrl: (domain, workflowId, filename) =>
		`${BASE_URL}/domains/${domain}/exports/${workflowId}/files/${filename}`,

	bulkDownload: (domainsList, format = 'jsonl.gz') =>
		post('/domains/exports/bulk', { domains: domainsList, format })
};

// === Storage ===

export const storage = {
	getStats: (domain) => get(`/domains/${domain}/storage/stats`),

	list: (domain, prefix = '') => {
		const params = new URLSearchParams();
		if (prefix) params.set('prefix', prefix);
		const query = params.toString();
		return get(`/domains/${domain}/storage${query ? `?${query}` : ''}`);
	},

	getFile: (domain, path) =>
		get(`/domains/${domain}/storage/file?path=${encodeURIComponent(path)}`),

	migrate: (domain, dryRun = false) => post(`/domains/${domain}/storage/migrate`, { dryRun })
};

// === Migration ===

export const migration = {
	getStats: () => get('/domains/migration/stats').then((r) => r.stats),

	migrate: (domain, dryRun = false) => storage.migrate(domain, dryRun)
};

// === Categories (Cross-Domain) ===

export const categories = {
	getAll: () => get('/domains/categories')
};

// === Enrichment ===

export const enrichment = {
	run: (domain, force = false) => post(`/domains/${domain}/enrich`, { force })
};

// Default export as namespace
export default {
	health,
	domains,
	workflows,
	catalog,
	exports,
	storage,
	migration,
	categories,
	enrichment
};
