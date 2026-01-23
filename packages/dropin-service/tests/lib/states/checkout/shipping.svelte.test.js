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
import { initializeBuyNow, resetBuyNow } from '$lib/states/buy-now.svelte.js';
import { cartUpdateShippingInfo, cartUpdateDelivery } from '$lib/services/cart.js';
import { searchAddress, getAddress } from '$lib/services/address-autocomplete.js';

describe('checkout state - shipping operations', () => {
	beforeEach(() => {
		resetBuyNow();
		resetCheckout();
		initializeBuyNow();
		cartUpdateShippingInfo.mockClear();
	});

	afterEach(() => {
		resetCheckout();
		resetBuyNow();
	});

	describe('updateShippingAddress', () => {
		it('returns false for empty address', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.updateShippingAddress(null);

				expect(result).toBe(false);
			});
			cleanup();
		});

		it('calls service on success', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const address = { street: '123 Main St', city: 'Test City' };
				const result = await checkout.updateShippingAddress(address);

				expect(cartUpdateShippingInfo).toHaveBeenCalledWith(address, 'test.com');
				expect(result).toBe(true);
			});
			cleanup();
		});

		it('sets error on failure', async () => {
			cartUpdateShippingInfo.mockResolvedValueOnce({
				status: 400,
				data: { description: 'Invalid address' }
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.updateShippingAddress({ street: 'bad' });

				expect(result).toBe(false);
				expect(checkout.errors.shipping).toBe('Invalid address');
			});
			cleanup();
		});

		it('uses default error message when description is missing', async () => {
			cartUpdateShippingInfo.mockResolvedValueOnce({
				status: 400,
				data: {}
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.updateShippingAddress({ street: 'bad' });

				expect(result).toBe(false);
				expect(checkout.errors.shipping).toBe('Failed to update shipping address');
			});
			cleanup();
		});
	});

	describe('selectShippingMethod', () => {
		it('returns false for empty sku', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.selectShippingMethod(null);

				expect(result).toBe(false);
			});
			cleanup();
		});

		it('calls service on success', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.selectShippingMethod('shipping-standard');

				expect(cartUpdateDelivery).toHaveBeenCalledWith('shipping-standard', 'test.com');
				expect(result).toBe(true);
			});
			cleanup();
		});

		it('sets error on failure', async () => {
			cartUpdateDelivery.mockResolvedValueOnce({
				status: 400,
				data: { description: 'Invalid shipping method' }
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.selectShippingMethod('bad-sku');

				expect(result).toBe(false);
				expect(checkout.errors.shippingMethod).toBe('Invalid shipping method');
			});
			cleanup();
		});

		it('uses default error message when description is missing', async () => {
			cartUpdateDelivery.mockResolvedValueOnce({
				status: 400,
				data: {}
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.selectShippingMethod('bad-sku');

				expect(result).toBe(false);
				expect(checkout.errors.shippingMethod).toBe('Failed to update shipping method');
			});
			cleanup();
		});
	});

	describe('submitShippingIfReady', () => {
		it('submits shipping address when form is filled and no shipping methods exist', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { email: 'test@example.com', shipping_method_options: [] },
					domain: 'test.com'
				});
				checkout.initializeForms();
				checkout.shippingForm.name.value = 'John Doe';
				checkout.shippingForm.address.value = '123 Main St';
				checkout.shippingForm.city.value = 'City';
				checkout.shippingForm.stateOrProvince.value = 'ST';
				checkout.shippingForm.zipCode.value = '12345';
				checkout.shippingForm.phoneNumber.value = '5551234567';
				flushSync();

				await checkout.submitShippingIfReady();

				expect(cartUpdateShippingInfo).toHaveBeenCalled();
			});
			cleanup();
		});

		it('does not submit when shipping address is incomplete', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { email: 'test@example.com', shipping_method_options: [] },
					domain: 'test.com'
				});
				checkout.initializeForms();

				await checkout.submitShippingIfReady();

				expect(cartUpdateShippingInfo).not.toHaveBeenCalled();
			});
			cleanup();
		});

		it('does not submit when email is missing', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: { email: null, shipping_method_options: [] },
					domain: 'test.com'
				});
				checkout.initializeForms();
				checkout.shippingForm.name.value = 'John Doe';
				checkout.shippingForm.address.value = '123 Main St';
				checkout.shippingForm.city.value = 'City';
				checkout.shippingForm.stateOrProvince.value = 'ST';
				checkout.shippingForm.zipCode.value = '12345';
				checkout.shippingForm.phoneNumber.value = '5551234567';
				flushSync();

				await checkout.submitShippingIfReady();

				expect(cartUpdateShippingInfo).not.toHaveBeenCalled();
			});
			cleanup();
		});

		it('does not submit when shipping methods already exist', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({
					cart: {
						email: 'test@example.com',
						shipping_method_options: [{ sku: 'standard' }]
					},
					domain: 'test.com'
				});
				checkout.initializeForms();
				checkout.shippingForm.name.value = 'John Doe';
				checkout.shippingForm.address.value = '123 Main St';
				checkout.shippingForm.city.value = 'City';
				checkout.shippingForm.stateOrProvince.value = 'ST';
				checkout.shippingForm.zipCode.value = '12345';
				checkout.shippingForm.phoneNumber.value = '5551234567';
				flushSync();

				await checkout.submitShippingIfReady();

				expect(cartUpdateShippingInfo).not.toHaveBeenCalled();
			});
			cleanup();
		});
	});

	describe('searchAddress', () => {
		it('searches for shipping addresses', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.searchAddress('123 Main');
				await new Promise((r) => setTimeout(r, 350));
				expect(searchAddress).toHaveBeenCalled();
			});
			cleanup();
		});

		it('searches for billing addresses', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.searchAddress('456 Oak', 'billing');
				await new Promise((r) => setTimeout(r, 350));
				expect(searchAddress).toHaveBeenCalled();
			});
			cleanup();
		});

		it('handles API error gracefully', async () => {
			searchAddress.mockRejectedValueOnce(new Error('Network error'));
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.searchAddress('123 Main');
				await new Promise((r) => setTimeout(r, 350));
				expect(checkout.shippingAutocomplete.completions).toEqual([]);
			});
			cleanup();
		});

		it('handles AbortError silently', async () => {
			const abortError = new Error('Aborted');
			abortError.name = 'AbortError';
			searchAddress.mockRejectedValueOnce(abortError);
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.searchAddress('123 Main');
				await new Promise((r) => setTimeout(r, 350));
				expect(consoleSpy).not.toHaveBeenCalled();
			});
			cleanup();
			consoleSpy.mockRestore();
		});

		it('handles non-200 status', async () => {
			searchAddress.mockReset();
			searchAddress.mockResolvedValue({ status: 400, data: null });
			let resolve;
			const testComplete = new Promise((r) => (resolve = r));
			const cleanup = $effect.root(() => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.searchAddress('123 Main');
				setTimeout(() => {
					expect(checkout.shippingAutocomplete.completions).toEqual([]);
					resolve();
				}, 350);
			});
			await testComplete;
			cleanup();
		});
	});

	describe('selectAddress', () => {
		it('fetches address details', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.selectAddress({ id: 'addr123' });
				expect(getAddress).toHaveBeenCalledWith('addr123', 'test.com', {});
			});
			cleanup();
		});

		it('handles string option', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.selectAddress('addr456');
				expect(getAddress).toHaveBeenCalledWith('addr456', 'test.com', {});
			});
			cleanup();
		});

		it('handles billing type', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.selectAddress('addr789', 'billing');
				expect(getAddress).toHaveBeenCalledWith('addr789', 'test.com', {});
			});
			cleanup();
		});

		it('handles API error gracefully', async () => {
			getAddress.mockRejectedValueOnce(new Error('Network error'));
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.selectAddress('addr123');
				expect(checkout.shippingAutocomplete.selectedAddress).toBe(null);
			});
			cleanup();
		});

		it('handles non-200 status', async () => {
			getAddress.mockResolvedValueOnce({ status: 400, data: null });
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.selectAddress('addr123');
				expect(checkout.shippingAutocomplete.selectedAddress).toBe(null);
			});
			cleanup();
		});
	});
});
