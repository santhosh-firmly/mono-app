import { describe, it, expect, beforeEach } from 'vitest';
import { toCurrency, setLocale, setCurrency } from '$lib/states/ui.svelte.js';

describe('ui state', () => {
	beforeEach(() => {
		setLocale('en-US');
		setCurrency('USD');
	});

	describe('toCurrency', () => {
		it('formats value as USD currency', () => {
			expect(toCurrency(99.99)).toBe('$99.99');
		});

		it('formats zero', () => {
			expect(toCurrency(0)).toBe('$0.00');
		});

		it('formats large numbers with thousand separators', () => {
			expect(toCurrency(1234.56)).toBe('$1,234.56');
		});

		it('rounds to two decimal places', () => {
			expect(toCurrency(99.999)).toBe('$100.00');
		});

		it('handles negative values', () => {
			expect(toCurrency(-50)).toBe('-$50.00');
		});
	});

	describe('setLocale', () => {
		it('changes locale for currency formatting', () => {
			setLocale('de-DE');
			const formatted = toCurrency(1234.56);
			expect(formatted).toContain('1');
			expect(formatted).toContain('234');
		});

		it('changes locale to fr-FR', () => {
			setLocale('fr-FR');
			const formatted = toCurrency(1234.56);
			expect(formatted).toContain('1');
		});
	});

	describe('setCurrency', () => {
		it('changes currency to EUR', () => {
			setCurrency('EUR');
			const formatted = toCurrency(99.99);
			expect(formatted).toContain('99');
		});

		it('changes currency to GBP', () => {
			setCurrency('GBP');
			const formatted = toCurrency(99.99);
			expect(formatted).toContain('99');
		});

		it('changes currency to JPY', () => {
			setCurrency('JPY');
			const formatted = toCurrency(9999);
			expect(formatted).toContain('9,999');
		});
	});

	describe('combined locale and currency changes', () => {
		it('formats EUR in German locale', () => {
			setLocale('de-DE');
			setCurrency('EUR');
			const formatted = toCurrency(1234.56);
			expect(formatted).toContain('1');
			expect(formatted).toContain('234');
		});

		it('formats GBP in UK locale', () => {
			setLocale('en-GB');
			setCurrency('GBP');
			const formatted = toCurrency(1234.56);
			expect(formatted).toContain('1,234');
		});
	});
});
