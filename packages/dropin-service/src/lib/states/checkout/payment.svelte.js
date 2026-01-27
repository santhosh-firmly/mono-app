import { SvelteSet } from 'svelte/reactivity';
import { getBuyNow } from '$lib/states/buy-now.svelte.js';
import {
	placeOrderWithCreditCard,
	placeOrderWithSavedCard,
	placeOrderWithPayPal,
	placeOrderWithC2P
} from '$lib/services/order.js';
import { track, EVENT_TYPE_UX } from '$lib/services/telemetry.js';
import { postCheckoutClosed, postOrderPlaced } from '$lib/utils/message-transport.js';

/**
 * @typedef {Object} PaymentFormData
 * @property {string} number - Credit card number
 * @property {string} expiration - Expiration date (MM/YY format)
 * @property {string} verificationCode - CVV code
 */

/**
 * @typedef {Object} OrderResult
 * @property {boolean} success
 * @property {string} [error]
 * @property {Object} [order]
 * @property {string} [redirectUrl]
 */

/**
 * @typedef {Object} PaymentMixin
 * @property {string|null} selectedCardId - ID of selected saved card
 * @property {PaymentFormData|null} paymentFormData - Payment form data
 * @property {boolean} placeOrderPending - Whether order placement is in progress
 * @property {string} placeOrderError - Order placement error message
 * @property {Object|null} orderResult - Completed order result
 * @property {function(PaymentFormData): void} setPaymentFormData - Set payment form data
 * @property {function(string): Promise<OrderResult>} placeOrder - Place order with selected payment method
 * @property {function(string): void} useFastCheckout - Track fast checkout usage
 * @property {function(string): void} goBack - Navigate back to product or close
 * @property {function(): void} close - Close checkout
 */

/**
 * Creates payment operations mixin with order placement
 * @returns {PaymentMixin}
 */
export function createPaymentMixin() {
	let selectedCardId = $state(null);
	let paymentFormData = $state(null);
	let placeOrderPending = $state(false);
	let placeOrderError = $state('');
	let orderResult = $state(null);

	let cvvRequired = $state(false);
	let cvvValue = $state('');
	let cvvError = $state('');
	let cvvLoading = $state(false);
	let cvvSuccess = $state(false);
	let cardsRequiringCvv = new SvelteSet();

	function getBillingInfo(checkout) {
		const form = checkout.useBillingAddress ? checkout.shippingForm : checkout.billingForm;
		if (!form) return {};

		const address = form.getShippingAddress();
		return {
			first_name: address.first_name,
			last_name: address.last_name,
			email: address.email,
			phone: address.phone,
			address1: address.address1,
			address2: address.address2 || '',
			city: address.city,
			state_or_province: address.state_or_province,
			country: address.country || 'US',
			postal_code: address.postal_code
		};
	}

	return {
		get selectedCardId() {
			return selectedCardId;
		},
		set selectedCardId(value) {
			selectedCardId = value;
		},
		get paymentFormData() {
			return paymentFormData;
		},
		get placeOrderPending() {
			return placeOrderPending;
		},
		get placeOrderError() {
			return placeOrderError;
		},
		get orderResult() {
			return orderResult;
		},
		get cvvRequired() {
			return cvvRequired;
		},
		get cvvValue() {
			return cvvValue;
		},
		set cvvValue(value) {
			cvvValue = value;
		},
		get cvvError() {
			return cvvError;
		},
		get cvvLoading() {
			return cvvLoading;
		},
		get cvvSuccess() {
			return cvvSuccess;
		},

		get showPaymentCvvConfirmation() {
			return cvvRequired && this.selectedCard?.fromC2P;
		},

		setPaymentFormData(data) {
			paymentFormData = data;
		},

		clearCvv(clearTracking = false) {
			cvvRequired = false;
			cvvValue = '';
			cvvError = '';
			cvvLoading = false;
			cvvSuccess = false;
			if (clearTracking) {
				cardsRequiringCvv.clear();
			}
		},

		cancelCvvConfirmation() {
			this.clearCvv();
			return true;
		},

		cardRequiresCvv(cardId) {
			return cardsRequiringCvv.has(cardId);
		},

		setCvvRequired(value) {
			cvvRequired = value;
		},

		async placeOrder(paymentMethod = 'credit_card') {
			track('place_order_clicked', EVENT_TYPE_UX, { paymentMethod });

			if (!this.canPlaceOrder) {
				placeOrderError = 'Please complete all required fields';
				return { success: false, error: placeOrderError };
			}

			placeOrderPending = true;
			placeOrderError = '';

			try {
				let result;

				if (paymentMethod === 'paypal') {
					result = await placeOrderWithPayPal(this.domain);
				} else if (selectedCardId) {
					const card = this.selectedCard;
					if (card?.fromC2P) {
						result = await placeOrderWithC2P(
							this.domain,
							{
								wallet: card.provider || card.network || 'mastercard',
								credit_card_id: card.id || card.pan
							},
							cvvValue || null
						);

						if (result.cvvRequired) {
							const cardId = card.id || card.pan;
							cardsRequiringCvv.add(cardId);
							cvvRequired = true;
							placeOrderPending = false;
							return { success: false, cvvRequired: true };
						}
					} else {
						result = await placeOrderWithSavedCard(this.domain, selectedCardId);
					}
				} else if (paymentFormData) {
					const billingInfo = getBillingInfo(this);
					const [expMonth, expYear] = paymentFormData.expiration
						.split('/')
						.map((s) => s.trim());

					result = await placeOrderWithCreditCard(
						this.domain,
						{
							number: paymentFormData.number,
							expMonth,
							expYear,
							cvv: paymentFormData.verificationCode
						},
						billingInfo
					);
				} else {
					result = { success: false, error: 'No payment method selected' };
				}

				if (result.success) {
					orderResult = result.order;
					track('order_placed', EVENT_TYPE_UX, { paymentMethod });

					if (result.redirectUrl) {
						postOrderPlaced(result.redirectUrl, result.order?.session);
					}

					return result;
				}

				placeOrderError = result.error || 'Failed to place order';
				return result;
			} catch (error) {
				placeOrderError = error.message || 'An unexpected error occurred';
				return { success: false, error: placeOrderError };
			} finally {
				placeOrderPending = false;
			}
		},

		useFastCheckout(method) {
			track('fast_checkout_clicked', EVENT_TYPE_UX, { method });
		},

		goBack(productUrl) {
			const buyNow = getBuyNow();
			if (productUrl) {
				buyNow.goToPdp();
			} else {
				this.close();
			}
			track('checkout_back_clicked', EVENT_TYPE_UX);
		},

		close() {
			const buyNow = getBuyNow();
			buyNow.close();
			setTimeout(() => postCheckoutClosed(this.domain), buyNow.layoutTransitionTime);
		},

		async submitCvv() {
			if (cvvValue.length < 3) {
				cvvError = 'Please enter a valid CVV';
				return { success: false, error: cvvError };
			}

			cvvLoading = true;
			cvvError = '';

			const result = await this.placeOrder('credit_card');

			cvvLoading = false;

			if (result.success) {
				cvvSuccess = true;
			} else if (!result.cvvRequired) {
				cvvError = result.error || 'CVV verification failed';
			}

			return result;
		}
	};
}
