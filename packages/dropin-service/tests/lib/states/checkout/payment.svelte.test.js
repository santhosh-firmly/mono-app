import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { flushSync } from 'svelte';
import {
	createMockTelemetry,
	createMockCart,
	createMockPromoCode,
	createMockAddressAutocomplete,
	createMockMessageTransport,
	createMockValidationMessages,
	createMockOrder
} from '../../__mock__/mock-factories.js';

vi.mock('$lib/services/telemetry.js', () => createMockTelemetry());
vi.mock('$lib/services/cart.js', () => createMockCart());
vi.mock('$lib/services/promo-code.js', () => createMockPromoCode());
vi.mock('$lib/services/address-autocomplete.js', () => createMockAddressAutocomplete());
vi.mock('$lib/utils/message-transport.js', () => createMockMessageTransport());
vi.mock('$lib/services/order.js', () => createMockOrder());
vi.mock('$lib/paraglide/messages', () => createMockValidationMessages());

import { initializeCheckout, resetCheckout } from '$lib/states/checkout/index.svelte.js';
import { initializeBuyNow, resetBuyNow, getBuyNow } from '$lib/states/buy-now.svelte.js';
import { track } from '$lib/services/telemetry.js';
import { postCheckoutClosed, postOrderPlaced } from '$lib/utils/message-transport.js';
import {
	placeOrderWithCreditCard,
	placeOrderWithSavedCard,
	placeOrderWithPayPal,
	placeOrderWithC2P
} from '$lib/services/order.js';

