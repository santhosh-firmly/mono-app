// @ts-nocheck
function getSLDomain(hostname) {
	if (hostname) {
		const split = hostname.split('.');
		if (split.length === 3) {
			return `.${split[1]}.${split[2]}`;
		}
		return hostname;
	}
	return hostname;
}

function getCurrency(c) {
	if (!c) {
		return `$\u00A0-`;
	}

	const symbol = c.currency === 'USD' ? '$' : c.currency;
	return `${symbol}\u00A0${c.value?.toFixed?.(2)}`;
}

export function formatCurrency(currencyObject) {
	if (typeof currencyObject?.value !== 'undefined') {
		const value = currencyObject?.value?.toFixed?.(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		return `$${value}`;
	}
}

/**
 * Extracts a nested URL from query parameters while preserving all its query parameters
 * @param {string} fullUrl - The complete URL containing nested query parameters
 * @param {string} paramName - The name of the query parameter containing the nested URL
 * @returns {string|null} - The extracted URL with all its query parameters, or null if not found
 */
export function getNestedUrlParam(fullUrl, paramName = 'url') {
	try {
		const questionMarkIndex = fullUrl.indexOf('?');
		if (questionMarkIndex === -1) return null;

		const queryString = fullUrl.substring(questionMarkIndex + 1);
		const paramPrefix = `${paramName}=`;
		const paramIndex = queryString.indexOf(paramPrefix);

		if (paramIndex === -1) return null;

		// Check if this is actually the start of our parameter
		if (paramIndex > 0 && queryString[paramIndex - 1] !== '&') {
			return null;
		}

		// Extract the URL parameter value
		let urlValue = queryString.substring(paramIndex + paramPrefix.length);

		// Check if the URL looks encoded (starts with http%3A or https%3A)
		const isEncoded = urlValue.startsWith('http%3A') || urlValue.startsWith('https%3A');

		if (isEncoded) {
			// For encoded URLs, find the next unencoded parameter separator
			const nextParamIndex = urlValue.indexOf('&');
			if (nextParamIndex !== -1) {
				urlValue = urlValue.substring(0, nextParamIndex);
			}
			return decodeURIComponent(urlValue);
		} else {
			// For unencoded URLs, take everything (assuming it's the last parameter)
			// This handles the legacy case where the URL is not properly encoded
			return urlValue;
		}
	} catch (error) {
		console.error('Error extracting nested URL:', error);
		return null;
	}
}
