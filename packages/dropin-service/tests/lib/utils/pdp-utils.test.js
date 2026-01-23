import { describe, it, expect, vi } from 'vitest';
import {
	buildPdpIframeUrl,
	hasMultipleVariants,
	getFirstAvailableVariant,
	extractMerchantDomain,
	shouldBypassCatalogApi
} from '$lib/utils/pdp-utils.js';

describe('pdp-utils', () => {
	describe('buildPdpIframeUrl', () => {
		it('converts merchant domain to Firmly domain', () => {
			const result = buildPdpIframeUrl('https://store.myshopify.com/products/item');

			expect(result).toBe('https://store.firmly.ai/products/item');
		});

		it('uses custom aperture domain', () => {
			const result = buildPdpIframeUrl(
				'https://store.myshopify.com/products/item',
				'custom.ai'
			);

			expect(result).toBe('https://store.custom.ai/products/item');
		});

		it('preserves query parameters', () => {
			const result = buildPdpIframeUrl(
				'https://store.myshopify.com/products/item?variant=123'
			);

			expect(result).toBe('https://store.firmly.ai/products/item?variant=123');
		});

		it('returns original URL for invalid URL', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const result = buildPdpIframeUrl('not-a-valid-url');

			expect(result).toBe('not-a-valid-url');
			consoleSpy.mockRestore();
		});
	});

	describe('hasMultipleVariants', () => {
		it('returns true when product has more than one variant', () => {
			const product = {
				variants: [
					{ sku: 'SKU1', available: true },
					{ sku: 'SKU2', available: true }
				]
			};

			expect(hasMultipleVariants(product)).toBe(true);
		});

		it('returns false when product has one variant', () => {
			const product = {
				variants: [{ sku: 'SKU1', available: true }]
			};

			expect(hasMultipleVariants(product)).toBe(false);
		});

		it('returns false when product has no variants', () => {
			const product = { variants: [] };

			expect(hasMultipleVariants(product)).toBe(false);
		});

		it('returns false when productDetails is null', () => {
			expect(hasMultipleVariants(null)).toBe(false);
		});

		it('returns false when variants is undefined', () => {
			expect(hasMultipleVariants({})).toBe(false);
		});
	});

	describe('getFirstAvailableVariant', () => {
		it('returns first available variant', () => {
			const product = {
				variants: [
					{ sku: 'SKU1', available: false },
					{ sku: 'SKU2', available: true },
					{ sku: 'SKU3', available: true }
				]
			};

			const result = getFirstAvailableVariant(product);

			expect(result).toEqual({ sku: 'SKU2', available: true });
		});

		it('returns null when no variants are available', () => {
			const product = {
				variants: [
					{ sku: 'SKU1', available: false },
					{ sku: 'SKU2', available: false }
				]
			};

			expect(getFirstAvailableVariant(product)).toBe(null);
		});

		it('returns null when variants is empty', () => {
			expect(getFirstAvailableVariant({ variants: [] })).toBe(null);
		});

		it('returns null when productDetails is null', () => {
			expect(getFirstAvailableVariant(null)).toBe(null);
		});

		it('returns null when variants is undefined', () => {
			expect(getFirstAvailableVariant({})).toBe(null);
		});
	});

	describe('extractMerchantDomain', () => {
		it('extracts domain from URL', () => {
			expect(extractMerchantDomain('https://store.example.com/products/item')).toBe(
				'store.example.com'
			);
		});

		it('removes www prefix', () => {
			expect(extractMerchantDomain('https://www.example.com/products')).toBe('example.com');
		});

		it('handles URL with port', () => {
			expect(extractMerchantDomain('https://example.com:8080/products')).toBe('example.com');
		});

		it('returns null for invalid URL', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			expect(extractMerchantDomain('not-a-url')).toBe(null);
			consoleSpy.mockRestore();
		});
	});

	describe('shouldBypassCatalogApi', () => {
		it('returns true when domain is in bypass list', () => {
			const bypassList = ['special-store.com', 'another-store.com'];

			expect(
				shouldBypassCatalogApi('https://special-store.com/products/item', bypassList)
			).toBe(true);
		});

		it('returns false when domain is not in bypass list', () => {
			const bypassList = ['special-store.com'];

			expect(
				shouldBypassCatalogApi('https://regular-store.com/products/item', bypassList)
			).toBe(false);
		});

		it('returns false for empty bypass list', () => {
			expect(shouldBypassCatalogApi('https://store.com/products/item', [])).toBe(false);
		});

		it('returns false when bypass list is not provided', () => {
			expect(shouldBypassCatalogApi('https://store.com/products/item')).toBe(false);
		});

		it('returns false for invalid URL', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			expect(shouldBypassCatalogApi('not-a-url', ['store.com'])).toBe(false);
			consoleSpy.mockRestore();
		});
	});
});
