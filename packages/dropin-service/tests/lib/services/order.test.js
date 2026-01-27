import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createMockConfig,
	createMockJWE,
	createMockBrowserSession,
	createMockCart
} from '../__mock__/mock-factories.js';

vi.mock('$lib/utils/config', () => ({
	config: createMockConfig({
		ccServer: 'https://cc.test.com',
		apiServer: 'https://api.test.com'
	})
}));
vi.mock('$lib/utils/jwe', () => createMockJWE());
vi.mock('$lib/services/browser-session', () => createMockBrowserSession());
vi.mock('$lib/services/cart', () => createMockCart());

import {
	placeOrderWithCreditCard,
	placeOrderWithSavedCard,
	placeOrderWithPayPal,
	placeOrderWithC2P
} from '$lib/services/order.js';
import { cartSavedPaymentCompleteOrder } from '$lib/services/cart';

describe('order service', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	describe('placeOrderWithCreditCard', () => {
		const creditCard = {
			number: '4111111111111111',
			expMonth: '12',
			expYear: '25',
			cvv: '123'
		};
		const billingInfo = {
			first_name: 'John',
			last_name: 'Doe',
			email: 'john@example.com',
			phone: '+15551234567',
			address1: '123 Main St',
			city: 'Seattle',
			state_or_province: 'WA',
			country: 'US',
			postal_code: '98101'
		};

		it('places order successfully with new credit card', async () => {
			// First call: fetch payment key, second call: complete order
			global.fetch
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ kid: 'key-123', kty: 'RSA' })
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () =>
						Promise.resolve({
							id: 'order_123',
							urls: { thank_you_page: 'https://example.com/thank-you' }
						})
				});

			const result = await placeOrderWithCreditCard('test.com', creditCard, billingInfo);

			expect(result.success).toBe(true);
			expect(result.order.id).toBe('order_123');
			expect(result.redirectUrl).toBe('https://example.com/thank-you');
		});

		it('returns error when order fails', async () => {
			global.fetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ description: 'Card declined' })
			});

			const result = await placeOrderWithCreditCard('test.com', creditCard, billingInfo);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Card declined');
		});

		it('returns default error when order fails without message', async () => {
			global.fetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({})
			});

			const result = await placeOrderWithCreditCard('test.com', creditCard, billingInfo);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to place order');
		});

		it('handles network errors', async () => {
			global.fetch.mockRejectedValueOnce(new Error('Network error'));

			const result = await placeOrderWithCreditCard('test.com', creditCard, billingInfo);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Network error');
		});

		it('returns error when CC server is not configured', async () => {
			const { config } = await import('$lib/utils/config');
			const originalCcServer = config.ccServer;
			config.ccServer = null;
			config.apiServer = null;

			const result = await placeOrderWithCreditCard('test.com', creditCard, billingInfo);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Payment server not configured');

			config.ccServer = originalCcServer;
		});

		it('handles payment key fetch failure when response is not ok', async () => {
			// Reset modules to clear cached keys
			vi.resetModules();
			const { placeOrderWithCreditCard: freshPlaceOrder } =
				await import('$lib/services/order.js');

			global.fetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.resolve({})
			});

			const result = await freshPlaceOrder('test.com', creditCard, billingInfo);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Failed to fetch payment key');
		});

		it('handles payment key fetch failure when server not configured', async () => {
			const { config } = await import('$lib/utils/config');
			const originalCcServer = config.ccServer;
			const originalApiServer = config.apiServer;
			config.ccServer = null;
			config.apiServer = null;

			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ kid: 'key-123', kty: 'RSA' })
			});

			const result = await placeOrderWithCreditCard('test.com', creditCard, billingInfo);

			expect(result.success).toBe(false);
			expect(result.error).toBe('Payment server not configured');

			config.ccServer = originalCcServer;
			config.apiServer = originalApiServer;
		});
	});

	describe('placeOrderWithSavedCard', () => {
		it('places order successfully with saved card', async () => {
			cartSavedPaymentCompleteOrder.mockResolvedValue({
				status: 200,
				data: {
					id: 'order_456',
					urls: { thank_you_page: 'https://example.com/thank-you' }
				}
			});

			const result = await placeOrderWithSavedCard('test.com', 'card_123');

			expect(result.success).toBe(true);
			expect(result.order.id).toBe('order_456');
			expect(result.redirectUrl).toBe('https://example.com/thank-you');
		});

		it('returns error when order fails', async () => {
			cartSavedPaymentCompleteOrder.mockResolvedValue({
				status: 400,
				data: { description: 'Card expired' }
			});

			const result = await placeOrderWithSavedCard('test.com', 'card_123');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Card expired');
		});

		it('handles unexpected errors', async () => {
			cartSavedPaymentCompleteOrder.mockRejectedValue(new Error('Connection timeout'));

			const result = await placeOrderWithSavedCard('test.com', 'card_123');

			expect(result.success).toBe(false);
			expect(result.error).toBe('Connection timeout');
		});
	});

	describe('placeOrderWithPayPal', () => {
		it('places order successfully with PayPal', async () => {
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						id: 'order_789',
						urls: { thank_you_page: 'https://example.com/thank-you' }
					})
			});

			const result = await placeOrderWithPayPal('test.com');

			expect(result.success).toBe(true);
			expect(result.order.id).toBe('order_789');
		});

		it('returns error when PayPal order fails', async () => {
			global.fetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ description: 'PayPal error' })
			});

			const result = await placeOrderWithPayPal('test.com');

			expect(result.success).toBe(false);
			expect(result.error).toBe('PayPal error');
		});

		it('handles network errors', async () => {
			global.fetch.mockRejectedValueOnce(new Error('PayPal connection failed'));

			const result = await placeOrderWithPayPal('test.com');

			expect(result.success).toBe(false);
			expect(result.error).toBe('PayPal connection failed');
		});
	});

	describe('placeOrderWithC2P', () => {
		const c2pData = {
			wallet: 'mastercard',
			credit_card_id: 'c2p_card_123'
		};

		it('places order successfully with Click-to-Pay', async () => {
			global.fetch.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						id: 'order_c2p',
						urls: { thank_you_page: 'https://example.com/thank-you' }
					})
			});

			const result = await placeOrderWithC2P('test.com', c2pData);

			expect(result.success).toBe(true);
			expect(result.order.id).toBe('order_c2p');
		});

		it('returns error when C2P order fails', async () => {
			global.fetch.mockResolvedValueOnce({
				ok: false,
				json: () => Promise.resolve({ description: 'C2P authentication failed' })
			});

			const result = await placeOrderWithC2P('test.com', c2pData);

			expect(result.success).toBe(false);
			expect(result.error).toBe('C2P authentication failed');
		});

		it('handles network errors', async () => {
			global.fetch.mockRejectedValueOnce(new Error('C2P service unavailable'));

			const result = await placeOrderWithC2P('test.com', c2pData);

			expect(result.success).toBe(false);
			expect(result.error).toBe('C2P service unavailable');
		});
	});
});
