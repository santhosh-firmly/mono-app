import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockDomainRequest, createMockGetHeaders } from '../__mock__/mock-factories.js';
import {
	cartUpdateShippingInfo,
	cartUpdateDelivery,
	cartCompleteOrder,
	cartSavedPaymentCompleteOrder,
	getSessionCart
} from '$lib/services/cart.js';

vi.mock('$lib/utils/api-client', () => ({
	domainRequest: createMockDomainRequest()
}));

vi.mock('$lib/services/browser-session', () => ({
	getHeaders: createMockGetHeaders()
}));

import { domainRequest } from '$lib/utils/api-client';

describe('cart service - checkout operations', () => {
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

	describe('cartUpdateShippingInfo', () => {
		it('should update shipping information', async () => {
			const shippingData = {
				address: '123 Main St',
				city: 'Test City',
				zip: '12345'
			};
			const cartData = { id: '123', shipping_address: shippingData };

			domainRequest.mockResolvedValue({
				status: 200,
				data: cartData
			});

			const result = await cartUpdateShippingInfo(shippingData, 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/shipping-info', 'test.com', {
				method: 'POST',
				body: shippingData,
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(cartData);
			expect(getSessionCart()).toEqual(cartData);
		});
	});

	describe('cartUpdateDelivery', () => {
		it('should update delivery method', async () => {
			const cartData = { id: '123', shipping_method: 'express' };

			domainRequest.mockResolvedValue({
				status: 200,
				data: cartData
			});

			const result = await cartUpdateDelivery('express', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/shipping-method', 'test.com', {
				method: 'POST',
				body: { shipping_method: 'express' },
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(cartData);
			expect(getSessionCart()).toEqual(cartData);
		});
	});

	describe('cartCompleteOrder', () => {
		it('should complete order with payment token', async () => {
			const orderData = { id: 'order123', status: 'completed' };

			domainRequest.mockResolvedValue({
				status: 200,
				data: orderData
			});

			const result = await cartCompleteOrder('token123', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith('cart/complete-order', 'test.com', {
				method: 'POST',
				body: {
					payment_token: { id: 'token123' },
					vault_token: true
				},
				headers: { 'Content-Type': 'application/json' }
			});
			expect(result.data).toEqual(orderData);
			expect(getSessionCart()).toEqual(orderData);
		});
	});

	describe('cartSavedPaymentCompleteOrder', () => {
		it('should complete order with saved payment', async () => {
			const orderData = { id: 'order456', status: 'completed' };

			domainRequest.mockResolvedValue({
				status: 200,
				data: orderData
			});

			const result = await cartSavedPaymentCompleteOrder('payment123', 'test.com');

			expect(domainRequest).toHaveBeenCalledWith(
				'cart/complete-order-with-saved-payment',
				'test.com',
				{
					method: 'POST',
					body: { payment_id: 'payment123' },
					headers: { 'Content-Type': 'application/json' }
				}
			);
			expect(result.data).toEqual(orderData);
			expect(getSessionCart()).toEqual(orderData);
		});

		it('should not save cart on failure', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Payment failed' }
			});

			await cartSavedPaymentCompleteOrder('invalid', 'test.com');
			expect(getSessionCart()).toBeNull();
		});
	});

	describe('edge cases', () => {
		it('should not save cart when cartUpdateShippingInfo fails', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Invalid address' }
			});

			await cartUpdateShippingInfo({}, 'test.com');
			expect(getSessionCart()).toBeNull();
		});

		it('should not save cart when cartUpdateDelivery fails', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Invalid delivery method' }
			});

			await cartUpdateDelivery('invalid', 'test.com');
			expect(getSessionCart()).toBeNull();
		});

		it('should not save cart when cartCompleteOrder fails', async () => {
			domainRequest.mockResolvedValue({
				status: 400,
				data: { error: 'Payment declined' }
			});

			await cartCompleteOrder('token', 'test.com');
			expect(getSessionCart()).toBeNull();
		});
	});
});
