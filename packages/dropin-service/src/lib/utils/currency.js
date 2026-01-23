/**
 * Currency Formatting Utilities
 *
 * Pure utility functions for formatting currency values.
 * No state, no side effects.
 *
 * @module currency
 */

/**
 * Format a number as currency
 *
 * @param {number} value - The value to format
 * @param {string} [currency='USD'] - Currency code (ISO 4217)
 * @param {string} [locale='en-US'] - Locale for formatting
 * @returns {string} Formatted currency string
 *
 * @example
 * toCurrency(99.99); // "$99.99"
 * toCurrency(1234.56, 'EUR', 'de-DE'); // "1.234,56 €"
 */
export function toCurrency(value, currency = 'USD', locale = 'en-US') {
	if (value === null || value === undefined || isNaN(value)) {
		return toCurrency(0, currency, locale);
	}

	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);
}

/**
 * Parse currency string to number
 *
 * @param {string} currencyString - Currency string to parse
 * @param {string} [locale='en-US'] - Locale used for parsing
 * @returns {number} Parsed number
 *
 * @example
 * parseCurrency("$99.99"); // 99.99
 */
export function parseCurrency(currencyString, locale = 'en-US') {
	if (!currencyString) return 0;

	// Remove currency symbols and parse
	const cleaned = currencyString.replace(/[^0-9.,-]/g, '');

	// Handle different decimal separators based on locale
	if (locale.startsWith('de') || locale.startsWith('fr')) {
		// European format: 1.234,56
		return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
	}

	// US format: 1,234.56
	return parseFloat(cleaned.replace(/,/g, ''));
}
