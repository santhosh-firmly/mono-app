/**
 * Validation Utilities
 *
 * Form field validation functions with i18n error messages.
 * Each function throws an Error with a localized message on invalid input.
 */

import { string } from 'superstruct';
import * as m from '$lib/paraglide/messages';

/**
 * Validates a full name (first and last name required).
 * @param {string} value - The name to validate
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isValidName(value) {
	const Name = string();
	if (!value) {
		throw new Error(m.validation_name_required());
	}
	const parts = value.trim().split(/\s+/);
	if (parts.length < 2) {
		throw new Error(m.validation_name_first_last());
	}
	try {
		Name.assert(parts[0]);
		Name.assert(parts[parts.length - 1]);
		return true;
	} catch {
		throw new Error(m.validation_name_invalid());
	}
}

/**
 * Validates an email address format.
 * @param {string} value - The email to validate
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isValidEmail(value) {
	const Email = string();
	if (!value) {
		throw new Error(m.validation_email_required());
	}
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(value)) {
		throw new Error(m.validation_email_invalid());
	}
	try {
		Email.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_email_string());
	}
}

/**
 * Validates a phone number based on locale.
 * @param {string} value - The phone number to validate
 * @param {Object} [options] - Validation options
 * @param {string} [options.locale='en-US'] - Locale for phone format
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isValidPhone(value, { locale = 'en-US' } = {}) {
	const Phone = string();
	if (!value) {
		throw new Error(m.validation_phone_required());
	}
	let phoneRegex;
	if (locale === 'en-US') {
		phoneRegex = /^(\+?1)?\s*\(?([0-9]{3})\)?\s?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/;
	} else {
		phoneRegex = /^\+?[1-9]\d{1,14}$/;
	}
	if (!phoneRegex.test(value)) {
		throw new Error(m.validation_phone_format());
	}
	try {
		Phone.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_phone_string());
	}
}

/**
 * Validates a ZIP/postal code based on locale.
 * @param {string} value - The ZIP code to validate
 * @param {Object} [options] - Validation options
 * @param {string} [options.locale='en-US'] - Locale for ZIP format
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isValidZipCode(value, { locale = 'en-US' } = {}) {
	const ZipCode = string();
	if (!value) {
		throw new Error(m.validation_zip_required());
	}

	// Remove any non-digit characters
	const digits = value.replace(/\D/g, '');

	if (locale === 'en-US') {
		// Check if digits length is either 5 or 9
		if (digits.length !== 5 && digits.length !== 9) {
			throw new Error(m.validation_zip_format());
		}
	} else {
		// For non-US, require exactly 5 digits
		if (digits.length !== 5) {
			throw new Error(m.validation_zip_format());
		}
	}

	try {
		ZipCode.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_zip_string());
	}
}

/**
 * Validates that a field is not empty.
 * @param {string} value - The value to check
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if empty
 */
export function isRequired(value) {
	if (!value) {
		throw new Error(m.validation_field_required());
	}
	return true;
}

/**
 * Validates a street address format.
 * @param {string} value - The address to validate
 * @param {Object} [options] - Validation options
 * @param {string} [options.locale='en-US'] - Locale for address format
 * @param {boolean} [options.isOptional=false] - Skip validation if empty
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isAddress(value, { locale = 'en-US', isOptional = false } = {}) {
	const Address = string();
	if (isOptional && !value) {
		return true;
	}
	if (!value) {
		throw new Error(m.validation_address_required());
	}
	let addressRegex;
	if (locale === 'en-US') {
		addressRegex = /^[0-9a-zA-Z\s,.'-]{3,}$/;
	} else {
		addressRegex = /^[0-9a-zA-Z\s,.'-]{3,}$/;
	}
	if (!addressRegex.test(value)) {
		throw new Error(m.validation_address_format());
	}
	try {
		Address.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_address_string());
	}
}

/**
 * Validates a credit card number format (13-19 digits).
 * @param {string} value - The card number to validate
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isValidCreditCard(value) {
	const CreditCard = string();
	const digits = value.replace(/\D/g, '');

	if (!digits) {
		throw new Error(m.validation_card_required());
	}

	// Credit cards are between 13-19 digits
	if (digits.length < 13 || digits.length > 19) {
		throw new Error(m.validation_card_format());
	}

	try {
		CreditCard.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_card_string());
	}
}

/**
 * Validates a card expiration date (MM/YY format).
 * @param {string} value - The expiration date to validate
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid or expired
 */
export function isValidExpirationDate(value) {
	const ExpirationDate = string();
	if (!value) {
		throw new Error(m.validation_expiration_date_required());
	}

	// Remove any non-digits
	const digits = value.replace(/\D/g, '');

	if (digits.length !== 4) {
		throw new Error(m.validation_expiration_date_format());
	}

	const month = parseInt(digits.substring(0, 2), 10);
	const year = parseInt(digits.substring(2), 10);

	if (isNaN(month) || isNaN(year)) {
		throw new Error(m.validation_expiration_date_invalid());
	}

	if (month < 1 || month > 12) {
		throw new Error(m.validation_expiration_date_invalid());
	}

	const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of year
	if (year < currentYear) {
		throw new Error(m.validation_expiration_date_invalid());
	}

	try {
		ExpirationDate.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_expiration_date_string());
	}
}

/**
 * Validates a card CVC/CVV code (3-4 digits).
 * @param {string} value - The CVC to validate
 * @returns {boolean} True if valid
 * @throws {Error} Localized error message if invalid
 */
export function isValidCVC(value) {
	const CVC = string();
	if (!value) {
		throw new Error(m.validation_cvc_required());
	}
	if (value.length < 3 || value.length > 4) {
		throw new Error(m.validation_cvc_format());
	}
	try {
		CVC.assert(value);
		return true;
	} catch {
		throw new Error(m.validation_cvc_string());
	}
}
