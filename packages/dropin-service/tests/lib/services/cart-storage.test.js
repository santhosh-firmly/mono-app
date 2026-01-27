import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSessionCart, setSessionCart } from '$lib/services/cart.js';

describe('cart service - session storage', () => {
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
	});

	afterEach(() => {
		delete global.sessionStorage;
	});

	describe('getSessionCart', () => {
		it('should return null when no cart in session', () => {
			const result = getSessionCart();
			expect(result).toBeNull();
		});

		it('should return parsed cart data from session', () => {
			const cartData = { id: '123', items: [] };
			sessionStorage.setItem('FSSCAR', JSON.stringify(cartData));

			const result = getSessionCart();
			expect(result).toEqual(cartData);
		});
	});

	describe('setSessionCart', () => {
		it('should store cart data in session', () => {
			const cartData = { id: '456', items: [{ sku: 'ABC' }] };
			setSessionCart(cartData);

			const stored = JSON.parse(sessionStorage.getItem('FSSCAR'));
			expect(stored).toEqual(cartData);
		});
	});
});
