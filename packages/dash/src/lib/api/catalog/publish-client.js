// Publish API Client - for /api/v1/publish endpoints

// Base URL for the Publish API (proxied through SvelteKit server)
const BASE_URL = '/admin/api/catalog';

class PublishApiError extends Error {
	constructor(code, message, details) {
		super(message);
		this.name = 'PublishApiError';
		this.code = code;
		this.details = details;
	}
}

async function handleResponse(response) {
	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new PublishApiError(
			errorBody.error || 'UNKNOWN_ERROR',
			errorBody.message || `HTTP ${response.status}`,
			errorBody
		);
	}
	return response.json();
}

async function get(url) {
	const response = await fetch(url);
	return handleResponse(response);
}

async function post(url, body) {
	const response = await fetch(url, {
		method: 'POST',
		headers: body ? { 'Content-Type': 'application/json' } : {},
		body: body ? JSON.stringify(body) : undefined
	});
	return handleResponse(response);
}

// === Publish Operations ===

export const publishJobs = {
	/**
	 * Publish to Elasticsearch
	 * POST /api/v1/publish/:domain/:countryCode/elasticsearch
	 */
	toElasticsearch: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.versionId) params.set('versionId', options.versionId);
		if (options?.append) params.set('append', 'true');
		if (options?.batchSize) params.set('batchSize', String(options.batchSize));
		const query = params.toString();
		return post(
			`${BASE_URL}/publish/${domain}/${countryCode}/elasticsearch${query ? `?${query}` : ''}`
		);
	},

	/**
	 * Publish to GCS
	 * POST /api/v1/publish/:domain/:countryCode/gcs/:environment
	 */
	toGcs: (domain, countryCode, environment, options) => {
		const params = new URLSearchParams();
		if (options?.versionId) params.set('versionId', options.versionId);
		if (options?.batchSize) params.set('batchSize', String(options.batchSize));
		const query = params.toString();
		return post(
			`${BASE_URL}/publish/${domain}/${countryCode}/gcs/${environment}${query ? `?${query}` : ''}`
		);
	},

	/**
	 * Publish to both Elasticsearch and GCS
	 * POST /api/v1/publish/:domain/:countryCode?target=both
	 */
	toBoth: (domain, countryCode, environment, options) => {
		const params = new URLSearchParams();
		params.set('target', 'both');
		params.set('environment', environment);
		if (options?.versionId) params.set('versionId', options.versionId);
		if (options?.batchSize) params.set('batchSize', String(options.batchSize));
		return post(`${BASE_URL}/publish/${domain}/${countryCode}?${params.toString()}`);
	},

	/**
	 * Trigger publish based on target type
	 * @param {string} domain
	 * @param {string} countryCode
	 * @param {'elasticsearch' | 'gcs' | 'both'} target
	 * @param {Object} options
	 * @param {string} [options.versionId]
	 * @param {'wizard' | 'production'} [options.environment]
	 * @param {boolean} [options.append]
	 * @param {number} [options.batchSize]
	 */
	trigger: (domain, countryCode, target, options) => {
		switch (target) {
			case 'elasticsearch':
				return publishJobs.toElasticsearch(domain, countryCode, options);
			case 'gcs':
				return publishJobs.toGcs(
					domain,
					countryCode,
					options?.environment || 'wizard',
					options
				);
			case 'both':
				return publishJobs.toBoth(
					domain,
					countryCode,
					options?.environment || 'wizard',
					options
				);
		}
	},

	/**
	 * Check publish job status
	 * GET /api/v1/publish-jobs/:jobId
	 */
	getStatus: (jobId) => get(`${BASE_URL}/publish-jobs/${jobId}`),

	/**
	 * Trigger publish for multiple domains
	 */
	triggerBulk: async (domains, target, options) => {
		const results = [];

		// Process sequentially to avoid rate limiting
		for (const { domain, countryCode } of domains) {
			try {
				const response = await publishJobs.trigger(domain, countryCode, target, options);
				results.push({
					domain,
					countryCode,
					status: 'triggered',
					jobId: response.jobId
				});
			} catch (e) {
				results.push({
					domain,
					countryCode,
					status: 'failed',
					error: e instanceof Error ? e.message : 'Unknown error'
				});
			}
		}

		return {
			total: domains.length,
			triggered: results.filter((r) => r.status === 'triggered').length,
			failed: results.filter((r) => r.status === 'failed').length,
			results
		};
	}
};

// Default export as namespace
const publishApi = {
	jobs: publishJobs
};

export default publishApi;
