import { describe, it, expect } from 'vitest';
import { toCurrency, parseCurrency } from '$lib/utils/currency.js';

describe('currency', () => {
	describe('toCurrency', () => {
		it('formats number as USD by default', () => {
			expect(toCurrency(99.99)).toBe('$99.99');
		});

		it('formats zero value', () => {
			expect(toCurrency(0)).toBe('$0.00');
		});

		it('formats negative value', () => {
			expect(toCurrency(-50.0)).toBe('-$50.00');
		});

		it('formats large numbers with thousand separators', () => {
			expect(toCurrency(1234.56)).toBe('$1,234.56');
			expect(toCurrency(1000000)).toBe('$1,000,000.00');
		});

		it('formats small decimal values', () => {
			expect(toCurrency(0.01)).toBe('$0.01');
			expect(toCurrency(0.99)).toBe('$0.99');
		});

		it('returns $0.00 for null', () => {
			expect(toCurrency(null)).toBe('$0.00');
		});

		it('returns $0.00 for undefined', () => {
			expect(toCurrency(undefined)).toBe('$0.00');
		});

		it('returns $0.00 for NaN', () => {
			expect(toCurrency(NaN)).toBe('$0.00');
		});

		it('formats EUR currency', () => {
			const result = toCurrency(99.99, 'EUR', 'en-US');
			expect(result).toContain('99.99');
			expect(result).toContain('€');
		});

		it('formats with German locale', () => {
			const result = toCurrency(1234.56, 'EUR', 'de-DE');
			expect(result).toContain('1.234,56');
			expect(result).toContain('€');
		});

		it('formats GBP currency', () => {
			const result = toCurrency(99.99, 'GBP', 'en-GB');
			expect(result).toContain('99.99');
			expect(result).toContain('£');
		});
	});

	describe('parseCurrency', () => {
		it('parses USD formatted string', () => {
			expect(parseCurrency('$99.99')).toBe(99.99);
		});

		it('returns 0 for empty string', () => {
			expect(parseCurrency('')).toBe(0);
		});

		it('returns 0 for null', () => {
			expect(parseCurrency(null)).toBe(0);
		});

		it('returns 0 for undefined', () => {
			expect(parseCurrency(undefined)).toBe(0);
		});

		it('parses string with thousand separators', () => {
			expect(parseCurrency('$1,234.56')).toBe(1234.56);
			expect(parseCurrency('$1,000,000.00')).toBe(1000000);
		});

		it('parses European format with German locale', () => {
			expect(parseCurrency('1.234,56 €', 'de-DE')).toBe(1234.56);
		});

		it('parses European format with French locale', () => {
			expect(parseCurrency('1.234,56 €', 'fr-FR')).toBe(1234.56);
		});

		it('strips currency symbols', () => {
			expect(parseCurrency('€100.00')).toBe(100);
			expect(parseCurrency('£50.00')).toBe(50);
		});

		it('parses negative values', () => {
			expect(parseCurrency('-$50.00')).toBe(-50);
		});

		it('parses value without currency symbol', () => {
			expect(parseCurrency('123.45')).toBe(123.45);
		});
	});
});
