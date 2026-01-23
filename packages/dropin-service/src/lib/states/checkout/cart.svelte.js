import { getBuyNow } from '$lib/states/buy-now.svelte.js';
import { cartGetCart, cartUpdateSku } from '$lib/services/cart.js';
import { addPromoCode, removeAllPromoCodes } from '$lib/services/promo-code.js';
import { track, EVENT_TYPE_UX } from '$lib/services/telemetry.js';

/**
 * @typedef {Object} PendingRemovalItem
 * @property {string} sku
 * @property {string} image
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {number} quantity
 * @property {string[]} variantHandles
 * @property {number} originalIndex
 */

/**
 * @typedef {Object} CartMixin
 * @property {Object.<string, PendingRemovalItem>} pendingRemovals - Items pending removal with undo option
 * @property {Object.<string, number>} removalCountdowns - Countdown timers for each pending removal
 * @property {Object.<string, string>} lineItemErrors - Error messages for line items by SKU
 * @property {function(string): Promise<void>} loadCart - Load cart data from API
 * @property {function(string, number, string[]): Promise<{success: boolean, error?: string}>} updateLineItem - Update line item quantity
 * @property {function(string): Promise<{success: boolean, error?: string}>} addPromo - Add promo code to cart
 * @property {function(): Promise<boolean>} removeAllPromos - Remove all promo codes from cart
 * @property {function(string, number): Promise<{success: boolean, error?: string}>} removeLineItem - Remove item with undo timer
 * @property {function(string): Promise<{success: boolean, error?: string}>} undoRemoval - Undo a pending item removal
 * @property {function(string): void} confirmRemoval - Confirm and finalize item removal
 * @property {function(string, string): void} setLineItemError - Set error for a line item
 * @property {function(string): void} clearLineItemError - Clear error for a line item
 */

/**
 * Creates cart operations mixin with item removal and promo code management
 * @returns {CartMixin}
 */
