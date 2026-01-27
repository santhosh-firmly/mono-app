import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockBrowserFetch, createMockConfig } from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/browser-fetch.js', () => createMockBrowserFetch());
vi.mock('$lib/utils/config.js', () => ({
	config: createMockConfig({
		apiServer: 'https://api.firmly.com',
		domain: 'test-store.com'
	}),
	buildDomainUrl: vi.fn((endpoint, domain) => {
		const d = domain || 'test-store.com';
		return `https://${d}/api/${endpoint}`;
	})
}));

import { domainRequest, apiRequest } from '$lib/utils/api-client.js';
import { browserFetch } from '$lib/utils/browser-fetch.js';
import { buildDomainUrl } from '$lib/utils/config.js';

describe('api-client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		browserFetch.mockResolvedValue({ status: 200, data: { success: true } });
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('domainRequest', () => {
		it('makes GET request by default', async () => {
			await domainRequest('cart', 'store.com');

			expect(buildDomainUrl).toHaveBeenCalledWith('cart', 'store.com');
			expect(browserFetch).toHaveBeenCalledWith(
				'https://store.com/api/cart',
				expect.objectContaining({
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});

		it('uses default domain when not provided', async () => {
			await domainRequest('cart');

			expect(buildDomainUrl).toHaveBeenCalledWith('cart', undefined);
		});

		it('makes POST request with body', async () => {
			const body = { quantity: 2 };

			await domainRequest('cart/line-items', 'store.com', {
				method: 'POST',
				body
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://store.com/api/cart/line-items',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(body),
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});

		it('uses custom headers when provided', async () => {
			const customHeaders = {
				'Content-Type': 'application/json',
				Authorization: 'Bearer token123'
			};

			await domainRequest('cart', 'store.com', {
				headers: customHeaders
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://store.com/api/cart',
				expect.objectContaining({
					headers: customHeaders
				})
			);
		});

		it('returns response from browserFetch', async () => {
			const mockResponse = { status: 200, data: { items: [] } };
			browserFetch.mockResolvedValueOnce(mockResponse);

			const result = await domainRequest('cart', 'store.com');

			expect(result).toEqual(mockResponse);
		});

		it('handles DELETE request', async () => {
			await domainRequest('cart/line-items/123', 'store.com', {
				method: 'DELETE'
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://store.com/api/cart/line-items/123',
				expect.objectContaining({
					method: 'DELETE'
				})
			);
		});

		it('handles PUT request with body', async () => {
			const body = { quantity: 5 };

			await domainRequest('cart/line-items/123', 'store.com', {
				method: 'PUT',
				body
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://store.com/api/cart/line-items/123',
				expect.objectContaining({
					method: 'PUT',
					body: JSON.stringify(body)
				})
			);
		});

		it('does not add body to request when not provided', async () => {
			await domainRequest('cart', 'store.com', {
				method: 'GET'
			});

			const callArgs = browserFetch.mock.calls[0][1];
			expect(callArgs.body).toBeUndefined();
		});
	});

	describe('apiRequest', () => {
		it('makes GET request by default', async () => {
			await apiRequest('/api/v1/attribution');

			expect(browserFetch).toHaveBeenCalledWith(
				'https://api.firmly.com/api/v1/attribution',
				expect.objectContaining({
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});

		it('makes POST request with body', async () => {
			const body = { event: 'page_view' };

			await apiRequest('/api/v1/telemetry', {
				method: 'POST',
				body
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://api.firmly.com/api/v1/telemetry',
				expect.objectContaining({
					method: 'POST',
					body: JSON.stringify(body),
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});

		it('uses custom headers when provided', async () => {
			const customHeaders = {
				'Content-Type': 'application/json',
				'X-Custom-Header': 'custom-value'
			};

			await apiRequest('/api/v1/data', {
				headers: customHeaders
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://api.firmly.com/api/v1/data',
				expect.objectContaining({
					headers: customHeaders
				})
			);
		});

		it('returns response from browserFetch', async () => {
			const mockResponse = { status: 201, data: { id: '123' } };
			browserFetch.mockResolvedValueOnce(mockResponse);

			const result = await apiRequest('/api/v1/orders', { method: 'POST', body: {} });

			expect(result).toEqual(mockResponse);
		});

		it('handles error responses', async () => {
			const errorResponse = { status: 500, data: { error: 'Internal server error' } };
			browserFetch.mockResolvedValueOnce(errorResponse);

			const result = await apiRequest('/api/v1/data');

			expect(result).toEqual(errorResponse);
		});

		it('does not add body to request when not provided', async () => {
			await apiRequest('/api/v1/data', { method: 'GET' });

			const callArgs = browserFetch.mock.calls[0][1];
			expect(callArgs.body).toBeUndefined();
		});

		it('handles PATCH request with body', async () => {
			const body = { name: 'Updated' };

			await apiRequest('/api/v1/users/123', {
				method: 'PATCH',
				body
			});

			expect(browserFetch).toHaveBeenCalledWith(
				'https://api.firmly.com/api/v1/users/123',
				expect.objectContaining({
					method: 'PATCH',
					body: JSON.stringify(body)
				})
			);
		});
	});
});
