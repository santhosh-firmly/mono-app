import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/paraglide/messages', () => ({
	validation_name_required: () => 'Name is required',
	validation_name_first_last: () => 'Please enter first and last name',
	validation_name_invalid: () => 'Invalid name',
	validation_email_required: () => 'Email is required',
	validation_email_invalid: () => 'Invalid email format',
	validation_email_string: () => 'Email must be a string',
	validation_phone_required: () => 'Phone is required',
	validation_phone_format: () => 'Invalid phone format',
	validation_phone_string: () => 'Phone must be a string',
	validation_zip_required: () => 'ZIP code is required',
	validation_zip_format: () => 'Invalid ZIP code format',
	validation_zip_string: () => 'ZIP code must be a string',
	validation_field_required: () => 'This field is required',
	validation_address_required: () => 'Address is required',
	validation_address_format: () => 'Invalid address format',
	validation_address_string: () => 'Address must be a string',
	validation_card_required: () => 'Card number is required',
	validation_card_format: () => 'Invalid card number',
	validation_card_string: () => 'Card must be a string',
	validation_expiration_date_required: () => 'Expiration date is required',
	validation_expiration_date_format: () => 'Invalid expiration date format',
	validation_expiration_date_invalid: () => 'Invalid expiration date',
	validation_expiration_date_string: () => 'Expiration date must be a string',
	validation_cvc_required: () => 'CVC is required',
	validation_cvc_format: () => 'Invalid CVC format',
	validation_cvc_string: () => 'CVC must be a string'
}));

import {
	isValidName,
	isValidEmail,
	isValidPhone,
	isValidZipCode,
	isRequired,
	isAddress,
	isValidCreditCard,
	isValidExpirationDate,
	isValidCVC
} from '$lib/utils/validations.js';

