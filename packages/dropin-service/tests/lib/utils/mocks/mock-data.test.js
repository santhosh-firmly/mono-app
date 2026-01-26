import { describe, it, expect } from 'vitest';
import {
	mockPayPalShippingInfo,
	mockC2PCards,
	mockCartBlank,
	mockCartWithShipping,
	mockOrder,
	getCartForState,
	applyFeaturesToCart
} from '$lib/utils/mocks/mock-data.js';

describe('mock-data', () => {
	describe('mockPayPalShippingInfo', () => {
		it('has required shipping fields', () => {
			expect(mockPayPalShippingInfo.first_name).toBeDefined();
			expect(mockPayPalShippingInfo.last_name).toBeDefined();
			expect(mockPayPalShippingInfo.email).toBeDefined();
			expect(mockPayPalShippingInfo.address1).toBeDefined();
			expect(mockPayPalShippingInfo.city).toBeDefined();
			expect(mockPayPalShippingInfo.state_or_province).toBeDefined();
			expect(mockPayPalShippingInfo.postal_code).toBeDefined();
			expect(mockPayPalShippingInfo.country).toBeDefined();
		});

		it('has valid email format', () => {
			expect(mockPayPalShippingInfo.email).toMatch(/@/);
		});
	});

	describe('mockC2PCards', () => {
		it('has multiple cards', () => {
			expect(Array.isArray(mockC2PCards)).toBe(true);
			expect(mockC2PCards.length).toBeGreaterThan(0);
		});

		it('each card has required fields', () => {
			mockC2PCards.forEach((card) => {
				expect(card.id).toBeDefined();
				expect(card.type).toBe('CreditCard');
				expect(card.wallet).toBe('c2p');
				expect(card.provider).toBeDefined();
				expect(card.brand).toBeDefined();
				expect(card.last4).toBeDefined();
				expect(card.last_four).toBeDefined();
				expect(card.month).toBeDefined();
				expect(card.year).toBeDefined();
				expect(card.fromC2P).toBe(true);
			});
		});

		it('has different card providers', () => {
			const providers = mockC2PCards.map((c) => c.provider);
			expect(providers).toContain('mastercard');
			expect(providers).toContain('visa');
			expect(providers).toContain('amex');
		});

		it('has card that requires CVV', () => {
			const cvvRequired = mockC2PCards.find((c) => c.requiresCvv);
			expect(cvvRequired).toBeDefined();
		});

		it('each card has billing info', () => {
			mockC2PCards.forEach((card) => {
				expect(card.billing_info).toBeDefined();
				expect(card.billing_info.city).toBeDefined();
				expect(card.billing_info.state_or_province).toBeDefined();
			});
		});
	});

	describe('mockCartBlank', () => {
		it('has required cart structure', () => {
			expect(mockCartBlank.display_name).toBeDefined();
			expect(mockCartBlank.cart_status).toBe('active');
			expect(mockCartBlank.cart_id).toBeDefined();
			expect(mockCartBlank.line_items).toBeDefined();
			expect(Array.isArray(mockCartBlank.line_items)).toBe(true);
		});

		it('has line items with required fields', () => {
			mockCartBlank.line_items.forEach((item) => {
				expect(item.sku).toBeDefined();
				expect(item.quantity).toBeGreaterThan(0);
				expect(item.price).toBeDefined();
				expect(item.price.currency).toBe('USD');
				expect(item.price.value).toBeDefined();
				expect(item.line_price).toBeDefined();
				expect(item.description).toBeDefined();
			});
		});

		it('has totals', () => {
			expect(mockCartBlank.total).toBeDefined();
			expect(mockCartBlank.sub_total).toBeDefined();
			expect(mockCartBlank.shipping_total).toBeDefined();
			expect(mockCartBlank.tax).toBeDefined();
		});

		it('has payment method options', () => {
			expect(mockCartBlank.payment_method_options).toBeDefined();
			expect(Array.isArray(mockCartBlank.payment_method_options)).toBe(true);
			expect(mockCartBlank.payment_method_options.length).toBeGreaterThan(0);
		});
	});

	describe('mockCartWithShipping', () => {
		it('extends mockCartBlank', () => {
			expect(mockCartWithShipping.cart_id).toBe(mockCartBlank.cart_id);
			expect(mockCartWithShipping.line_items.length).toBe(mockCartBlank.line_items.length);
		});

		it('has shipping info', () => {
			expect(mockCartWithShipping.shipping_info).toBeDefined();
			expect(mockCartWithShipping.shipping_info.first_name).toBeDefined();
			expect(mockCartWithShipping.shipping_info.address1).toBeDefined();
			expect(mockCartWithShipping.shipping_info.city).toBeDefined();
			expect(mockCartWithShipping.shipping_info.email).toBeDefined();
		});

		it('has shipping method', () => {
			expect(mockCartWithShipping.shipping_method).toBeDefined();
			expect(mockCartWithShipping.shipping_method.sku).toBeDefined();
			expect(mockCartWithShipping.shipping_method.description).toBeDefined();
			expect(mockCartWithShipping.shipping_method.price).toBeDefined();
		});

		it('has shipping method options', () => {
			expect(mockCartWithShipping.shipping_method_options).toBeDefined();
			expect(mockCartWithShipping.shipping_method_options.length).toBeGreaterThan(1);
		});

		it('has updated totals including shipping', () => {
			expect(mockCartWithShipping.shipping_total.value).toBeGreaterThan(0);
			expect(mockCartWithShipping.total.value).toBeGreaterThan(mockCartBlank.total.value);
		});
	});

	describe('mockOrder', () => {
		it('extends cart with order fields', () => {
			expect(mockOrder.id).toBeDefined();
			expect(mockOrder.platform_order_number).toBeDefined();
		});

		it('has thank you page URL', () => {
			expect(mockOrder.urls.thank_you_page).toBeDefined();
		});

		it('has billing info', () => {
			expect(mockOrder.billing_info).toBeDefined();
			expect(mockOrder.billing_info.first_name).toBeDefined();
			expect(mockOrder.billing_info.email).toBeDefined();
		});

		it('has payment summary', () => {
			expect(mockOrder.payment_summary).toBeDefined();
			expect(mockOrder.payment_summary.payment_type).toBeDefined();
			expect(mockOrder.payment_summary.last_four).toBeDefined();
		});
	});

	describe('getCartForState', () => {
		it('returns blank cart for "Blank" state', () => {
			const cart = getCartForState('Blank');
			expect(cart).toEqual(mockCartBlank);
		});

		it('returns null for "Skeleton" state', () => {
			const cart = getCartForState('Skeleton');
			expect(cart).toBeNull();
		});

		it('returns cart with _updatingShipping flag for "Updt Ship" state', () => {
			const cart = getCartForState('Updt Ship');
			expect(cart._updatingShipping).toBe(true);
		});

		it('returns cart with _updatingMethod flag for "Updt Method" state', () => {
			const cart = getCartForState('Updt Method');
			expect(cart._updatingMethod).toBe(true);
		});

		it('returns cart with _placingOrder flag for "Placing Order" state', () => {
			const cart = getCartForState('Placing Order');
			expect(cart._placingOrder).toBe(true);
		});

		it('returns order for "Thank You" state', () => {
			const cart = getCartForState('Thank You');
			expect(cart.id).toBeDefined();
			expect(cart.platform_order_number).toBeDefined();
		});

		it('returns blank cart for unknown state', () => {
			const cart = getCartForState('Unknown');
			expect(cart).toEqual(mockCartBlank);
		});

		it('returns new object each time (not reference)', () => {
			const cart1 = getCartForState('Blank');
			const cart2 = getCartForState('Blank');
			expect(cart1).not.toBe(cart2);
			expect(cart1).toEqual(cart2);
		});
	});

	describe('applyFeaturesToCart', () => {
		it('returns null if cart is null', () => {
			const result = applyFeaturesToCart(null, { shopPay: true });
			expect(result).toBeNull();
		});

		it('adds ShopPay payment option when enabled', () => {
			const cart = { ...mockCartBlank };
			const result = applyFeaturesToCart(cart, { shopPay: true });

			const shopPay = result.payment_method_options.find((p) => p.type === 'ShopPay');
			expect(shopPay).toBeDefined();
		});

		it('adds PayPal payment option when enabled', () => {
			const cart = { ...mockCartBlank };
			const result = applyFeaturesToCart(cart, { payPal: true });

			const paypal = result.payment_method_options.find((p) => p.type === 'PayPal');
			expect(paypal).toBeDefined();
		});

		it('always includes CreditCard payment option', () => {
			const cart = { ...mockCartBlank };
			const result = applyFeaturesToCart(cart, {});

			const creditCard = result.payment_method_options.find((p) => p.type === 'CreditCard');
			expect(creditCard).toBeDefined();
		});

		it('sets requires_shipping based on feature', () => {
			const cart = { ...mockCartBlank };
			const result = applyFeaturesToCart(cart, { shipping: true });
			expect(result.requires_shipping).toBe(true);
		});

		it('adds session with requires_login when login feature enabled', () => {
			const cart = { ...mockCartBlank };
			const result = applyFeaturesToCart(cart, { login: true });
			expect(result.session).toBeDefined();
			expect(result.session.requires_login).toBe(true);
		});

		it('does not mutate original cart', () => {
			const cart = { ...mockCartBlank };
			const originalOptions = cart.payment_method_options;

			applyFeaturesToCart(cart, { shopPay: true, payPal: true });

			expect(cart.payment_method_options).toBe(originalOptions);
		});

		it('combines multiple features', () => {
			const cart = { ...mockCartBlank };
			const result = applyFeaturesToCart(cart, {
				shopPay: true,
				payPal: true,
				shipping: true,
				login: true
			});

			expect(result.payment_method_options.length).toBe(3);
			expect(result.requires_shipping).toBe(true);
			expect(result.session.requires_login).toBe(true);
		});
	});
});