export function createCartMixin() {
	let pendingRemovals = $state({});
	let removalCountdowns = $state({});
	let lineItemErrors = $state({});
	const removalTimeouts = {};
	const countdownIntervals = {};

	function clearRemovalTimers(sku) {
		if (removalTimeouts[sku]) {
			clearTimeout(removalTimeouts[sku]);
			delete removalTimeouts[sku];
		}
		if (countdownIntervals[sku]) {
			clearInterval(countdownIntervals[sku]);
			delete countdownIntervals[sku];
		}
	}

	return {
		get pendingRemovals() {
			return pendingRemovals;
		},
		get removalCountdowns() {
			return removalCountdowns;
		},
		get lineItemErrors() {
			return lineItemErrors;
		},

		setLineItemError(sku, error) {
			lineItemErrors = { ...lineItemErrors, [sku]: error };
		},

		clearLineItemError(sku) {
			lineItemErrors = Object.fromEntries(
				Object.entries(lineItemErrors).filter(([key]) => key !== sku)
			);
		},

		async loadCart(domain) {
			const buyNow = getBuyNow();
			try {
				this.setPending('cart', true);
				const result = await cartGetCart(domain);
				if (result?.status === 200) this.setCart(result.data);
			} catch (error) {
				buyNow.setError(error, 'Failed to load cart');
			} finally {
				this.setPending('cart', false);
			}
		},

		async updateLineItem(sku, quantity, variantHandles = []) {
			this.setPending('UPDATE_LINE_ITEM', true);
			try {
				const result = await cartUpdateSku(sku, quantity, variantHandles, this.domain);
				if (result?.status === 200) {
					this.setCart(result.data);
					return { success: true };
				}
				const errorMessage =
					result?.data?.description || 'There was an error updating the item';
				return { success: false, error: errorMessage };
			} finally {
				this.setPending('UPDATE_LINE_ITEM', false);
			}
		},

		async addPromo(code) {
			if (!code) return { success: false, error: 'Please enter a promo code' };

			this.setPending('ADD_PROMO_CODE', true);
			try {
				const result = await addPromoCode(code, this.domain);
				if (result?.status === 200) {
					this.setCart(result.data);
					return { success: true };
				}
				const errorMessage =
					result?.data?.description || 'There was an error while adding the promotion';
				return { success: false, error: errorMessage };
			} catch {
				return { success: false, error: 'There was an error while adding the promotion' };
			} finally {
				this.setPending('ADD_PROMO_CODE', false);
			}
		},

		async removeAllPromos() {
			this.setPending('REMOVE_ALL_CODES', true);
			try {
				const result = await removeAllPromoCodes(this.domain);
				if (result?.status === 200) this.setCart(result.data);
				return result?.status === 200;
			} finally {
				this.setPending('REMOVE_ALL_CODES', false);
			}
		},

		async removeLineItem(sku, autoConfirmDelay = 15000) {
			const itemIndex = this.cart?.line_items?.findIndex((i) => i.sku === sku);
			const item = itemIndex >= 0 ? this.cart.line_items[itemIndex] : null;
			if (!item) return { success: false, error: 'Item not found' };

			const isLastItem = this.cart?.line_items?.length === 1;

			const itemData = {
				sku: item.sku,
				image: item.image?.url,
				title: item.description,
				description: item.variant_description,
				price: item.line_price?.value,
				quantity: item.quantity,
				variantHandles: item.variant_handles || [],
				originalIndex: itemIndex
			};

			track('cart_item_removed', EVENT_TYPE_UX, { sku });

			this.setPending('UPDATE_LINE_ITEM', true);
			try {
				const result = await cartUpdateSku(sku, 0, itemData.variantHandles, this.domain);
				if (result?.status !== 200) {
					const errorMessage =
						result?.data?.description || 'There was an error removing the item';
					return { success: false, error: errorMessage };
				}
				this.setCart(result.data);
			} finally {
				this.setPending('UPDATE_LINE_ITEM', false);
			}

			if (!isLastItem) {
				pendingRemovals = { ...pendingRemovals, [sku]: itemData };
				clearRemovalTimers(sku);

				const countdownSeconds = Math.ceil(autoConfirmDelay / 1000);
				removalCountdowns = { ...removalCountdowns, [sku]: countdownSeconds };

				countdownIntervals[sku] = setInterval(() => {
					const current = removalCountdowns[sku];
					if (current > 1) {
						removalCountdowns = { ...removalCountdowns, [sku]: current - 1 };
					} else {
						this.confirmRemoval(sku);
					}
				}, 1000);

				removalTimeouts[sku] = setTimeout(() => {
					this.confirmRemoval(sku);
				}, autoConfirmDelay);
			}

			return { success: true };
		},

		async undoRemoval(sku) {
			const item = pendingRemovals[sku];
			if (!item) return { success: false, error: 'Item not found' };

			clearRemovalTimers(sku);
			track('cart_item_undo', EVENT_TYPE_UX, { sku });

			this.setPending('UPDATE_LINE_ITEM', true);
			try {
				const result = await cartUpdateSku(
					sku,
					item.quantity,
					item.variantHandles,
					this.domain
				);
				if (result?.status !== 200) {
					const errorMessage =
						result?.data?.description || 'There was an error restoring the item';
					return { success: false, error: errorMessage };
				}
				this.setCart(result.data);

				pendingRemovals = Object.fromEntries(
					Object.entries(pendingRemovals).filter(([key]) => key !== sku)
				);
				removalCountdowns = Object.fromEntries(
					Object.entries(removalCountdowns).filter(([key]) => key !== sku)
				);

				return { success: true };
			} finally {
				this.setPending('UPDATE_LINE_ITEM', false);
			}
		},

		confirmRemoval(sku) {
			clearRemovalTimers(sku);
			pendingRemovals = Object.fromEntries(
				Object.entries(pendingRemovals).filter(([key]) => key !== sku)
			);
			removalCountdowns = Object.fromEntries(
				Object.entries(removalCountdowns).filter(([key]) => key !== sku)
			);
		}
	};
}
