// Catalog API Proxy - Routes requests to domains-service via service binding auth
// Uses foundation/auth/service-binding-auth.js pattern for internal communication

/**
 * Routes API requests to the appropriate backend service
 * Path prefixes determine the target:
 * - pd/* -> /api/v1/product-details
 * - pd-jobs/* -> /api/v1/product-details-jobs
 * - workflows/* -> /api/v1/workflows
 * - enrichment/* -> /api/v1/enrichment
 * - enrichment-analytics/* -> /api/v1/analytics/enrichment
 * - admin/* -> /api/v1/admin
 * - export/* -> /api/v1/export
 * - export-jobs/* -> /api/v1/export-jobs
 * - exports/* -> /api/v1/exports
 * - publish/* -> /api/v1/publish
 * - publish-jobs/* -> /api/v1/publish-jobs
 * - v1/* -> /api (domains-service)
 * - * -> /api (catalog-service)
 */

const SERVICE_ROUTES = {
	pd: '/api/v1/product-details',
	'pd-jobs': '/api/v1/product-details-jobs',
	workflows: '/api/v1/workflows',
	enrichment: '/api/v1/enrichment',
	'enrichment-analytics': '/api/v1/analytics/enrichment',
	admin: '/api/v1/admin',
	// Export routes
	export: '/api/v1/export',
	'export-jobs': '/api/v1/export-jobs',
	exports: '/api/v1/exports',
	// Publish routes
	publish: '/api/v1/publish',
	'publish-jobs': '/api/v1/publish-jobs'
};

/**
 * Parse the path and determine the target URL
 * @param {string} path
 * @param {string} search
 * @returns {{ prefix: string, targetPath: string }}
 */
function parseRoute(path, search) {
	// Check for known service prefixes
	for (const [prefix, basePath] of Object.entries(SERVICE_ROUTES)) {
		if (path.startsWith(`${prefix}/`)) {
			const remainingPath = path.slice(prefix.length + 1);
			return {
				prefix,
				targetPath: `${basePath}/${remainingPath}${search}`
			};
		}
	}

	// v1/* paths go to domains-service /api
	if (path.startsWith('v1/')) {
		return {
			prefix: 'v1',
			targetPath: `/api/${path}${search}`
		};
	}

	// Everything else goes to catalog-service /api
	return {
		prefix: 'catalog',
		targetPath: `/api/${path}${search}`
	};
}

/**
 * Make a request to the domains-service via service binding
 * Uses internal hostname and service binding auth headers
 * @param {App.Platform} platform
 * @param {string} targetPath
 * @param {RequestInit} init
 * @returns {Promise<Response>}
 */
async function fetchViaServiceBinding(platform, targetPath, init = {}) {
	const service = platform.env.DOMAINS_SERVICE;

	if (!service) {
		return new Response(
			JSON.stringify({
				error: 'SERVICE_NOT_CONFIGURED',
				message: 'DOMAINS_SERVICE binding not configured'
			}),
			{ status: 503, headers: { 'Content-Type': 'application/json' } }
		);
	}

	// Create request with internal hostname (required by service-binding-auth.js)
	const url = `http://internal${targetPath}`;

	const headers = new Headers(init.headers);
	// Set service binding auth headers (required by foundation/auth/service-binding-auth.js)
	headers.set('X-Firmly-Device-Id', 'dash-admin');
	headers.set('X-Firmly-App-Id', 'catalog-portal');

	return service.fetch(url, {
		...init,
		headers
	});
}

/**
 * Proxy response back to client
 * @param {Response} response
 * @returns {Response}
 */
function proxyResponse(response) {
	return new Response(response.body, {
		status: response.status,
		headers: {
			'Content-Type': response.headers.get('Content-Type') || 'application/json'
		}
	});
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, url, platform }) {
	const { targetPath } = parseRoute(params.path, url.search);

	try {
		const response = await fetchViaServiceBinding(platform, targetPath);
		return proxyResponse(response);
	} catch (error) {
		console.error('Catalog API GET error:', error);
		return new Response(
			JSON.stringify({
				error: 'PROXY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, url, request, platform }) {
	const { targetPath } = parseRoute(params.path, url.search);

	try {
		const contentType = request.headers.get('Content-Type');
		const body = await request.text();

		const headers = {};
		if (contentType) {
			headers['Content-Type'] = contentType;
		}

		const response = await fetchViaServiceBinding(platform, targetPath, {
			method: 'POST',
			headers,
			body: body || undefined
		});

		return proxyResponse(response);
	} catch (error) {
		console.error('Catalog API POST error:', error);
		return new Response(
			JSON.stringify({
				error: 'PROXY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ params, url, request, platform }) {
	const { targetPath } = parseRoute(params.path, url.search);

	try {
		const contentType = request.headers.get('Content-Type');
		const body = await request.text();

		const response = await fetchViaServiceBinding(platform, targetPath, {
			method: 'PUT',
			headers: {
				'Content-Type': contentType || 'application/json'
			},
			body
		});

		return proxyResponse(response);
	} catch (error) {
		console.error('Catalog API PUT error:', error);
		return new Response(
			JSON.stringify({
				error: 'PROXY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PATCH({ params, url, request, platform }) {
	const { targetPath } = parseRoute(params.path, url.search);

	try {
		const contentType = request.headers.get('Content-Type');
		const body = await request.text();

		const response = await fetchViaServiceBinding(platform, targetPath, {
			method: 'PATCH',
			headers: {
				'Content-Type': contentType || 'application/json'
			},
			body
		});

		return proxyResponse(response);
	} catch (error) {
		console.error('Catalog API PATCH error:', error);
		return new Response(
			JSON.stringify({
				error: 'PROXY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ params, url, platform }) {
	const { targetPath } = parseRoute(params.path, url.search);

	try {
		const response = await fetchViaServiceBinding(platform, targetPath, {
			method: 'DELETE'
		});

		return proxyResponse(response);
	} catch (error) {
		console.error('Catalog API DELETE error:', error);
		return new Response(
			JSON.stringify({
				error: 'PROXY_ERROR',
				message: error instanceof Error ? error.message : 'Unknown error'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
}
