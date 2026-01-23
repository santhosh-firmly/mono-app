import { describe, it, expect } from 'vitest';
import {
	phoneMask,
	phoneUnmask,
	zipCodeMask,
	zipCodeUnmask,
	creditCardMask,
	creditCardUnmask,
	monthYearMask,
	monthYearUnmask
} from '$lib/utils/masks.js';

describe('masks', () => {
	describe('phoneMask', () => {
		it('returns empty string for empty input', () => {
			expect(phoneMask('')).toBe('');
		});

		it('formats progressively as digits are added', () => {
			expect(phoneMask('1')).toBe('(1');
			expect(phoneMask('12')).toBe('(12');
			expect(phoneMask('123')).toBe('(123)');
			expect(phoneMask('1234')).toBe('(123) 4');
			expect(phoneMask('12345')).toBe('(123) 45');
			expect(phoneMask('123456')).toBe('(123) 456-');
			expect(phoneMask('1234567')).toBe('(123) 456-7');
			expect(phoneMask('12345678')).toBe('(123) 456-78');
			expect(phoneMask('123456789')).toBe('(123) 456-789');
		});

		it('formats 10-digit phone as (XXX) XXX-XXXX', () => {
			expect(phoneMask('1234567890')).toBe('(123) 456-7890');
		});

		it('formats 11-digit phone with country code', () => {
			expect(phoneMask('11234567890')).toBe('+1 (123) 456-7890');
		});

		it('strips non-digit characters from input', () => {
			expect(phoneMask('(123) 456-7890')).toBe('(123) 456-7890');
			expect(phoneMask('123-456-7890')).toBe('(123) 456-7890');
			expect(phoneMask('123.456.7890')).toBe('(123) 456-7890');
		});

		it('returns original value for non-US locale', () => {
			expect(phoneMask('+44 20 7123 4567', { locale: 'en-GB' })).toBe('+44 20 7123 4567');
		});
	});

	describe('phoneUnmask', () => {
		it('extracts digits from formatted phone', () => {
			expect(phoneUnmask('(123) 456-7890')).toBe('1234567890');
		});

		it('extracts digits including country code', () => {
			expect(phoneUnmask('+1 (123) 456-7890')).toBe('11234567890');
		});

		it('returns empty string for empty input', () => {
			expect(phoneUnmask('')).toBe('');
		});

		it('returns original value for non-US locale', () => {
			expect(phoneUnmask('+44 20 7123 4567', { locale: 'en-GB' })).toBe('+44 20 7123 4567');
		});
	});

	describe('zipCodeMask', () => {
		it('returns empty string for empty input', () => {
			expect(zipCodeMask('')).toBe('');
		});

		it('returns digits as-is for 1-5 digits', () => {
			expect(zipCodeMask('1')).toBe('1');
			expect(zipCodeMask('12')).toBe('12');
			expect(zipCodeMask('123')).toBe('123');
			expect(zipCodeMask('1234')).toBe('1234');
			expect(zipCodeMask('12345')).toBe('12345');
		});

		it('formats 6+ digits as XXXXX-XXXX', () => {
			expect(zipCodeMask('123456')).toBe('12345-6');
			expect(zipCodeMask('123456789')).toBe('12345-6789');
		});

		it('strips non-digit characters from input', () => {
			expect(zipCodeMask('12345-6789')).toBe('12345-6789');
		});

		it('returns original value for non-US locale', () => {
			expect(zipCodeMask('SW1A 1AA', { locale: 'en-GB' })).toBe('SW1A 1AA');
		});
	});

	describe('zipCodeUnmask', () => {
		it('extracts digits from formatted ZIP', () => {
			expect(zipCodeUnmask('12345-6789')).toBe('123456789');
			expect(zipCodeUnmask('12345')).toBe('12345');
		});

		it('returns empty string for empty input', () => {
			expect(zipCodeUnmask('')).toBe('');
		});

		it('returns original value for non-US locale', () => {
			expect(zipCodeUnmask('SW1A 1AA', { locale: 'en-GB' })).toBe('SW1A 1AA');
		});
	});

	describe('creditCardMask', () => {
		it('returns empty string for empty input', () => {
			expect(creditCardMask('')).toBe('');
		});

		it('formats digits in groups of 4', () => {
			expect(creditCardMask('1234')).toBe('1234');
			expect(creditCardMask('12345678')).toBe('1234 5678');
			expect(creditCardMask('123456789012')).toBe('1234 5678 9012');
			expect(creditCardMask('1234567890123456')).toBe('1234 5678 9012 3456');
		});

		it('handles 15-digit card (Amex)', () => {
			expect(creditCardMask('378282246310005')).toBe('3782 8224 6310 005');
		});

		it('strips non-digit characters from input', () => {
			expect(creditCardMask('1234 5678 9012 3456')).toBe('1234 5678 9012 3456');
			expect(creditCardMask('1234-5678-9012-3456')).toBe('1234 5678 9012 3456');
		});

		it('returns original value for non-US locale', () => {
			expect(creditCardMask('1234 5678 9012 3456', { locale: 'en-GB' })).toBe(
				'1234 5678 9012 3456'
			);
		});
	});

	describe('creditCardUnmask', () => {
		it('extracts digits from formatted card', () => {
			expect(creditCardUnmask('1234 5678 9012 3456')).toBe('1234567890123456');
		});

		it('returns empty string for empty input', () => {
			expect(creditCardUnmask('')).toBe('');
		});

		it('returns original value for non-US locale', () => {
			expect(creditCardUnmask('1234 5678 9012 3456', { locale: 'en-GB' })).toBe(
				'1234 5678 9012 3456'
			);
		});
	});

	describe('monthYearMask', () => {
		it('returns empty string for empty input', () => {
			expect(monthYearMask('')).toBe('');
		});

		it('returns digits as-is for 1-2 digits', () => {
			expect(monthYearMask('1')).toBe('1');
			expect(monthYearMask('12')).toBe('12');
		});

		it('formats 3+ digits as MM / YY', () => {
			expect(monthYearMask('123')).toBe('12 / 3');
			expect(monthYearMask('1234')).toBe('12 / 34');
		});

		it('strips non-digit characters from input', () => {
			expect(monthYearMask('12 / 34')).toBe('12 / 34');
			expect(monthYearMask('12/34')).toBe('12 / 34');
		});

		it('returns original value for non-US locale', () => {
			expect(monthYearMask('12/34', { locale: 'en-GB' })).toBe('12/34');
		});
	});

	describe('monthYearUnmask', () => {
		it('extracts digits from formatted date', () => {
			expect(monthYearUnmask('12 / 34')).toBe('1234');
			expect(monthYearUnmask('12/34')).toBe('1234');
		});

		it('returns empty string for empty input', () => {
			expect(monthYearUnmask('')).toBe('');
		});

		it('returns original value for non-US locale', () => {
			expect(monthYearUnmask('12/34', { locale: 'en-GB' })).toBe('12/34');
		});
	});
});
