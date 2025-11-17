import { describe, it, expect } from 'vitest';
import { convertToFirmlyDomain, updateUrlWithFirmlyDomain } from './domain-utils.js';

describe('convertToFirmlyDomain', () => {
	it('should convert regular domains', () => {
		expect(convertToFirmlyDomain('example.com', 'firmly.in')).toBe('example.firmly.in');
		expect(convertToFirmlyDomain('example.com', 'firmlyaperture.net')).toBe(
			'example.firmlyaperture.net'
		);
		expect(convertToFirmlyDomain('example.com', 'firmlyaperture.com')).toBe(
			'example.firmlyaperture.com'
		);
	});

	it('should remove www prefix', () => {
		expect(convertToFirmlyDomain('www.example.com', 'firmly.in')).toBe('example.firmly.in');
	});

	it('should handle myshopify domains', () => {
		expect(convertToFirmlyDomain('store.myshopify.com', 'firmly.in')).toBe('store.firmly.in');
		expect(convertToFirmlyDomain('store.myshopify.com', 'firmlyaperture.net')).toBe(
			'store.firmlyaperture.net'
		);
	});

	it('should handle special cases', () => {
		expect(convertToFirmlyDomain('test.victoriassecret.com', 'firmly.in')).toBe(
			'test-victoriassecret.firmly.in'
		);
		expect(convertToFirmlyDomain('test.victoriassecret.com', 'firmlyaperture.com')).toBe(
			'test-victoriassecret.firmlyaperture.com'
		);
	});

	it('should handle subdomains', () => {
		expect(convertToFirmlyDomain('shop.example.com', 'firmly.in')).toBe('shop.firmly.in');
	});

	it('should handle single word domains', () => {
		expect(convertToFirmlyDomain('localhost', 'firmly.in')).toBe('localhost.firmly.in');
	});
});

describe('updateUrlWithFirmlyDomain', () => {
	it('should update URL hostname while preserving other properties', () => {
		const url = new URL('https://example.com:8080/path?param=value#section');
		const result = updateUrlWithFirmlyDomain(url, 'firmly.in');

		expect(result.hostname).toBe('example.firmly.in');
		expect(result.port).toBe('8080');
		expect(result.pathname).toBe('/path');
		expect(result.search).toBe('?param=value');
		expect(result.hash).toBe('#section');
		expect(result.protocol).toBe('https:');
	});

	it('should work with different base domains', () => {
		const url = new URL('https://store.myshopify.com/cart');
		const result = updateUrlWithFirmlyDomain(url, 'firmlyaperture.net');
		expect(result.hostname).toBe('store.firmlyaperture.net');
	});
});
