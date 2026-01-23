import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
import { cartUpdateSku, cartGetCart } from '$lib/services/cart.js';
import { addPromoCode, removeAllPromoCodes } from '$lib/services/promo-code.js';

describe('checkout state - cart operations', () => {
	beforeEach(() => {
		resetBuyNow();
		resetCheckout();
		initializeBuyNow();
	});

	afterEach(() => {
		resetCheckout();
		resetBuyNow();
	});

	describe('addPromo', () => {
		it('returns error object for empty code', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.addPromo('');

				expect(result).toEqual({ success: false, error: 'Please enter a promo code' });
			});
			cleanup();
		});

		it('calls service and updates cart on success', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.addPromo('DISCOUNT10');

				expect(addPromoCode).toHaveBeenCalledWith('DISCOUNT10', 'test.com');
				expect(result).toEqual({ success: true });
			});
			cleanup();
		});

		it('returns error object when API returns non-200 status', async () => {
			addPromoCode.mockResolvedValueOnce({
				status: 400,
				data: { description: 'Invalid code' }
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.addPromo('BADCODE');

				expect(result).toEqual({ success: false, error: 'Invalid code' });
			});
			cleanup();
		});
	});

	describe('removeAllPromos', () => {
		it('calls service and updates cart', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.removeAllPromos();

				expect(removeAllPromoCodes).toHaveBeenCalledWith('test.com');
				expect(result).toBe(true);
			});
			cleanup();
		});

		it('returns false when API returns non-200 status', async () => {
			removeAllPromoCodes.mockResolvedValueOnce({ status: 500, data: {} });
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.removeAllPromos();

				expect(result).toBe(false);
			});
			cleanup();
		});
	});

	describe('updateLineItem', () => {
		it('calls service with correct params', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.updateLineItem('SKU123', 2, ['variant1']);

				expect(cartUpdateSku).toHaveBeenCalledWith('SKU123', 2, ['variant1'], 'test.com');
				expect(result).toEqual({ success: true });
			});
			cleanup();
		});

		it('returns error object when API returns non-200 status', async () => {
			cartUpdateSku.mockResolvedValueOnce({
				status: 400,
				data: { description: 'Item not available' }
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.updateLineItem('SKU123', 2);

				expect(result).toEqual({ success: false, error: 'Item not available' });
			});
			cleanup();
		});

		it('uses default error message when description missing', async () => {
			cartUpdateSku.mockResolvedValueOnce({ status: 400, data: {} });
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.updateLineItem('SKU123', 2);

				expect(result).toEqual({
					success: false,
					error: 'There was an error updating the item'
				});
			});
			cleanup();
		});
	});

	describe('loadCart', () => {
		it('fetches and sets cart data', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.loadCart('test.com');

				expect(cartGetCart).toHaveBeenCalledWith('test.com');
			});
			cleanup();
		});

		it('handles error gracefully', async () => {
			cartGetCart.mockRejectedValueOnce(new Error('Network error'));
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				await checkout.loadCart('test.com');
			});
			cleanup();
		});
	});

	describe('removeLineItem', () => {
		it('returns error object if item not found', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({ line_items: [] });
				const result = await checkout.removeLineItem('NONEXISTENT');

				expect(result).toEqual({ success: false, error: 'Item not found' });
			});
			cleanup();
		});

		it('removes item and sets up undo timer for multi-item cart', async () => {
			vi.useFakeTimers();
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({
					line_items: [
						{
							sku: 'SKU1',
							description: 'Product 1',
							variant_description: 'Blue',
							quantity: 2,
							line_price: { value: 100 },
							image: { url: 'image1.jpg' },
							variant_handles: ['blue']
						},
						{
							sku: 'SKU2',
							description: 'Product 2',
							quantity: 1
						}
					]
				});

				const result = await checkout.removeLineItem('SKU1', 5000);

				expect(cartUpdateSku).toHaveBeenCalledWith('SKU1', 0, ['blue'], 'test.com');
				expect(result).toEqual({ success: true });
				expect(checkout.pendingRemovals).toHaveProperty('SKU1');
				expect(checkout.removalCountdowns).toHaveProperty('SKU1');
			});
			cleanup();
			vi.useRealTimers();
		});

		it('removes last item without undo timer', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({
					line_items: [
						{
							sku: 'SKU1',
							description: 'Product 1',
							quantity: 1
						}
					]
				});

				const result = await checkout.removeLineItem('SKU1');

				expect(result).toEqual({ success: true });
				expect(checkout.pendingRemovals).not.toHaveProperty('SKU1');
			});
			cleanup();
		});

		it('returns error object on API error', async () => {
			cartUpdateSku.mockResolvedValueOnce({
				status: 400,
				data: { description: 'Cannot remove item' }
			});
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({
					line_items: [
						{ sku: 'SKU1', description: 'Product 1', quantity: 1 },
						{ sku: 'SKU2', description: 'Product 2', quantity: 1 }
					]
				});

				const result = await checkout.removeLineItem('SKU1');

				expect(result).toEqual({ success: false, error: 'Cannot remove item' });
			});
			cleanup();
		});

		it('auto-confirms removal after countdown', async () => {
			vi.useFakeTimers();
			try {
				let checkout;
				const cleanup = $effect.root(() => {
					checkout = initializeCheckout({ domain: 'test.com' });
					checkout.setCart({
						line_items: [
							{ sku: 'SKU1', description: 'Product 1', quantity: 1 },
							{ sku: 'SKU2', description: 'Product 2', quantity: 1 }
						]
					});
				});

				await checkout.removeLineItem('SKU1', 3000);
				expect(checkout.pendingRemovals).toHaveProperty('SKU1');

				await vi.advanceTimersByTimeAsync(3000);
				expect(checkout.pendingRemovals).not.toHaveProperty('SKU1');

				cleanup();
			} finally {
				vi.useRealTimers();
			}
		});

		it('decrements countdown each second', async () => {
			vi.useFakeTimers();
			try {
				let checkout;
				const cleanup = $effect.root(() => {
					checkout = initializeCheckout({ domain: 'test.com' });
					checkout.setCart({
						line_items: [
							{ sku: 'SKU1', description: 'Product 1', quantity: 1 },
							{ sku: 'SKU2', description: 'Product 2', quantity: 1 }
						]
					});
				});

				await checkout.removeLineItem('SKU1', 3000);
				expect(checkout.removalCountdowns.SKU1).toBe(3);

				await vi.advanceTimersByTimeAsync(1000);
				expect(checkout.removalCountdowns.SKU1).toBe(2);

				await vi.advanceTimersByTimeAsync(1000);
				expect(checkout.removalCountdowns.SKU1).toBe(1);

				cleanup();
			} finally {
				vi.useRealTimers();
			}
		});
	});

	describe('undoRemoval', () => {
		it('returns error object if no pending removal', async () => {
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.undoRemoval('SKU1');

				expect(result).toEqual({ success: false, error: 'Item not found' });
			});
			cleanup();
		});

		it('restores item and clears timers', async () => {
			vi.useFakeTimers();
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({
					line_items: [
						{
							sku: 'SKU1',
							description: 'Product 1',
							quantity: 2,
							variant_handles: ['blue']
						},
						{ sku: 'SKU2', description: 'Product 2', quantity: 1 }
					]
				});

				await checkout.removeLineItem('SKU1', 5000);
				expect(checkout.pendingRemovals).toHaveProperty('SKU1');

				const result = await checkout.undoRemoval('SKU1');

				expect(cartUpdateSku).toHaveBeenCalledWith('SKU1', 2, ['blue'], 'test.com');
				expect(result).toEqual({ success: true });
				expect(checkout.pendingRemovals).not.toHaveProperty('SKU1');
				expect(checkout.removalCountdowns).not.toHaveProperty('SKU1');
			});
			cleanup();
			vi.useRealTimers();
		});

		it('returns error object on API error', async () => {
			vi.useFakeTimers();
			cartUpdateSku.mockResolvedValueOnce({ status: 200, data: {} });
			cartUpdateSku.mockResolvedValueOnce({
				status: 400,
				data: { description: 'Failed to restore' }
			});

			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({
					line_items: [
						{ sku: 'SKU1', description: 'Product 1', quantity: 2 },
						{ sku: 'SKU2', description: 'Product 2', quantity: 1 }
					]
				});

				await checkout.removeLineItem('SKU1', 5000);
				const result = await checkout.undoRemoval('SKU1');

				expect(result).toEqual({ success: false, error: 'Failed to restore' });
			});
			cleanup();
			vi.useRealTimers();
		});
	});

	describe('confirmRemoval', () => {
		it('clears pending removal and timers', async () => {
			vi.useFakeTimers();
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				checkout.setCart({
					line_items: [
						{ sku: 'SKU1', description: 'Product 1', quantity: 1 },
						{ sku: 'SKU2', description: 'Product 2', quantity: 1 }
					]
				});

				await checkout.removeLineItem('SKU1', 5000);
				expect(checkout.pendingRemovals).toHaveProperty('SKU1');

				checkout.confirmRemoval('SKU1');
				expect(checkout.pendingRemovals).not.toHaveProperty('SKU1');
				expect(checkout.removalCountdowns).not.toHaveProperty('SKU1');
			});
			cleanup();
			vi.useRealTimers();
		});
	});

	describe('addPromo - exception handling', () => {
		it('returns error object on exception', async () => {
			addPromoCode.mockRejectedValueOnce(new Error('Network error'));
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.addPromo('CODE');

				expect(result).toEqual({
					success: false,
					error: 'There was an error while adding the promotion'
				});
			});
			cleanup();
		});

		it('uses default error message when description missing', async () => {
			addPromoCode.mockResolvedValueOnce({ status: 400, data: {} });
			const cleanup = $effect.root(async () => {
				const checkout = initializeCheckout({ domain: 'test.com' });
				const result = await checkout.addPromo('CODE');

				expect(result).toEqual({
					success: false,
					error: 'There was an error while adding the promotion'
				});
			});
			cleanup();
		});
	});
});
