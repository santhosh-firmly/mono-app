import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushSync } from 'svelte';
import { createMockPayPal, createMockCheckoutState } from '../__mock__/mock-factories.js';

vi.mock('$lib/services/paypal.js', () => createMockPayPal());
vi.mock('$lib/states/checkout/index.svelte.js', () => createMockCheckoutState());

import { initializePayPal, getPayPal, resetPayPal } from '$lib/states/paypal.svelte.js';
import {
	loadPayPalSdk,
	renderPayPalButton,
	paypalStartOrder,
	paypalAuthorizePayment,
	paypalCompleteOrder
} from '$lib/services/paypal.js';
import { getCheckout } from '$lib/states/checkout/index.svelte.js';

describe('paypal state', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetPayPal();
	});

	describe('initialization', () => {
		it('should initialize PayPal instance', () => {
			const instance = initializePayPal();
			expect(instance).toBeDefined();
			expect(instance.initialized).toBe(false);
			expect(instance.isLoading).toBe(false);
		});

		it('should return existing instance with getPayPal', () => {
			const instance1 = initializePayPal();
			const instance2 = getPayPal();
			expect(instance1).toBe(instance2);
		});

		it('should throw error when getPayPal called before initialize', () => {
			resetPayPal();
			expect(() => getPayPal()).toThrow('PayPal not initialized');
		});

		it('should reset instance', () => {
			initializePayPal();
			resetPayPal();
			expect(() => getPayPal()).toThrow('PayPal not initialized');
		});
	});

	describe('initialize', () => {
		it('should load PayPal SDK successfully', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });

			const paypal = initializePayPal();
			await paypal.initialize({
				clientId: 'test-client-id',
				currency: 'USD'
			});

			flushSync();

			expect(loadPayPalSdk).toHaveBeenCalledWith({
				clientId: 'test-client-id',
				merchantId: undefined,
				currency: 'USD',
				intent: 'capture'
			});
			expect(paypal.initialized).toBe(true);
			expect(paypal.isLoading).toBe(false);
		});

		it('should not initialize if already initialized', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			loadPayPalSdk.mockClear();
			await paypal.initialize({ clientId: 'test2' });

			expect(loadPayPalSdk).not.toHaveBeenCalled();
		});

		it('should not initialize if already loading', async () => {
			loadPayPalSdk.mockImplementation(
				() => new Promise((resolve) => setTimeout(() => resolve({ Buttons: vi.fn() }), 100))
			);

			const paypal = initializePayPal();
			const promise1 = paypal.initialize({ clientId: 'test' });
			const promise2 = paypal.initialize({ clientId: 'test' });

			await Promise.all([promise1, promise2]);

			expect(loadPayPalSdk).toHaveBeenCalledTimes(1);
		});

		it('should not initialize without clientId', async () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			const paypal = initializePayPal();
			await paypal.initialize({});

			flushSync();

			expect(loadPayPalSdk).not.toHaveBeenCalled();
			expect(paypal.initialized).toBe(false);
			expect(consoleSpy).toHaveBeenCalledWith(
				'[PayPal]: No clientId provided, skipping initialization'
			);

			consoleSpy.mockRestore();
		});

		it('should handle SDK load error', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			loadPayPalSdk.mockRejectedValue(new Error('SDK load failed'));

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			flushSync();

			expect(paypal.initialized).toBe(false);
			expect(paypal.error).toBe('SDK load failed');
			expect(paypal.isLoading).toBe(false);

			consoleErrorSpy.mockRestore();
		});

		it('should use default currency and intent', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			expect(loadPayPalSdk).toHaveBeenCalledWith({
				clientId: 'test',
				merchantId: undefined,
				currency: 'USD',
				intent: 'capture'
			});
		});
	});

	describe('renderButton', () => {
		it('should not render button if not initialized', () => {
			const paypal = initializePayPal();
			const container = document.createElement('div');

			paypal.renderButton(container, vi.fn());

			expect(renderPayPalButton).not.toHaveBeenCalled();
		});

		it('should not render button without container', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			paypal.renderButton(null, vi.fn());

			expect(renderPayPalButton).not.toHaveBeenCalled();
		});

		it('should not render button if container not in DOM', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(false);

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, vi.fn());

			expect(renderPayPalButton).not.toHaveBeenCalled();
		});

		it('should render button successfully', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			const onSuccess = vi.fn();

			paypal.renderButton(container, onSuccess);

			expect(renderPayPalButton).toHaveBeenCalled();
		});

		it('should assign container ID if not present', async () => {
			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, vi.fn());

			expect(container.id).toBeTruthy();
		});
	});

	describe('completeOrder', () => {
		it('should throw error if not authorized', async () => {
			const paypal = initializePayPal();

			await expect(paypal.completeOrder()).rejects.toThrow('PayPal payment not authorized');
		});

		it('should complete order successfully', async () => {
			const mockCart = { id: 'cart-123', total: 100 };
			const mockCheckout = { domain: 'test.com', setCart: vi.fn() };

			getCheckout.mockReturnValue(mockCheckout);
			paypalCompleteOrder.mockResolvedValue({
				status: 200,
				data: mockCart
			});

			const paypal = initializePayPal();
			paypal.payerId = 'payer-123';
			paypal.paypalToken = 'token-456';
			paypal.isAuthorized = true;

			const result = await paypal.completeOrder();

			expect(paypalCompleteOrder).toHaveBeenCalledWith('payer-123', 'token-456', 'test.com');
			expect(mockCheckout.setCart).toHaveBeenCalledWith(mockCart);
			expect(result).toEqual(mockCart);
		});

		it('should handle complete order error', async () => {
			const mockCheckout = { domain: 'test.com', setCart: vi.fn() };

			getCheckout.mockReturnValue(mockCheckout);
			paypalCompleteOrder.mockResolvedValue({
				status: 400,
				data: { description: 'Payment failed' }
			});

			const paypal = initializePayPal();
			paypal.payerId = 'payer-123';
			paypal.paypalToken = 'token-456';
			paypal.isAuthorized = true;

			await expect(paypal.completeOrder()).rejects.toThrow('Payment failed');
			expect(paypal.error).toBe('Payment failed');
		});
	});

	describe('reset', () => {
		it('should reset PayPal state', () => {
			const paypal = initializePayPal();
			paypal.payerId = 'payer-123';
			paypal.paypalToken = 'token-456';
			paypal.isAuthorized = true;
			paypal.error = 'Some error';

			paypal.reset();

			flushSync();

			expect(paypal.paypalToken).toBeNull();
			expect(paypal.payerId).toBeNull();
			expect(paypal.isAuthorized).toBe(false);
			expect(paypal.error).toBe('');
		});
	});

	describe('private methods', () => {
		it('should handle create order', async () => {
			const mockCheckout = { domain: 'test.com' };
			const mockToken = 'token-123';

			getCheckout.mockReturnValue(mockCheckout);
			paypalStartOrder.mockResolvedValue({
				status: 200,
				data: {
					payment_method: {
						attributes: {
							paypal_token: mockToken
						}
					}
				}
			});

			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, vi.fn());

			const renderCall = renderPayPalButton.mock.calls[0];
			const callbacks = renderCall[1];

			const token = await callbacks.onCreateOrder();

			expect(paypalStartOrder).toHaveBeenCalledWith('test.com');
			expect(token).toBe(mockToken);
		});

		it('should handle approve', async () => {
			const mockCheckout = { domain: 'test.com', setCart: vi.fn() };
			const mockCart = { id: 'cart-123' };
			const onSuccess = vi.fn();

			getCheckout.mockReturnValue(mockCheckout);
			paypalAuthorizePayment.mockResolvedValue({
				status: 200,
				data: mockCart
			});

			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			paypal.paypalToken = 'token-123';
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, onSuccess);

			const renderCall = renderPayPalButton.mock.calls[0];
			const callbacks = renderCall[1];

			await callbacks.onApprove({ payerID: 'payer-456' });

			flushSync();

			expect(paypalAuthorizePayment).toHaveBeenCalledWith(
				'payer-456',
				'token-123',
				'test.com'
			);
			expect(mockCheckout.setCart).toHaveBeenCalledWith(mockCart);
			expect(onSuccess).toHaveBeenCalledWith(mockCart);
			expect(paypal.isAuthorized).toBe(true);
		});

		it('should handle cancel', async () => {
			const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, vi.fn());

			const renderCall = renderPayPalButton.mock.calls[0];
			const callbacks = renderCall[1];

			callbacks.onCancel();

			expect(consoleSpy).toHaveBeenCalledWith('[PayPal]: Payment cancelled by user');

			consoleSpy.mockRestore();
		});

		it('should handle error', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, vi.fn());

			const renderCall = renderPayPalButton.mock.calls[0];
			const callbacks = renderCall[1];

			callbacks.onError(new Error('PayPal error'));

			flushSync();

			expect(paypal.error).toBe('PayPal error');
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it('should handle approve error', async () => {
			const mockCheckout = { domain: 'test.com', setCart: vi.fn() };
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			getCheckout.mockReturnValue(mockCheckout);
			paypalAuthorizePayment.mockResolvedValue({
				status: 400,
				data: { description: 'Authorization failed' }
			});

			loadPayPalSdk.mockResolvedValue({ Buttons: vi.fn() });
			document.body.contains = vi.fn().mockReturnValue(true);

			const paypal = initializePayPal();
			paypal.paypalToken = 'token-123';
			await paypal.initialize({ clientId: 'test' });

			const container = document.createElement('div');
			paypal.renderButton(container, vi.fn());

			const renderCall = renderPayPalButton.mock.calls[0];
			const callbacks = renderCall[1];

			await callbacks.onApprove({ payerID: 'payer-456' });

			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});
	});
});