describe('checkout state - payment and order', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		resetBuyNow();
		resetCheckout();
		initializeBuyNow();
	});

	afterEach(() => {
		resetCheckout();
		resetBuyNow();
	});

	describe('goBack', () => {
		it('navigates to pdp when productUrl is provided', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const buyNow = getBuyNow();

				checkout.goBack('https://example.com/product');
				flushSync();

				expect(buyNow.mode).toBe('pdp');
				expect(track).toHaveBeenCalledWith('checkout_back_clicked', 'ux');
			});
			cleanup();
		});

		it('closes checkout when no productUrl', () => {
			vi.useFakeTimers();
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const buyNow = getBuyNow();
				checkout.goBack(null);

				expect(buyNow.isLayoutActive).toBe(false);
				vi.advanceTimersByTime(100);
				expect(postCheckoutClosed).toHaveBeenCalledWith('test.com');
			});
			cleanup();
			vi.useRealTimers();
		});
	});

	describe('close', () => {
		it('posts checkout closed message after delay', () => {
			vi.useFakeTimers();
			vi.clearAllMocks();
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const buyNow = getBuyNow();
				buyNow.layoutTransitionTime = 50;
				checkout.close();

				expect(buyNow.isLayoutActive).toBe(false);
				expect(postCheckoutClosed).not.toHaveBeenCalled();
				vi.advanceTimersByTime(50);
				expect(postCheckoutClosed).toHaveBeenCalledWith('test.com');
			});
			cleanup();
			vi.useRealTimers();
		});
	});

	describe('placeOrder', () => {
		it('tracks place order event', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.placeOrder();

				expect(track).toHaveBeenCalledWith('place_order_clicked', 'ux', {
					paymentMethod: 'credit_card'
				});
			});
			cleanup();
		});

		it('returns error when form is not ready', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				const result = await checkout.placeOrder();

				expect(result.success).toBe(false);
				expect(checkout.placeOrderError).toContain('complete all required fields');
			});
			cleanup();
		});

		it('places order with PayPal', async () => {
			let testPromise;
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.selectedCardId = 'card123';
				flushSync();

				testPromise = checkout.placeOrder('paypal').then((result) => {
					expect(placeOrderWithPayPal).toHaveBeenCalledWith('test.com');
					expect(result.success).toBe(true);
					expect(checkout.orderResult).toEqual({ id: 'order789' });
					expect(postOrderPlaced).toHaveBeenCalled();
				});
			});
			await testPromise;
			cleanup();
		});

		it('places order with saved credit card', async () => {
			let testPromise;
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [{ id: 'card123', last4: '1234' }];
				checkout.selectedCardId = 'card123';
				flushSync();

				testPromise = checkout.placeOrder().then((result) => {
					expect(placeOrderWithSavedCard).toHaveBeenCalledWith('test.com', 'card123');
					expect(result.success).toBe(true);
				});
			});
			await testPromise;
			cleanup();
		});

		it('places order with C2P card', async () => {
			let testPromise;
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{
						id: 'c2p123',
						pan: 'pan123',
						fromC2P: true,
						network: 'visa',
						art: 'https://example.com/card-art.png'
					}
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				testPromise = checkout.placeOrder().then((result) => {
					expect(placeOrderWithC2P).toHaveBeenCalledWith(
						'test.com',
						{
							wallet: 'visa',
							credit_card_id: 'c2p123',
							card_art: 'https://example.com/card-art.png'
						},
						null
					);
					expect(result.success).toBe(true);
				});
			});
			await testPromise;
			cleanup();
		});

		it('places order with C2P card without art', async () => {
			let testPromise;
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ id: 'c2p123', pan: 'pan123', fromC2P: true, network: 'visa' }
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				testPromise = checkout.placeOrder().then((result) => {
					expect(placeOrderWithC2P).toHaveBeenCalledWith(
						'test.com',
						{
							wallet: 'visa',
							credit_card_id: 'c2p123',
							card_art: ''
						},
						null
					);
					expect(result.success).toBe(true);
				});
			});
			await testPromise;
			cleanup();
		});

		it('handles CVV required response from C2P order', async () => {
			placeOrderWithC2P.mockResolvedValueOnce({
				success: false,
				cvvRequired: true,
				cardId: 'c2p123'
			});

			let testPromise;
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{
						id: 'c2p123',
						pan: 'pan123',
						fromC2P: true,
						network: 'visa',
						art: 'https://example.com/card-art.png'
					}
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				testPromise = checkout.placeOrder().then((result) => {
					expect(result.success).toBe(false);
					expect(result.cvvRequired).toBe(true);
					expect(checkout.cvvRequired).toBe(true);
					expect(checkout.showPaymentCvvConfirmation).toBe(true);
				});
			});
			await testPromise;
			cleanup();
		});

		it('places C2P order with CVV when cvvValue is set', async () => {
			let testPromise;
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{
						id: 'c2p123',
						pan: 'pan123',
						fromC2P: true,
						network: 'visa',
						art: 'https://example.com/card-art.png'
					}
				];
				checkout.selectedCardId = 'c2p123';
				checkout.cvvValue = '123';
				flushSync();

				testPromise = checkout.placeOrder().then((result) => {
					expect(placeOrderWithC2P).toHaveBeenCalledWith(
						'test.com',
						{
							wallet: 'visa',
							credit_card_id: 'c2p123',
							card_art: 'https://example.com/card-art.png'
						},
						'123'
					);
					expect(result.success).toBe(true);
				});
			});
			await testPromise;
			cleanup();
		});

		it('submitCvv calls placeOrder with CVV value', async () => {
			placeOrderWithC2P.mockResolvedValueOnce({
				success: false,
				cvvRequired: true,
				cardId: 'c2p123'
			});
			placeOrderWithC2P.mockResolvedValueOnce({
				success: true,
				order: { id: 'order123' },
				redirectUrl: 'https://example.com/thank-you'
			});

			let testPromise;
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{
						id: 'c2p123',
						pan: 'pan123',
						fromC2P: true,
						network: 'visa',
						art: 'https://example.com/card-art.png'
					}
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				// First attempt - CVV required
				await checkout.placeOrder();
				expect(checkout.cvvRequired).toBe(true);

				// Set CVV and submit
				checkout.cvvValue = '456';
				flushSync();

				testPromise = checkout.submitCvv().then((result) => {
					expect(placeOrderWithC2P).toHaveBeenLastCalledWith(
						'test.com',
						{
							wallet: 'visa',
							credit_card_id: 'c2p123',
							card_art: 'https://example.com/card-art.png'
						},
						'456'
					);
					expect(result.success).toBe(true);
				});
			});
			await testPromise;
			cleanup();
		});

		it('clearCvv resets CVV state', async () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 } },
					domain: 'test.com'
				});

				// Set some CVV state
				checkout.cvvValue = '123';
				flushSync();
				expect(checkout.cvvValue).toBe('123');

				// Clear it
				checkout.clearCvv();
				flushSync();

				expect(checkout.cvvValue).toBe('');
				expect(checkout.cvvRequired).toBe(false);
				expect(checkout.cvvError).toBe('');
				expect(checkout.cvvLoading).toBe(false);
			});
			cleanup();
		});

		it('places order with new credit card using billing form', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms(
					{
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main',
						city: 'City',
						state_or_province: 'ST',
						postal_code: '12345',
						phone: '5551234567',
						email: 'test@example.com'
					},
					{
						first_name: 'Jane',
						last_name: 'Smith',
						address1: '456 Oak',
						city: 'Town',
						state_or_province: 'CA',
						postal_code: '54321',
						phone: '5559876543',
						email: 'billing@example.com'
					}
				);
				checkout.useBillingAddress = false;
				checkout.setPaymentFormData({
					number: '4111111111111111',
					expiration: '12/25',
					verificationCode: '123'
				});
				flushSync();

				const result = await checkout.placeOrder();

				expect(placeOrderWithCreditCard).toHaveBeenCalledWith(
					'test.com',
					{
						number: '4111111111111111',
						expMonth: '12',
						expYear: '25',
						cvv: '123'
					},
					expect.objectContaining({
						first_name: 'Jane',
						last_name: 'Smith',
						address1: '456 Oak',
						city: 'Town'
					})
				);
				expect(result.success).toBe(true);
			});
			cleanup();
		});

		it('places order with new credit card using shipping as billing', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.setPaymentFormData({
					number: '4111111111111111',
					expiration: '12/25',
					verificationCode: '123'
				});
				flushSync();

				await checkout.placeOrder();

				expect(placeOrderWithCreditCard).toHaveBeenCalledWith(
					'test.com',
					expect.any(Object),
					expect.objectContaining({
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main'
					})
				);
			});
			cleanup();
		});

		it('handles order placement failure', async () => {
			placeOrderWithSavedCard.mockResolvedValueOnce({
				success: false,
				error: 'Payment declined'
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [{ id: 'card123' }];
				checkout.selectedCardId = 'card123';
				flushSync();

				const result = await checkout.placeOrder();

				expect(result.success).toBe(false);
				expect(checkout.placeOrderError).toBe('Payment declined');
			});
			cleanup();
		});

		it('handles order placement exception', async () => {
			placeOrderWithSavedCard.mockRejectedValueOnce(new Error('Network error'));

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [{ id: 'card123' }];
				checkout.selectedCardId = 'card123';
				flushSync();

				const result = await checkout.placeOrder();

				expect(result.success).toBe(false);
				expect(checkout.placeOrderError).toContain('Network error');
			});
			cleanup();
		});

		it('returns error when no payment method is selected', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				flushSync();

				const result = await checkout.placeOrder();

				expect(result.success).toBe(false);
				expect(result.error).toContain('Please complete all required fields');
			});
			cleanup();
		});
	});

	describe('useFastCheckout', () => {
		it('tracks fast checkout event with method', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.useFastCheckout('apple_pay');

				expect(track).toHaveBeenCalledWith('fast_checkout_clicked', 'ux', {
					method: 'apple_pay'
				});
			});
			cleanup();
		});
	});

	describe('submitCvv', () => {
		it('returns error when CVV is too short', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.cvvValue = '12';
				flushSync();

				const result = await checkout.submitCvv();

				expect(result.success).toBe(false);
				expect(result.error).toBe('Please enter a valid CVV');
				expect(checkout.cvvError).toBe('Please enter a valid CVV');
			});
			cleanup();
		});

		it('sets cvvError when placeOrder fails without cvvRequired', async () => {
			placeOrderWithC2P.mockResolvedValueOnce({
				success: false,
				error: 'Card declined'
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ id: 'c2p123', pan: 'pan123', fromC2P: true, network: 'visa' }
				];
				checkout.selectedCardId = 'c2p123';
				checkout.cvvValue = '123';
				flushSync();

				const result = await checkout.submitCvv();

				expect(result.success).toBe(false);
				expect(checkout.cvvError).toBe('Card declined');
				expect(checkout.cvvLoading).toBe(false);
			});
			cleanup();
		});

		it('uses default error message when placeOrder fails without error', async () => {
			placeOrderWithC2P.mockResolvedValueOnce({
				success: false
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ id: 'c2p123', pan: 'pan123', fromC2P: true, network: 'visa' }
				];
				checkout.selectedCardId = 'c2p123';
				checkout.cvvValue = '123';
				flushSync();

				const result = await checkout.submitCvv();

				expect(result.success).toBe(false);
				expect(checkout.cvvError).toBe('CVV verification failed');
			});
			cleanup();
		});
	});

	describe('cancelCvvConfirmation', () => {
		it('clears CVV state and returns true', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.cvvValue = '123';
				checkout.setCvvRequired(true);
				flushSync();

				const result = checkout.cancelCvvConfirmation();

				expect(result).toBe(true);
				expect(checkout.cvvValue).toBe('');
				expect(checkout.cvvRequired).toBe(false);
			});
			cleanup();
		});
	});

	describe('cardRequiresCvv', () => {
		it('returns true for cards that previously required CVV', async () => {
			placeOrderWithC2P.mockResolvedValueOnce({
				success: false,
				cvvRequired: true
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ id: 'c2p123', pan: 'pan123', fromC2P: true, network: 'visa' }
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				await checkout.placeOrder();

				expect(checkout.cardRequiresCvv('c2p123')).toBe(true);
				expect(checkout.cardRequiresCvv('other-card')).toBe(false);
			});
			cleanup();
		});
	});

	describe('clearCvv with clearTracking', () => {
		it('clears cardsRequiringCvv when clearTracking is true', async () => {
			placeOrderWithC2P.mockResolvedValueOnce({
				success: false,
				cvvRequired: true
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ id: 'c2p123', pan: 'pan123', fromC2P: true, network: 'visa' }
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				await checkout.placeOrder();
				expect(checkout.cardRequiresCvv('c2p123')).toBe(true);

				checkout.clearCvv(true);
				flushSync();

				expect(checkout.cardRequiresCvv('c2p123')).toBe(false);
			});
			cleanup();
		});
	});

	describe('placeOrder uses card.provider when available', () => {
		it('uses provider as wallet when present on C2P card', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ id: 'c2p123', pan: 'pan123', fromC2P: true, provider: 'amex' }
				];
				checkout.selectedCardId = 'c2p123';
				flushSync();

				await checkout.placeOrder();

				expect(placeOrderWithC2P).toHaveBeenCalledWith(
					'test.com',
					{
						wallet: 'amex',
						credit_card_id: 'c2p123'
					},
					null
				);
			});
			cleanup();
		});

		it('uses pan as credit_card_id when id is missing', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [
					{ pan: 'pan456', fromC2P: true, network: 'discover' }
				];
				checkout.selectedCardId = 'pan456';
				flushSync();

				await checkout.placeOrder();

				expect(placeOrderWithC2P).toHaveBeenCalledWith(
					'test.com',
					{
						wallet: 'discover',
						credit_card_id: 'pan456'
					},
					null
				);
			});
			cleanup();
		});

		it('falls back to mastercard when no provider or network', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [{ id: 'c2p789', fromC2P: true }];
				checkout.selectedCardId = 'c2p789';
				flushSync();

				await checkout.placeOrder();

				expect(placeOrderWithC2P).toHaveBeenCalledWith(
					'test.com',
					{
						wallet: 'mastercard',
						credit_card_id: 'c2p789'
					},
					null
				);
			});
			cleanup();
		});
	});

	describe('placeOrder error handling', () => {
		it('uses default error message when result has no error', async () => {
			placeOrderWithSavedCard.mockResolvedValueOnce({
				success: false
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [{ id: 'card123' }];
				checkout.selectedCardId = 'card123';
				flushSync();

				const result = await checkout.placeOrder();

				expect(result.success).toBe(false);
				expect(checkout.placeOrderError).toBe('Failed to place order');
			});
			cleanup();
		});

		it('uses default error message when exception has no message', async () => {
			placeOrderWithSavedCard.mockRejectedValueOnce({});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { total: { value: 100 }, shipping_method: 'standard' },
					domain: 'test.com'
				});
				checkout.initializeForms({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main',
					city: 'City',
					state_or_province: 'ST',
					postal_code: '12345',
					phone: '5551234567',
					email: 'test@example.com'
				});
				checkout.useBillingAddress = true;
				checkout.storage.credit_cards = [{ id: 'card123' }];
				checkout.selectedCardId = 'card123';
				flushSync();

				const result = await checkout.placeOrder();

				expect(result.success).toBe(false);
				expect(checkout.placeOrderError).toBe('An unexpected error occurred');
			});
			cleanup();
		});
	});
});
