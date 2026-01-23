/**
 * UI state for locale and currency formatting.
 */

let locale = $state('en-US');
let currency = $state('USD');

/**
 * Formats a numeric value as currency based on current locale settings.
 * @param {number} value - The numeric value to format
 * @returns {string} Formatted currency string
 */
export function toCurrency(value) {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);
}

export function setLocale(newLocale) {
	locale = newLocale;
}

export function setCurrency(newCurrency) {
	currency = newCurrency;
}