describe('validations', () => {
	describe('isValidName', () => {
		it('accepts full name with first and last', () => {
			expect(isValidName('John Doe')).toBe(true);
		});

		it('accepts name with multiple parts', () => {
			expect(isValidName('Maria José Silva')).toBe(true);
			expect(isValidName('John Michael Smith Jr')).toBe(true);
		});

		it('trims and handles extra whitespace', () => {
			expect(isValidName('  John   Doe  ')).toBe(true);
		});

		it('rejects empty value', () => {
			expect(() => isValidName('')).toThrow('Name is required');
			expect(() => isValidName(null)).toThrow('Name is required');
			expect(() => isValidName(undefined)).toThrow('Name is required');
		});

		it('rejects single word name', () => {
			expect(() => isValidName('John')).toThrow('Please enter first and last name');
		});

		it('rejects non-string types', () => {
			expect(() => isValidName(12345)).toThrow();
			expect(() => isValidName({ name: 'John Doe' })).toThrow();
		});
	});

	describe('isValidEmail', () => {
		it('accepts valid email addresses', () => {
			expect(isValidEmail('user@example.com')).toBe(true);
			expect(isValidEmail('test.user@example.com')).toBe(true);
		});

		it('accepts email with subdomain', () => {
			expect(isValidEmail('user@mail.example.com')).toBe(true);
		});

		it('accepts email with plus addressing', () => {
			expect(isValidEmail('user+tag@example.com')).toBe(true);
		});

		it('rejects empty value', () => {
			expect(() => isValidEmail('')).toThrow('Email is required');
			expect(() => isValidEmail(null)).toThrow('Email is required');
		});

		it('rejects email without @ symbol', () => {
			expect(() => isValidEmail('userexample.com')).toThrow('Invalid email format');
		});

		it('rejects email without domain', () => {
			expect(() => isValidEmail('user@')).toThrow('Invalid email format');
		});

		it('rejects email without TLD', () => {
			expect(() => isValidEmail('user@example')).toThrow('Invalid email format');
		});

		it('rejects non-string types', () => {
			expect(() => isValidEmail(12345)).toThrow();
			expect(() => isValidEmail(['test@example.com'])).toThrow();
		});
	});

	describe('isValidPhone', () => {
		it('accepts 10-digit US phone number', () => {
			expect(isValidPhone('1234567890')).toBe(true);
		});

		it('accepts formatted US phone number', () => {
			expect(isValidPhone('(123)456-7890')).toBe(true);
			expect(isValidPhone('123-456-7890')).toBe(true);
			expect(isValidPhone('123.456.7890')).toBe(true);
		});

		it('accepts phone with country code', () => {
			expect(isValidPhone('+1(123)456-7890')).toBe(true);
			expect(isValidPhone('1(123)456-7890')).toBe(true);
		});

		it('rejects empty value', () => {
			expect(() => isValidPhone('')).toThrow('Phone is required');
			expect(() => isValidPhone(null)).toThrow('Phone is required');
		});

		it('rejects phone with too few digits', () => {
			expect(() => isValidPhone('123456789')).toThrow('Invalid phone format');
		});

		it('accepts international format for non-US locale', () => {
			expect(isValidPhone('+442071234567', { locale: 'en-GB' })).toBe(true);
		});

		it('rejects non-string types', () => {
			expect(() => isValidPhone(1234567890)).toThrow();
			expect(() => isValidPhone(['1234567890'])).toThrow();
		});
	});

	describe('isValidZipCode', () => {
		it('accepts 5-digit US ZIP code', () => {
			expect(isValidZipCode('12345')).toBe(true);
		});

		it('accepts 9-digit ZIP+4 code', () => {
			expect(isValidZipCode('123456789')).toBe(true);
			expect(isValidZipCode('12345-6789')).toBe(true);
		});

		it('rejects empty value', () => {
			expect(() => isValidZipCode('')).toThrow('ZIP code is required');
			expect(() => isValidZipCode(null)).toThrow('ZIP code is required');
		});

		it('rejects ZIP with wrong digit count', () => {
			expect(() => isValidZipCode('1234')).toThrow('Invalid ZIP code format');
			expect(() => isValidZipCode('123456')).toThrow('Invalid ZIP code format');
		});

		it('requires exactly 5 digits for non-US locale', () => {
			expect(isValidZipCode('12345', { locale: 'en-GB' })).toBe(true);
			expect(() => isValidZipCode('123456789', { locale: 'en-GB' })).toThrow(
				'Invalid ZIP code format'
			);
		});

		it('rejects non-string types', () => {
			expect(() => isValidZipCode(12345)).toThrow();
			expect(() => isValidZipCode(['12345'])).toThrow();
		});
	});

	describe('isRequired', () => {
		it('accepts non-empty string', () => {
			expect(isRequired('value')).toBe(true);
		});

		it('accepts truthy values', () => {
			expect(isRequired('0')).toBe(true);
			expect(isRequired('false')).toBe(true);
		});

		it('rejects empty string', () => {
			expect(() => isRequired('')).toThrow('This field is required');
		});

		it('rejects null and undefined', () => {
			expect(() => isRequired(null)).toThrow('This field is required');
			expect(() => isRequired(undefined)).toThrow('This field is required');
		});
	});

	describe('isAddress', () => {
		it('accepts valid address', () => {
			expect(isAddress('123 Main St')).toBe(true);
			expect(isAddress('456 Oak Avenue, Apt 7')).toBe(true);
		});

		it('accepts address with special characters', () => {
			expect(isAddress("123 O'Brien St")).toBe(true);
			expect(isAddress('456 Smith-Jones Rd')).toBe(true);
		});

		it('returns true for empty value when optional', () => {
			expect(isAddress('', { isOptional: true })).toBe(true);
			expect(isAddress(null, { isOptional: true })).toBe(true);
		});

		it('rejects empty value when required', () => {
			expect(() => isAddress('')).toThrow('Address is required');
			expect(() => isAddress(null)).toThrow('Address is required');
		});

		it('rejects address that is too short', () => {
			expect(() => isAddress('AB')).toThrow('Invalid address format');
		});

		it('accepts address for non-US locale', () => {
			expect(isAddress('10 Downing Street', { locale: 'en-GB' })).toBe(true);
		});

		it('rejects non-string types', () => {
			expect(() => isAddress(123)).toThrow();
			expect(() => isAddress(['123 Main St'])).toThrow();
		});
	});

	describe('isValidCreditCard', () => {
		it('accepts 16-digit card number', () => {
			expect(isValidCreditCard('4111111111111111')).toBe(true);
		});

		it('accepts 15-digit card number (Amex)', () => {
			expect(isValidCreditCard('378282246310005')).toBe(true);
		});

		it('accepts 13-digit card number', () => {
			expect(isValidCreditCard('4222222222222')).toBe(true);
		});

		it('accepts formatted card number with spaces', () => {
			expect(isValidCreditCard('4111 1111 1111 1111')).toBe(true);
		});

		it('accepts formatted card number with dashes', () => {
			expect(isValidCreditCard('4111-1111-1111-1111')).toBe(true);
		});

		it('rejects card with no digits', () => {
			expect(() => isValidCreditCard('')).toThrow('Card number is required');
			expect(() => isValidCreditCard('abcd')).toThrow('Card number is required');
		});

		it('rejects card with too few digits', () => {
			expect(() => isValidCreditCard('123456789012')).toThrow('Invalid card number');
		});

		it('rejects card with too many digits', () => {
			expect(() => isValidCreditCard('12345678901234567890')).toThrow('Invalid card number');
		});

		it('rejects non-string types', () => {
			expect(() => isValidCreditCard(4111111111111111)).toThrow();
			expect(() => isValidCreditCard(['4111111111111111'])).toThrow();
		});
	});

	describe('isValidExpirationDate', () => {
		it('accepts valid future expiration date', () => {
			const futureYear = (new Date().getFullYear() % 100) + 1;
			expect(isValidExpirationDate(`12${futureYear}`)).toBe(true);
			expect(isValidExpirationDate(`12 / ${futureYear}`)).toBe(true);
		});

		it('accepts current year with valid month', () => {
			const currentYear = new Date().getFullYear() % 100;
			const currentMonth = new Date().getMonth() + 1;
			const validMonth = String(currentMonth).padStart(2, '0');
			expect(isValidExpirationDate(`${validMonth}${currentYear}`)).toBe(true);
		});

		it('rejects empty value', () => {
			expect(() => isValidExpirationDate('')).toThrow('Expiration date is required');
			expect(() => isValidExpirationDate(null)).toThrow('Expiration date is required');
		});

		it('rejects invalid month', () => {
			const futureYear = (new Date().getFullYear() % 100) + 1;
			expect(() => isValidExpirationDate(`00${futureYear}`)).toThrow(
				'Invalid expiration date'
			);
			expect(() => isValidExpirationDate(`13${futureYear}`)).toThrow(
				'Invalid expiration date'
			);
		});

		it('rejects past year', () => {
			const pastYear = (new Date().getFullYear() % 100) - 1;
			expect(() => isValidExpirationDate(`12${pastYear}`)).toThrow('Invalid expiration date');
		});

		it('rejects wrong digit count', () => {
			expect(() => isValidExpirationDate('123')).toThrow('Invalid expiration date format');
			expect(() => isValidExpirationDate('12345')).toThrow('Invalid expiration date format');
		});

		it('rejects non-string types', () => {
			expect(() => isValidExpirationDate(1234)).toThrow();
			expect(() => isValidExpirationDate(['1234'])).toThrow();
		});
	});

	describe('isValidCVC', () => {
		it('accepts 3-digit CVC', () => {
			expect(isValidCVC('123')).toBe(true);
		});

		it('accepts 4-digit CVC (Amex)', () => {
			expect(isValidCVC('1234')).toBe(true);
		});

		it('rejects empty value', () => {
			expect(() => isValidCVC('')).toThrow('CVC is required');
			expect(() => isValidCVC(null)).toThrow('CVC is required');
		});

		it('rejects CVC with less than 3 digits', () => {
			expect(() => isValidCVC('12')).toThrow('Invalid CVC format');
		});

		it('rejects CVC with more than 4 digits', () => {
			expect(() => isValidCVC('12345')).toThrow('Invalid CVC format');
		});

		it('rejects non-string types', () => {
			expect(() => isValidCVC(123)).toThrow();
			expect(() => isValidCVC(['123'])).toThrow();
		});
	});
});
