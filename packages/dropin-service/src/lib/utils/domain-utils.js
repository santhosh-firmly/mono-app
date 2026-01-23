/**
 * Domain Utilities
 *
 * Functions for domain name transformations and URL manipulation.
 */

/**
 * Converts a merchant hostname to a Firmly domain.
 * @param {string} hostname - The original hostname (e.g., store.myshopify.com)
 * @param {string} apertureBaseDomain - The Firmly base domain
 * @returns {string} The converted Firmly domain
 */
export function convertToFirmlyDomain(hostname, apertureBaseDomain) {
	const domain = hostname.replace(/^www\./, '');

	const specialCases = {
		'test.victoriassecret.com': `test-victoriassecret.${apertureBaseDomain}`
	};

	if (specialCases[hostname]) {
		return specialCases[hostname];
	}

	if (domain.endsWith('myshopify.com')) {
		return domain.replace('myshopify.com', apertureBaseDomain);
	}

	const domainParts = domain.split('.');
	if (domainParts.length >= 2) {
		return `${domainParts[0]}.${apertureBaseDomain}`;
	}

	return `${domain}.${apertureBaseDomain}`;
}

/**
 * Updates a URL object to use the Firmly domain.
 * @param {URL} urlObj - The URL object to transform
 * @param {string} apertureBaseDomain - The Firmly base domain
 * @returns {URL} A new URL with the Firmly domain
 */
export function updateUrlWithFirmlyDomain(urlObj, apertureBaseDomain) {
	const stringUrl = urlObj.toString();
	const firmlyHostname = convertToFirmlyDomain(urlObj.hostname, apertureBaseDomain);
	return new URL(stringUrl.replaceAll(urlObj.hostname, firmlyHostname));
}
