// Export API Client - for /api/v1/export and /api/v1/exports endpoints

// Base URL for the Export API (proxied through SvelteKit server)
const BASE_URL = '/admin/api/catalog';

class ExportApiError extends Error {
	constructor(code, message, details) {
		super(message);
		this.name = 'ExportApiError';
		this.code = code;
		this.details = details;
	}
}

async function handleResponse(response) {
	if (!response.ok) {
		const errorBody = await response.json().catch(() => ({}));
		throw new ExportApiError(
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

// === Export Trigger Operations ===

export const exportJobs = {
	/**
	 * Trigger an export for a domain
	 * POST /api/v1/export/:domain/:countryCode
	 */
	trigger: (domain, countryCode) => post(`${BASE_URL}/export/${domain}/${countryCode}`),

	/**
	 * Check export job status
	 * GET /api/v1/export-jobs/:jobId
	 */
	getStatus: (jobId) => get(`${BASE_URL}/export-jobs/${jobId}`),

	/**
	 * Trigger exports for multiple domains
	 */
	triggerBulk: async (domains) => {
		const results = [];

		// Process sequentially to avoid rate limiting
		for (const { domain, countryCode } of domains) {
			try {
				const response = await exportJobs.trigger(domain, countryCode);
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

// === Export Manifest Operations ===

export const exportManifest = {
	/**
	 * Get export manifest for a domain
	 * GET /api/v1/exports/:domain/:countryCode
	 * Supports filters: date_after, date_before, date, latest
	 */
	get: (domain, countryCode, options) => {
		const params = new URLSearchParams();
		if (options?.dateAfter) params.set('date_after', options.dateAfter);
		if (options?.dateBefore) params.set('date_before', options.dateBefore);
		if (options?.date) params.set('date', options.date);
		if (options?.latest) params.set('latest', 'true');
		const query = params.toString();
		return get(`${BASE_URL}/exports/${domain}/${countryCode}${query ? `?${query}` : ''}`);
	},

	/**
	 * Get latest export for a domain (convenience method)
	 */
	getLatest: (domain, countryCode) => exportManifest.get(domain, countryCode, { latest: true }),

	/**
	 * Get version details
	 * GET /api/v1/exports/:domain/:countryCode/:versionId
	 */
	getVersion: (domain, countryCode, versionId) =>
		get(`${BASE_URL}/exports/${domain}/${countryCode}/${versionId}`),

	/**
	 * Get download URL for a file
	 * GET /api/v1/exports/:domain/:countryCode/:versionId/:fileName
	 */
	getFileUrl: (domain, countryCode, versionId, fileName) =>
		`${BASE_URL}/exports/${domain}/${countryCode}/${versionId}/${fileName}`
};

// Default export as namespace
const exportApi = {
	jobs: exportJobs,
	manifest: exportManifest
};

export default exportApi;
