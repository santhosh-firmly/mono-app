import { describe, it, expect } from 'vitest';
import { convertToFirmlyDomain, updateUrlWithFirmlyDomain } from '$lib/utils/domain-utils.js';

describe('domain-utils', () => {
	const apertureBaseDomain = 'firmly.com';

	describe('convertToFirmlyDomain', () => {
		it('strips www prefix from hostname', () => {
			expect(convertToFirmlyDomain('www.example.com', apertureBaseDomain)).toBe(
				'example.firmly.com'
			);
		});

		it('handles special case for test.victoriassecret.com', () => {
			expect(convertToFirmlyDomain('test.victoriassecret.com', apertureBaseDomain)).toBe(
				'test-victoriassecret.firmly.com'
			);
		});

		it('converts myshopify.com domain to aperture base domain', () => {
			expect(convertToFirmlyDomain('mystore.myshopify.com', apertureBaseDomain)).toBe(
				'mystore.firmly.com'
			);
		});

		it('converts standard domain to aperture base domain', () => {
			expect(convertToFirmlyDomain('example.com', apertureBaseDomain)).toBe(
				'example.firmly.com'
			);
		});

		it('handles domain with subdomain', () => {
			expect(convertToFirmlyDomain('shop.example.com', apertureBaseDomain)).toBe(
				'shop.firmly.com'
			);
		});

		it('handles domain with multiple subdomains', () => {
			expect(convertToFirmlyDomain('dev.shop.example.com', apertureBaseDomain)).toBe(
				'dev.firmly.com'
			);
		});

		it('handles single-part domain', () => {
			expect(convertToFirmlyDomain('localhost', apertureBaseDomain)).toBe(
				'localhost.firmly.com'
			);
		});
	});

	describe('updateUrlWithFirmlyDomain', () => {
		it('converts URL hostname to Firmly domain', () => {
			const url = new URL('https://example.com/path');
			const result = updateUrlWithFirmlyDomain(url, apertureBaseDomain);
			expect(result.hostname).toBe('example.firmly.com');
		});

		it('preserves URL path', () => {
			const url = new URL('https://example.com/checkout/cart');
			const result = updateUrlWithFirmlyDomain(url, apertureBaseDomain);
			expect(result.pathname).toBe('/checkout/cart');
		});

		it('preserves URL query parameters', () => {
			const url = new URL('https://example.com/page?foo=bar&baz=qux');
			const result = updateUrlWithFirmlyDomain(url, apertureBaseDomain);
			expect(result.searchParams.get('foo')).toBe('bar');
			expect(result.searchParams.get('baz')).toBe('qux');
		});

		it('preserves URL protocol', () => {
			const httpUrl = new URL('http://example.com/page');
			const httpsUrl = new URL('https://example.com/page');

			expect(updateUrlWithFirmlyDomain(httpUrl, apertureBaseDomain).protocol).toBe('http:');
			expect(updateUrlWithFirmlyDomain(httpsUrl, apertureBaseDomain).protocol).toBe('https:');
		});

		it('preserves URL port if present', () => {
			const url = new URL('https://example.com:8080/page');
			const result = updateUrlWithFirmlyDomain(url, apertureBaseDomain);
			expect(result.port).toBe('8080');
		});

		it('returns a new URL object', () => {
			const url = new URL('https://example.com/page');
			const result = updateUrlWithFirmlyDomain(url, apertureBaseDomain);
			expect(result).not.toBe(url);
			expect(result).toBeInstanceOf(URL);
		});
	});
});
