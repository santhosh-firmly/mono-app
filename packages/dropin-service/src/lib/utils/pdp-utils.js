/**
 * PDP Utilities
 *
 * Pure functions for product discovery, variant handling, and PDP iframe URL building.
 * No state, no side effects, fully testable.
 */

import { convertToFirmlyDomain } from './domain-utils.js';

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
 * Build PDP iframe URL from product URL
 *
 * Converts merchant domain to Firmly aperture domain for iframe embedding.
 *
 * @param {string} productUrl - Original product URL
 * @param {string} [apertureDomain='firmly.ai'] - Aperture base domain
 * @returns {string} Iframe URL with Firmly domain
 */
export function buildPdpIframeUrl(productUrl, apertureDomain = 'firmly.ai') {
	try {
		const urlObj = new URL(productUrl);
		const firmlyHostname = convertToFirmlyDomain(urlObj.hostname, apertureDomain);
		return productUrl.replaceAll(urlObj.hostname, firmlyHostname);
	} catch {
		console.error('buildPdpIframeUrl: Invalid URL:', productUrl);
		return productUrl; // Return original URL as fallback
	}
}

/**
 * Check if product has multiple variants
 *
 * @param {ProductDetails} productDetails - Product details from API
 * @returns {boolean} True if product has more than one variant
 */
export function hasMultipleVariants(productDetails) {
	return (productDetails?.variants?.length ?? 0) > 1;
}

/**
 * Get first available variant from product
 *
 * @param {ProductDetails} productDetails - Product details
 * @returns {ProductVariant|null} First available variant or null if none available
 */
export function getFirstAvailableVariant(productDetails) {
	if (!productDetails?.variants) {
		return null;
	}

	return productDetails.variants.find((v) => v.available) || null;
}

/**
 * Extract merchant domain from product URL
 *
 * Removes www. prefix and returns clean domain.
 *
 * @param {string} productUrl - Product URL
 * @returns {string|null} Merchant domain or null if invalid URL
 */
export function extractMerchantDomain(productUrl) {
	try {
		const url = new URL(productUrl);
		return url.hostname.replace(/^www\./, '');
	} catch {
		console.error('extractMerchantDomain: Invalid URL:', productUrl);
		return null;
	}
}

/**
 * Check if URL should bypass catalog API
 *
 * Some merchants are configured to always show PDP directly.
 *
 * @param {string} productUrl - Product URL
 * @param {Array<string>} [bypassList=[]] - List of domains to bypass
 * @returns {boolean} True if should bypass catalog API
 */
export function shouldBypassCatalogApi(productUrl, bypassList = []) {
	const domain = extractMerchantDomain(productUrl);
	if (!domain) return false;

	return bypassList.some((bypassDomain) => productUrl.includes(bypassDomain));
}
