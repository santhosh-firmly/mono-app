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

import {
	initializeCheckout,
	getCheckout,
	resetCheckout
} from '$lib/states/checkout/index.svelte.js';
import { initializeBuyNow, resetBuyNow } from '$lib/states/buy-now.svelte.js';

describe('checkout state - initialization', () => {
	beforeEach(() => {
		resetBuyNow();
		resetCheckout();
		initializeBuyNow();
	});

	afterEach(() => {
		resetCheckout();
		resetBuyNow();
	});

	describe('initializeCheckout', () => {
		it('creates checkout instance with default values', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				expect(checkout.storage).toEqual({ shipping_addresses: [], credit_cards: [] });
				expect(checkout.useBillingAddress).toBe(true);
				expect(checkout.emailAutofillDetected).toBe(false);
				expect(checkout.errors.shipping).toBe('');
				expect(checkout.selectedCardId).toBe(null);
				expect(checkout.domain).toBe('test.com');
			});
			cleanup();
		});

		it('initializes with cart data', () => {
			const cleanup = $effect.root(() => {
				const cartData = { total: { value: 100 }, line_items: [] };
				const checkout = initializeCheckout({
					cart: cartData,
					store: { logoUrl: 'https://example.com/logo.png' },
					domain: 'example.com'
				});

				expect(checkout.cart).toEqual(cartData);
				expect(checkout.store.logoUrl).toBe('https://example.com/logo.png');
				expect(checkout.domain).toBe('example.com');
			});
			cleanup();
		});
	});

	describe('getCheckout', () => {
		it('returns initialized checkout instance', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(getCheckout()).toBe(checkout);
			});
			cleanup();
		});

		it('throws when checkout not initialized', () => {
			expect(() => getCheckout()).toThrow('Checkout not initialized');
		});
	});

	describe('derived values', () => {
		it('calculates totalPrice from cart', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { total: { value: 150.5 } },
					domain: 'test.com'
				});

				expect(checkout.totalPrice).toBe(150.5);
			});
			cleanup();
		});

		it('returns 0 for totalPrice when cart is null', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(checkout.totalPrice).toBe(0);
			});
			cleanup();
		});

		it('calculates itemsQuantity from line_items', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: {
						line_items: [{ quantity: 2 }, { quantity: 3 }]
					},
					domain: 'test.com'
				});

				expect(checkout.itemsQuantity).toBe(5);
			});
			cleanup();
		});

		it('returns 0 for itemsQuantity when cart is null', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(checkout.itemsQuantity).toBe(0);
			});
			cleanup();
		});
	});

	describe('setCart', () => {
		it('updates cart data', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const newCart = { total: { value: 200 } };

				checkout.setCart(newCart);
				flushSync();

				expect(checkout.cart).toEqual(newCart);
			});
			cleanup();
		});
	});

	describe('setPending', () => {
		it('sets pending action state', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				checkout.setPending('UPDATE_LINE_ITEM', true);
				flushSync();

				expect(checkout.pending.UPDATE_LINE_ITEM).toBe(true);
				expect(checkout.isCartLoading).toBe(true);
			});
			cleanup();
		});

		it('clears pending action state', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				checkout.setPending('UPDATE_LINE_ITEM', true);
				flushSync();
				checkout.setPending('UPDATE_LINE_ITEM', false);
				flushSync();

				expect(checkout.pending.UPDATE_LINE_ITEM).toBe(false);
			});
			cleanup();
		});
	});

	describe('isCartLoading derived', () => {
		it.each([
			'ADD_PROMO_CODE',
			'REMOVE_ALL_CODES',
			'SET_SHIPPING_ADDRESS',
			'UPDATE_SHIPPING_METHOD'
		])('returns true when %s is pending', (action) => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setPending(action, true);
				flushSync();

				expect(checkout.isCartLoading).toBe(true);
			});
			cleanup();
		});

		it('returns false when no cart actions are pending', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				flushSync();

				expect(checkout.isCartLoading).toBeFalsy();
			});
			cleanup();
		});
	});

	describe('initializeForms', () => {
		it('creates shipping and billing forms', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms(
					{ email: 'test@example.com' },
					{ email: 'billing@example.com' }
				);

				expect(checkout.shippingForm).toBeTruthy();
				expect(checkout.billingForm).toBeTruthy();
				expect(checkout.shippingForm.email.value).toBe('test@example.com');
				expect(checkout.billingForm.email.value).toBe('billing@example.com');
			});
			cleanup();
		});
	});

	describe('addC2PCards', () => {
		it('adds Click-to-Pay cards to storage', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const cards = [
					{ id: '1', last4: '1234' },
					{ id: '2', last4: '5678' }
				];

				checkout.addC2PCards(cards);
				flushSync();

				expect(checkout.storage.credit_cards).toHaveLength(2);
				expect(checkout.storage.credit_cards[0].fromC2P).toBe(true);
			});
			cleanup();
		});

		it('does not modify storage when cards array is empty', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const originalStorage = { ...checkout.storage };

				checkout.addC2PCards([]);
				flushSync();

				expect(checkout.storage.credit_cards).toEqual(originalStorage.credit_cards);
			});
			cleanup();
		});
	});

	describe('address autocomplete initialization', () => {
		it('initializes shipping and billing autocomplete', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				expect(checkout.shippingAutocomplete).toBeTruthy();
				expect(checkout.billingAutocomplete).toBeTruthy();
				expect(checkout.shippingAutocomplete.completions).toEqual([]);
				expect(checkout.billingAutocomplete.completions).toEqual([]);
			});
			cleanup();
		});
	});

	describe('lineItems derived', () => {
		it('transforms cart line items for display', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: {
						line_items: [
							{
								sku: 'SKU123',
								image: { url: 'https://example.com/img.jpg' },
								description: 'Product Title',
								variant_description: 'Size M',
								line_price: { value: 29.99 },
								quantity: 2
							}
						]
					},
					domain: 'test.com'
				});

				expect(checkout.lineItems).toHaveLength(1);
				expect(checkout.lineItems[0]).toEqual({
					sku: 'SKU123',
					image: 'https://example.com/img.jpg',
					title: 'Product Title',
					description: 'Size M',
					price: 29.99,
					quantity: 2,
					variantHandles: undefined,
					pendingRemoval: false,
					originalIndex: 0
				});
			});
			cleanup();
		});

		it('returns empty array when cart is null', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(checkout.lineItems).toEqual([]);
			});
			cleanup();
		});
	});

	describe('selectedCard derived', () => {
		it('returns card matching selectedCardId', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.addC2PCards([
					{ id: 'card1', last4: '1234' },
					{ id: 'card2', last4: '5678' }
				]);
				checkout.selectedCardId = 'card2';
				flushSync();

				expect(checkout.selectedCard).toEqual({
					id: 'card2',
					last4: '5678',
					fromC2P: true
				});
			});
			cleanup();
		});

		it('returns card matching pan as selectedCardId', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.addC2PCards([{ id: 'card1', pan: '4111111111111111', last4: '1111' }]);
				checkout.selectedCardId = '4111111111111111';
				flushSync();

				expect(checkout.selectedCard?.last4).toBe('1111');
			});
			cleanup();
		});

		it('returns null when no card matches', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.selectedCardId = 'nonexistent';
				flushSync();

				expect(checkout.selectedCard).toBe(null);
			});
			cleanup();
		});
	});

	describe('hasStoredCards derived', () => {
		it('returns true when credit cards exist', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.addC2PCards([{ id: 'card1', last4: '1234' }]);
				flushSync();

				expect(checkout.hasStoredCards).toBe(true);
			});
			cleanup();
		});

		it('returns false when no credit cards', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(checkout.hasStoredCards).toBe(false);
			});
			cleanup();
		});
	});

	describe('canPlaceOrder derived', () => {
		it('returns false when shipping form is not filled', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({}, {});
				checkout.paymentFormFilled = true;
				flushSync();

				expect(checkout.canPlaceOrder).toBe(false);
			});
			cleanup();
		});

		it('returns false when payment is not ready', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms(
					{
						email: 'test@example.com',
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main St',
						city: 'Test City',
						state_or_province: 'CA',
						postal_code: '12345',
						phone: '1234567890'
					},
					{}
				);
				checkout.paymentFormFilled = false;
				checkout.selectedCardId = null;
				flushSync();

				expect(checkout.canPlaceOrder).toBe(false);
			});
			cleanup();
		});

		it('returns false when shipping address is pending', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms(
					{
						email: 'test@example.com',
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main St',
						city: 'Test City',
						state_or_province: 'CA',
						postal_code: '12345',
						phone: '1234567890'
					},
					{}
				);
				checkout.paymentFormFilled = true;
				checkout.setPending('SET_SHIPPING_ADDRESS', true);
				flushSync();

				expect(checkout.canPlaceOrder).toBe(false);
			});
			cleanup();
		});
	});

	describe('formatShippingAddress', () => {
		it('formats shipping address correctly', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = checkout.formatShippingAddress({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					address2: 'Apt 4',
					city: 'Test City',
					state_or_province: 'CA',
					postal_code: '12345'
				});

				expect(result).toBe('John Doe · 123 Main St · Apt 4 · Test City, CA 12345');
			});
			cleanup();
		});

		it('returns empty string for null info', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(checkout.formatShippingAddress(null)).toBe('');
			});
			cleanup();
		});

		it('filters out empty address2', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = checkout.formatShippingAddress({
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					address2: '',
					city: 'Test City',
					state_or_province: 'CA',
					postal_code: '12345'
				});

				expect(result).toBe('John Doe · 123 Main St · Test City, CA 12345');
			});
			cleanup();
		});
	});

	describe('syncEmailToCart', () => {
		it('syncs email from form to cart when valid', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { email: '' },
					domain: 'test.com'
				});
				checkout.initializeForms({ email: 'new@example.com' }, {});
				flushSync();

				checkout.syncEmailToCart();
				flushSync();

				expect(checkout.cart.email).toBe('new@example.com');
			});
			cleanup();
		});

		it('does not sync when email is same as cart email', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { email: 'same@example.com' },
					domain: 'test.com'
				});
				checkout.initializeForms({ email: 'same@example.com' }, {});
				flushSync();

				const originalCart = checkout.cart;
				checkout.syncEmailToCart();
				flushSync();

				expect(checkout.cart).toBe(originalCart);
			});
			cleanup();
		});
	});

	describe('hadInitialShippingMethod', () => {
		it('tracks whether cart had initial shipping method', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { shipping_method: 'express' },
					domain: 'test.com'
				});
				expect(checkout.hadInitialShippingMethod).toBe(true);
			});
			cleanup();
		});

		it('returns false when cart has no initial shipping method', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { shipping_method: null },
					domain: 'test.com'
				});
				expect(checkout.hadInitialShippingMethod).toBe(false);
			});
			cleanup();
		});

		it('caches the initial value', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { shipping_method: 'standard' },
					domain: 'test.com'
				});

				const firstValue = checkout.hadInitialShippingMethod;
				checkout.cart.shipping_method = null;
				const secondValue = checkout.hadInitialShippingMethod;

				expect(firstValue).toBe(true);
				expect(secondValue).toBe(true);
			});
			cleanup();
		});
	});

	describe('setPaymentFormData', () => {
		it('sets payment form data', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const paymentData = {
					number: '4111111111111111',
					expiration: '12/25',
					verificationCode: '123'
				};

				checkout.setPaymentFormData(paymentData);

				expect(checkout.paymentFormData).toEqual(paymentData);
				expect(checkout.paymentFormFilled).toBe(true);
			});
			cleanup();
		});
	});

	describe('canPlaceOrder with PayPal', () => {
		it('returns false when PayPal selected but not authorized', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { payment_method: null },
					domain: 'test.com'
				});
				checkout.initializeForms(
					{
						email: 'test@example.com',
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main St',
						city: 'Test City',
						state_or_province: 'CA',
						postal_code: '12345',
						phone: '1234567890'
					},
					{}
				);
				checkout.selectedPaymentMethod = 'paypal';
				flushSync();

				expect(checkout.canPlaceOrder).toBe(false);
			});
			cleanup();
		});

		it('returns true when PayPal selected and authorized', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: {
						payment_method: {
							type: 'PayPal',
							attributes: { paypal_token: 'test-token' }
						}
					},
					domain: 'test.com'
				});
				checkout.initializeForms(
					{
						email: 'test@example.com',
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main St',
						city: 'Test City',
						state_or_province: 'CA',
						postal_code: '12345',
						phone: '1234567890'
					},
					{}
				);
				checkout.selectedPaymentMethod = 'paypal';
				flushSync();

				expect(checkout.canPlaceOrder).toBe(true);
			});
			cleanup();
		});
	});

	describe('view navigation', () => {
		it('goToCheckout sets view to checkout', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				checkout.goToCheckout();
				flushSync();

				expect(checkout.view).toBe('checkout');
			});
			cleanup();
		});

		it('goToCheckout clears error message', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.errorMessage = 'Test error';
				flushSync();

				checkout.goToCheckout();
				flushSync();

				expect(checkout.errorMessage).toBe('');
			});
			cleanup();
		});

		it('goToCheckout clears error code', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.errorCode = '500';
				flushSync();

				checkout.goToCheckout();
				flushSync();

				expect(checkout.errorCode).toBe('');
			});
			cleanup();
		});

		it('goToThankYou sets view to thankyou', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });

				checkout.goToThankYou();
				flushSync();

				expect(checkout.view).toBe('thankyou');
			});
			cleanup();
		});
	});

	describe('initializeForms with existing forms', () => {
		it('updates existing shipping form with new data when not already full filled', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({}, {});
				flushSync();

				const originalForm = checkout.shippingForm;
				checkout.initializeForms({ email: 'updated@example.com' }, {});
				flushSync();

				expect(checkout.shippingForm).toBe(originalForm);
				expect(checkout.shippingForm.email.value).toBe('updated@example.com');
			});
			cleanup();
		});

		it('updates existing billing form with new data when not already full filled', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({}, {});
				flushSync();

				const originalForm = checkout.billingForm;
				checkout.initializeForms({}, { email: 'billing@example.com' });
				flushSync();

				expect(checkout.billingForm).toBe(originalForm);
				expect(checkout.billingForm.email.value).toBe('billing@example.com');
			});
			cleanup();
		});

		it('does not update existing form when already fully filled', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms(
					{
						email: 'original@example.com',
						first_name: 'John',
						last_name: 'Doe',
						address1: '123 Main St',
						city: 'New York',
						state_or_province: 'NY',
						postal_code: '10001',
						phone: '5551234567'
					},
					{}
				);
				flushSync();

				checkout.initializeForms({ email: 'new@example.com' }, {});
				flushSync();

				expect(checkout.shippingForm.email.value).toBe('original@example.com');
			});
			cleanup();
		});

		it('does not update existing form when no new info provided', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({ email: 'test@example.com' }, {});
				flushSync();

				const originalEmail = checkout.shippingForm.email.value;
				checkout.initializeForms({}, {});
				flushSync();

				expect(checkout.shippingForm.email.value).toBe(originalEmail);
			});
			cleanup();
		});
	});

	describe('shippingPreFilled', () => {
		it('is false when no shipping info is provided', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({}, {});
				flushSync();

				expect(checkout.shippingPreFilled).toBe(false);
			});
			cleanup();
		});

		it('is true when shipping info is provided on initialization', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({ email: 'test@example.com' }, {});
				flushSync();

				expect(checkout.shippingPreFilled).toBe(true);
			});
			cleanup();
		});

		it('does not set shippingPreFilled when user already filled the form', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.initializeForms({}, {});
				flushSync();

				checkout.shippingForm.setValues({
					email: 'user@example.com',
					first_name: 'John',
					last_name: 'Doe',
					address1: '123 Main St',
					city: 'New York',
					state_or_province: 'NY',
					postal_code: '10001',
					phone: '5551234567'
				});
				flushSync();

				checkout.initializeForms({ email: 'user@example.com' }, {});
				flushSync();

				expect(checkout.shippingPreFilled).toBe(false);
			});
			cleanup();
		});
	});

	describe('hadInitialCard', () => {
		it('returns true when storage has credit cards on init', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.addC2PCards([{ id: 'card1', last4: '1234' }]);
				flushSync();

				expect(checkout.hadInitialCard).toBe(true);
			});
			cleanup();
		});

		it('returns false when storage has no credit cards', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				flushSync();

				expect(checkout.hadInitialCard).toBe(false);
			});
			cleanup();
		});

		it('caches the initial card value', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.addC2PCards([{ id: 'card1', last4: '1234' }]);
				flushSync();

				const firstValue = checkout.hadInitialCard;
				checkout.storage = { shipping_addresses: [], credit_cards: [] };
				flushSync();
				const secondValue = checkout.hadInitialCard;

				expect(firstValue).toBe(true);
				expect(secondValue).toBe(true);
			});
			cleanup();
		});
	});

	describe('features derived', () => {
		it('returns default promoCodes true when not in cart', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				expect(checkout.features.promoCodes).toBe(true);
			});
			cleanup();
		});

		it('returns promoCodes from cart features', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { features: { promo_codes: false } },
					domain: 'test.com'
				});
				expect(checkout.features.promoCodes).toBe(false);
			});
			cleanup();
		});

		it('returns paypal true when clientId exists', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { shop_properties: { paypal: { clientId: 'test-client-id' } } },
					domain: 'test.com'
				});
				expect(checkout.features.paypal).toBe(true);
			});
			cleanup();
		});

		it('returns paypal false when no clientId', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { shop_properties: {} },
					domain: 'test.com'
				});
				expect(checkout.features.paypal).toBe(false);
			});
			cleanup();
		});

		it('returns paypal from cart features when explicitly set', () => {
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({
					cart: { features: { paypal: true } },
					domain: 'test.com'
				});
				expect(checkout.features.paypal).toBe(true);
			});
			cleanup();
		});
	});
});
