/**
 * Input Masking Utilities
 *
 * Functions to format and unformat input values for display and submission.
 */

/**
 * Formats a phone number for display.
 * @param {string} value - Raw phone number input
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for phone format
 * @returns {string} Formatted phone number
 */
export function phoneMask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		// Remove any non-digit characters from the input
		const digits = value.replace(/\D/g, '');

		// Handle different lengths of input progressively
		if (digits.length === 0) return '';
		if (digits.length === 1) return `(${digits}`;
		if (digits.length === 2) return `(${digits}`;
		if (digits.length === 3) return `(${digits})`;
		if (digits.length > 3 && digits.length < 6)
			return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
		if (digits.length >= 6 && digits.length < 10) {
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
		}

		// Handle 11 digits (with country code)
		if (digits.length >= 10) {
			const hasCountryCode = digits.length === 11;
			if (hasCountryCode) {
				return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
			}
			return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
		}

		return digits;
	}

	return value;
}

/**
 * Removes phone number formatting for submission.
 * @param {string} value - Formatted phone number
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for phone format
 * @returns {string} Raw digits only
 */
export function phoneUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}

/**
 * Formats a ZIP/postal code for display.
 * @param {string} value - Raw ZIP code input
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for ZIP format
 * @returns {string} Formatted ZIP code (e.g., 12345-1234)
 */
export function zipCodeMask(value, { locale = 'en-US' } = {}) {
	// example: 12345-1234, 12345
	if (locale === 'en-US') {
		const digits = value.replace(/\D/g, '');
		if (digits.length === 0) return '';
		if (digits.length <= 5) return digits;
		if (digits.length > 5) {
			return `${digits.slice(0, 5)}-${digits.slice(5)}`;
		}
		return digits;
	}

	return value;
}

/**
 * Removes ZIP code formatting for submission.
 * @param {string} value - Formatted ZIP code
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for ZIP format
 * @returns {string} Raw digits only
 */
export function zipCodeUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}

/**
 * Formats a credit card number for display (groups of 4).
 * @param {string} value - Raw card number input
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for card format
 * @returns {string} Formatted card number (e.g., 1234 5678 9012 3456)
 */
export function creditCardMask(value, { locale = 'en-US' } = {}) {
	// example: 1234, 1234 5678, 1234 5678 9012, 1234 5678 9012 3456
	if (locale === 'en-US') {
		const digits = value.replace(/\D/g, '');
		if (digits.length === 0) return '';

		// Split into groups of 4 and join with spaces
		const groups = digits.match(/.{1,4}/g) || [];
		return groups.join(' ');
	}
	return value;
}

/**
 * Removes credit card formatting for submission.
 * @param {string} value - Formatted card number
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for card format
 * @returns {string} Raw digits only
 */
export function creditCardUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}

/**
 * Formats an expiration date for display (MM / YY).
 * @param {string} value - Raw date input
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for date format
 * @returns {string} Formatted date (e.g., 12 / 28)
 */
export function monthYearMask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		const digits = value.replace(/\D/g, '');
		if (digits.length === 0) return '';
		if (digits.length <= 2) return digits;
		return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
	}

	return value;
}

/**
 * Removes expiration date formatting for submission.
 * @param {string} value - Formatted date
 * @param {Object} [options] - Mask options
 * @param {string} [options.locale='en-US'] - Locale for date format
 * @returns {string} Raw digits only (MMYY)
 */
export function monthYearUnmask(value, { locale = 'en-US' } = {}) {
	if (locale === 'en-US') {
		return value.replace(/\D/g, '');
	}

	return value;
}
