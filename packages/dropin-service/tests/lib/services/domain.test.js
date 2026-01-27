import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProductDetails } from '$lib/services/domain.js';

describe('domain service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	describe('fetchProductDetails', () => {
		const config = {
			apiServer: 'https://api.firmly.com',
			appId: 'app_123'
		};

		it('fetches product details successfully', async () => {
			const productData = {
				title: 'Test Product',
				variants: [{ sku: 'SKU123', available: true, price: 99.99 }],
				url: 'https://store.com/product'
			};

			global.fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(productData)
			});

			const result = await fetchProductDetails('https://store.com/product', config);

			expect(result).toEqual(productData);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/v1/domains-pdp?url='),
				expect.objectContaining({
					headers: { 'x-firmly-app-id': 'app_123' }
				})
			);
		});

		it('throws error when apiServer is missing', async () => {
			await expect(
				fetchProductDetails('https://store.com/product', { appId: 'app_123' })
			).rejects.toThrow('fetchProductDetails: config.apiServer required');
		});

		it('throws error when appId is missing', async () => {
			await expect(
				fetchProductDetails('https://store.com/product', {
					apiServer: 'https://api.firmly.com'
				})
			).rejects.toThrow('fetchProductDetails: config.appId required');
		});

		it('throws error when fetch fails', async () => {
			global.fetch.mockResolvedValue({
				ok: false,
				statusText: 'Not Found'
			});

			await expect(fetchProductDetails('https://store.com/product', config)).rejects.toThrow(
				'Failed to fetch product: Not Found'
			);
		});

		it('encodes product URL properly', async () => {
			global.fetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({})
			});

			await fetchProductDetails('https://store.com/product?variant=123&color=red', config);

			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining(
					encodeURIComponent('https://store.com/product?variant=123&color=red')
				),
				expect.any(Object)
			);
		});
	});
});
