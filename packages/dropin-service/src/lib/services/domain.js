/**
 * Domain Service
 *
 * API calls related to domain operations (product details, domain info).
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string} sku - Variant SKU
 * @property {boolean} available - Whether variant is available
 * @property {string} title - Variant title
 * @property {number} price - Variant price
 */

/**
 * @typedef {Object} ProductDetails
 * @property {Array<ProductVariant>} variants - Product variants
 * @property {string} title - Product title
 * @property {string} url - Product URL
 */

/**
 * @typedef {Object} Config
 * @property {string} apiServer - API server URL
 * @property {string} appId - Application ID
 */

/**
 * Fetch product details from catalog API
 *
 * @param {string} productUrl - Product URL
 * @param {Config} config - Configuration with API server and app ID
 * @returns {Promise<ProductDetails>} Product details
 * @throws {Error} If fetch fails or product not found
 */
export async function fetchProductDetails(productUrl, config) {
	if (!config?.apiServer) {
		throw new Error('fetchProductDetails: config.apiServer required');
	}

	if (!config?.appId) {
		throw new Error('fetchProductDetails: config.appId required');
	}

	const encodedUrl = encodeURIComponent(productUrl);

	const response = await fetch(`${config.apiServer}/api/v1/domains-pdp?url=${encodedUrl}`, {
		headers: {
			'x-firmly-app-id': config.appId
		}
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch product: ${response.statusText}`);
	}

	return await response.json();
}
