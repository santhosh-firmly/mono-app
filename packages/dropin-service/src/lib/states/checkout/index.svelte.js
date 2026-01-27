import { useCheckoutForm } from '$lib/composables/forms.svelte.js';
import { createCartMixin } from './cart.svelte.js';
import { createShippingMixin } from './shipping.svelte.js';
import { createPaymentMixin } from './payment.svelte.js';

/**
 * @typedef {Object} LineItem
 * @property {string} sku
 * @property {string} description
 * @property {string} variant_description
 * @property {number} quantity
 * @property {Object} line_price
 * @property {number} line_price.value
 * @property {Object} [image]
 * @property {string} [image.url]
 * @property {string[]} [variant_handles]
 */

/**
 * @typedef {Object} Cart
 * @property {LineItem[]} line_items
 * @property {Object} total
 * @property {number} total.value
 * @property {string} email
 * @property {Object} [shipping_info]
 * @property {Object} [shipping_method]
 * @property {Array} [shipping_method_options]
 */

/**
 * @typedef {Object} CreditCard
 * @property {string} id
 * @property {string} [pan]
 * @property {string} last4
 * @property {string} [network]
 * @property {boolean} [fromC2P]
 */

/**
 * @typedef {Object} Storage
 * @property {Array} shipping_addresses
 * @property {CreditCard[]} credit_cards
 */

/**
 * @typedef {Object} CheckoutForm
 * @property {boolean} isFullFilled
 * @property {boolean} isShippingAddressFilled
 * @property {Object} email
 * @property {string} email.value
 * @property {boolean} email.filled
 * @property {string} email.error
 * @property {function(): Object} getShippingAddress
 */

/**
 * @typedef {Object} PendingStates
 * @property {boolean} cart
 * @property {boolean} UPDATE_LINE_ITEM
 * @property {boolean} ADD_PROMO_CODE
 * @property {boolean} REMOVE_ALL_CODES
 * @property {boolean} SET_SHIPPING_ADDRESS
 * @property {boolean} UPDATE_SHIPPING_METHOD
 */

/**
 * Main checkout state manager using mixin composition.
 * Each mixin manages its own state internally via closures.
 *
 * @class
 * @property {Cart|null} cart - Shopping cart data
 * @property {Object} store - Store configuration
 * @property {string} domain - Store domain
 * @property {PendingStates} pending - Loading states
 * @property {Storage} storage - Stored addresses and cards
 * @property {boolean} useBillingAddress - Whether to use shipping as billing
 * @property {boolean} emailAutofillDetected - Email autofill detection flag
 * @property {CheckoutForm} shippingForm - Shipping form state
 * @property {CheckoutForm} billingForm - Billing form state
 * @property {number} totalPrice - Derived total price
 * @property {number} itemsQuantity - Derived total items quantity
 * @property {boolean} isCartLoading - Derived cart loading state
 * @property {Array} lineItems - Derived line items with pending removals
 * @property {CreditCard|null} selectedCard - Derived selected card
 * @property {boolean} hasStoredCards - Derived has saved cards flag
 * @property {boolean} paymentFormFilled - Derived payment form filled flag
 * @property {boolean} canPlaceOrder - Derived can place order flag
 * @property {boolean} hadInitialShippingMethod - Derived initial shipping method flag
 */
class Checkout {
	cart = $state(null);
	store = $state({ logoUrl: null });
	domain = $state('');
	pending = $state({ cart: true });
	storage = $state({ shipping_addresses: [], credit_cards: [] });
	useBillingAddress = $state(true);
	emailAutofillDetected = $state(false);

	view = $state('checkout');
	errorMessage = $state('');
	errorCode = $state('');
	/** @type {'card' | 'paypal'} */
	selectedPaymentMethod = $state('card');

	#shippingForm = null;
	#billingForm = null;
	#initialShippingMethodChecked = false;
	#hadInitialShippingMethod = false;
	#initialCardChecked = false;
	#hadInitialCard = false;

	get shippingForm() {
		return this.#shippingForm;
	}

	get billingForm() {
		return this.#billingForm;
	}

	totalPrice = $derived(this.cart?.total?.value || 0);

	itemsQuantity = $derived(
		this.cart?.line_items?.reduce((acc, item) => acc + item.quantity, 0) || 0
	);

	isCartLoading = $derived(
		this.pending.UPDATE_LINE_ITEM ||
			this.pending.ADD_PROMO_CODE ||
			this.pending.REMOVE_ALL_CODES ||
			this.pending.SET_SHIPPING_ADDRESS ||
			this.pending.UPDATE_SHIPPING_METHOD
	);

	lineItems = $derived.by(() => {
		const cartItems =
			this.cart?.line_items?.map((item, index) => ({
				sku: item?.sku,
				image: item.image?.url,
				title: item?.description,
				description: item?.variant_description,
				price: item?.line_price?.value,
				quantity: item?.quantity,
				variantHandles: item?.variant_handles,
				pendingRemoval: false,
				originalIndex: index
			})) || [];

		const pendingItems = Object.values(this.pendingRemovals).map((item) => ({
			...item,
			pendingRemoval: true
		}));

		const cartSkus = new Set(cartItems.map((item) => item.sku));
		const uniquePendingItems = pendingItems.filter((item) => !cartSkus.has(item.sku));

		const allItems = [...cartItems, ...uniquePendingItems];
		allItems.sort((a, b) => (a.originalIndex ?? Infinity) - (b.originalIndex ?? Infinity));

		return allItems;
	});

