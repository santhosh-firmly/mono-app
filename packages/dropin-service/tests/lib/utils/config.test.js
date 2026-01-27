import { describe, it, expect, beforeEach } from 'vitest';
import { config, buildDomainUrl } from '$lib/utils/config.js';

describe('config', () => {
	beforeEach(() => {
		config.appId = null;
		config.apiServer = null;
		config.domain = null;
	});

	describe('config object', () => {
		it('exports a config object with expected properties', () => {
			expect(config).toHaveProperty('appId');
			expect(config).toHaveProperty('apiServer');
			expect(config).toHaveProperty('telemetryServer');
			expect(config).toHaveProperty('ccServer');
			expect(config).toHaveProperty('domain');
			expect(config).toHaveProperty('browserId');
			expect(config).toHaveProperty('sessionId');
			expect(config).toHaveProperty('deviceId');
			expect(config).toHaveProperty('traceId');
			expect(config).toHaveProperty('isNewSessionId');
			expect(config).toHaveProperty('appVersion');
			expect(config).toHaveProperty('appName');
		});

		it('allows setting config values', () => {
			config.appId = 'test-app';
			config.apiServer = 'https://api.example.com';
			config.domain = 'example.com';

			expect(config.appId).toBe('test-app');
			expect(config.apiServer).toBe('https://api.example.com');
			expect(config.domain).toBe('example.com');
		});
	});

	describe('buildDomainUrl', () => {
		beforeEach(() => {
			config.apiServer = 'https://api.firmly.com';
			config.domain = 'test-store.com';
		});

		it('builds URL with config domain', () => {
			const url = buildDomainUrl('cart');
			expect(url).toBe('https://api.firmly.com/api/v1/domains/test-store.com/cart');
		});

		it('builds URL with custom domain override', () => {
			const url = buildDomainUrl('cart', 'custom-store.com');
			expect(url).toBe('https://api.firmly.com/api/v1/domains/custom-store.com/cart');
		});

		it('handles nested paths', () => {
			const url = buildDomainUrl('cart/line-items');
			expect(url).toBe(
				'https://api.firmly.com/api/v1/domains/test-store.com/cart/line-items'
			);
		});

		it('uses config domain when domain parameter is null', () => {
			const url = buildDomainUrl('orders', null);
			expect(url).toBe('https://api.firmly.com/api/v1/domains/test-store.com/orders');
		});
	});
});
