import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockDomainRequest, createMockGetHeaders } from '../__mock__/mock-factories.js';
import {
	cartSessionTransfer,
	cartGetCart,
	cartAddLineItem,
	cartUpdateSku,
	cartClear,
	getSessionCart
} from '$lib/services/cart.js';

vi.mock('$lib/utils/api-client', () => ({
	domainRequest: createMockDomainRequest()
}));

vi.mock('$lib/utils/message-transport', () => ({
	postUpdateCart: vi.fn()
}));

vi.mock('$lib/services/browser-session', () => ({
	getHeaders: createMockGetHeaders()
}));

import { domainRequest } from '$lib/utils/api-client';
import { postUpdateCart } from '$lib/utils/message-transport';

describe('cart service - basic operations', () => {
	let mockSessionStorage;

	beforeEach(() => {
		mockSessionStorage = {
			data: {},
			getItem(key) {
				return this.data[key] || null;
			},
			setItem(key, value) {
				this.data[key] = value;
			},
			removeItem(key) {
				delete this.data[key];
			},
			clear() {
				this.data = {};
			}
		};

		global.sessionStorage = mockSessionStorage;
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
		delete global.sessionStorage;
	});

	describe('cartSessionTransfer', () => {
		it('should transfer cart session successfully', async () => {
			const transferData = { session_id: 'abc123', shop_id: 'shop1' };
			const responseData = { id: '789', platform_id: 'shopify', shop_id: 'shop1' };

			domainRequest.mockResolvedValue({
				status: 200,
				data: responseData
			});

			const result = await cartSessionTransfer(transferData, 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('session/transfer', 'test.com', {
				method: 'POST',
				body: transferData,
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.status).toBe(200);
			expect(result.data).toEqual(responseData);
			expect(getSessionCart()).toEqual(responseData);
		});

		it('should not set session cart on failure', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Invalid session' }
			});

			await cartSessionTransfer({ session_id: 'bad' }, 'test.com');

			expect(getSessionCart()).toBeNull();
		});
	});

	describe('cartGetCart', () => {
		it('should get cart for domain', async () => {
			const cartData = { id: '123', line_items: [] };

			domainRequest.mockResolvedValue({
				status: 200,
				data: cartData
			});

			const result = await cartGetCart('test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart', 'test.com', {
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(cartData);
		});
	});

	describe('cartAddLineItem', () => {
		it('should add line item to cart', async () => {
			const cartData = { id: '123', line_items: [{ sku: 'ABC', quantity: 2 }] };

			domainRequest.mockResolvedValue({
				status: 200,
				data: cartData
			});

			const result = await cartAddLineItem('ABC', 2, [], 'test.com', false);

			expect(domainRequest).toHaveBeenCalledWith(
				'cart/line-items/ABC/quantity/2?flush_cart=false',
				'test.com',
				{
					method: 'POST',
					body: { variant_handles: [] },
					headers: { 'Content-Type': 'application/json' }
				}
			);
			expect(result.data).toEqual(cartData);
			expect(getSessionCart()).toEqual(cartData);
			expect(postUpdateCart).toHaveBeenCalled();
		});

		it('should add line item with flush cart', async () => {
			domainRequest.mockResolvedValue({
				status: 200,
				data: { id: '456' }
			});

			await cartAddLineItem('XYZ', 1, [], 'test.com', true);

			expect(domainRequest).toHaveBeenCalledWith(
				expect.stringContaining('flush_cart=true'),
				'test.com',
				expect.any(Object)
			);
		});

		it('should add line item with variant handles', async () => {
			domainRequest.mockResolvedValue({
				status: 200,
				data: { id: '789' }
			});

			const variantHandles = ['size:large', 'color:red'];
			await cartAddLineItem('SKU123', 3, variantHandles, 'test.com');

			expect(domainRequest).toHaveBeenCalledWith(
				expect.any(String),
				'test.com',
				expect.objectContaining({
					body: { variant_handles: variantHandles }
				})
			);
		});

		it('should not set session cart on failure', async () => {
			domainRequest.mockResolvedValue({
				status: 404,
				data: { error: 'Product not found' }
			});

			await cartAddLineItem('INVALID', 1, [], 'test.com');

			expect(getSessionCart()).toBeNull();
		});
	});

	describe('cartUpdateSku', () => {
		it('should update SKU quantity', async () => {
			const cartData = { id: '123', line_items: [{ sku: 'ABC', quantity: 5 }] };

			domainRequest.mockResolvedValue({
				status: 200,
				data: cartData
			});

			const result = await cartUpdateSku('ABC', 5, [], 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/line-items/ABC', 'test.com', {
				method: 'PUT',
				body: { quantity: 5, variant_handles: [] },
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(cartData);
			expect(getSessionCart()).toEqual(cartData);
		});

		it('should update SKU with variant handles', async () => {
			domainRequest.mockResolvedValue({
				status: 200,
				data: { id: '456' }
			});

			await cartUpdateSku('SKU456', 2, ['size:small'], 'test.com');

			expect(domainRequest).toHaveBeenCalledWith(
				expect.any(String),
				'test.com',
				expect.objectContaining({
					body: { quantity: 2, variant_handles: ['size:small'] }
				})
			);
		});
	});

	describe('cartClear', () => {
		it('should clear cart', async () => {
			const emptyCart = { id: '123', line_items: [] };

			domainRequest.mockResolvedValue({
				status: 200,
				data: emptyCart
			});

			const result = await cartClear('test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/line-items', 'test.com', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(emptyCart);
			expect(getSessionCart()).toEqual(emptyCart);
			expect(postUpdateCart).toHaveBeenCalled();
		});
	});

	describe('edge cases', () => {
		it('should not save cart when data is null', async () => {
			domainRequest.mockResolvedValue({
				status: 200,
				data: null
			});

			await cartSessionTransfer({}, 'test.com');
			expect(getSessionCart()).toBeNull();
		});

		it('should not save cart when cartUpdateSku fails', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Update failed' }
			});

			await cartUpdateSku('SKU', 1, [], 'test.com');
			expect(getSessionCart()).toBeNull();
		});

		it('should not save cart when cartClear fails', async () => {
			domainRequest.mockResolvedValue({
				status: 500,
				data: { error: 'Server error' }
			});

			await cartClear('test.com');
			expect(getSessionCart()).toBeNull();
		});
	});
});