	selectedCard = $derived(
		this.storage?.credit_cards?.find(
			(c) => c.id === this.selectedCardId || c.pan === this.selectedCardId
		) || null
	);

	hasStoredCards = $derived(this.storage?.credit_cards?.length > 0);

	paymentFormFilled = $derived(!!this.paymentFormData);

	/** @type {boolean} Whether PayPal payment has been authorized */
	isPayPalAuthorized = $derived(
		this.cart?.payment_method?.type === 'PayPal' ||
			!!this.cart?.payment_method?.attributes?.paypal_token
	);

	canPlaceOrder = $derived.by(() => {
		const shippingFilled = this.shippingForm?.isFullFilled;
		const hasShippingMethodOptions = this.cart?.shipping_method_options?.length > 0;
		const shippingMethodReady = !hasShippingMethodOptions || !!this.cart?.shipping_method;
		const hasSelectedCard = !!this.selectedCardId;

		let paymentReady = false;
		if (this.selectedPaymentMethod === 'paypal') {
			paymentReady = this.isPayPalAuthorized;
		} else {
			paymentReady = hasSelectedCard || this.paymentFormFilled;
		}

		const billingFilled = this.useBillingAddress ? true : this.billingForm?.isFullFilled;
		const notLoading =
			!this.pending?.SET_SHIPPING_ADDRESS && !this.pending?.UPDATE_SHIPPING_METHOD;

		return shippingFilled && shippingMethodReady && paymentReady && billingFilled && notLoading;
	});

	hadInitialShippingMethod = $derived.by(() => {
		if (!this.#initialShippingMethodChecked && this.cart) {
			this.#initialShippingMethodChecked = true;
			this.#hadInitialShippingMethod = !!this.cart.shipping_method;
		}
		return this.#hadInitialShippingMethod;
	});

	hadInitialCard = $derived.by(() => {
		if (!this.#initialCardChecked && this.storage?.credit_cards) {
			this.#initialCardChecked = true;
			this.#hadInitialCard = this.storage.credit_cards.length > 0;
		}
		return this.#hadInitialCard;
	});

	get features() {
		return {
			promoCodes: this.cart?.features?.promo_codes ?? true,
			paypal: this.cart?.features?.paypal ?? !!this.cart?.shop_properties?.paypal?.clientId
		};
	}

	/**
	 * Initialize checkout with cart, store, and domain data
	 * @param {Object} data
	 * @param {Cart} data.cart
	 * @param {Object} data.store
	 * @param {string} data.domain
	 * @param {Object} data.pending
	 */
	initialize(data = {}) {
		if (data.cart) this.cart = data.cart;
		if (data.store) this.store = data.store;
		if (data.domain) this.domain = data.domain;
		if (data.pending) this.pending = data.pending;
	}

	setCart(newCart) {
		this.cart = newCart;
	}

	setPending(action, value) {
		this.pending = { ...this.pending, [action]: value };
	}

	initializeForms(shippingInfo = {}, billingInfo = {}) {
		if (!this.#shippingForm) {
			this.#shippingForm = useCheckoutForm(shippingInfo);
		}
		if (!this.#billingForm) {
			this.#billingForm = useCheckoutForm(billingInfo);
		}
	}

	addC2PCards(cards) {
		if (cards.length > 0) {
			this.storage = {
				...this.storage,
				credit_cards: cards.map((card) => ({ ...card, fromC2P: true }))
			};
		}
	}

	formatShippingAddress(info) {
		if (!info) return '';
		return [
			`${info.first_name} ${info.last_name}`,
			info.address1,
			info.address2,
			`${info.city}, ${info.state_or_province} ${info.postal_code}`
		]
			.filter(Boolean)
			.join(' · ');
	}

	goToCheckout() {
		this.view = 'checkout';
		this.errorMessage = '';
		this.errorCode = '';
	}

	goToThankYou() {
		this.view = 'thankyou';
	}

	setError(message, code = '') {
		this.view = 'error';
		this.errorMessage = message;
		this.errorCode = code;
	}
}

let instance = null;

/**
 * Initialize the checkout state singleton
 * @param {Object} data - Initial checkout data
 * @returns {Checkout}
 */
export function initializeCheckout(data = {}) {
	instance = new Checkout();

	const cart = createCartMixin.call(instance);
	const shipping = createShippingMixin.call(instance);
	const payment = createPaymentMixin.call(instance);

	Object.defineProperties(instance, Object.getOwnPropertyDescriptors(cart));
	Object.defineProperties(instance, Object.getOwnPropertyDescriptors(shipping));
	Object.defineProperties(instance, Object.getOwnPropertyDescriptors(payment));

	instance.initialize(data);
	return instance;
}

/**
 * Get the current checkout instance
 * @returns {Checkout}
 * @throws {Error} If checkout not initialized
 */
export function getCheckout() {
	if (!instance) throw new Error('Checkout not initialized');
	return instance;
}

/**
 * Reset the checkout instance
 */
export function resetCheckout() {
	instance = null;
}
