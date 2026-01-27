import { getCheckout } from './checkout/index.svelte.js';
import {
	loadPayPalSdk,
	renderPayPalButton,
	paypalStartOrder,
	paypalAuthorizePayment,
	paypalCompleteOrder
} from '$lib/services/paypal.js';

/**
 * @typedef {Object} PayPalConfig
 * @property {string} clientId - PayPal client ID
 * @property {string} [merchantId] - PayPal merchant ID
 * @property {string} [currency='USD'] - Currency code
 * @property {string} [intent='capture'] - Payment intent
 */

/**
 * PayPal state managing SDK initialization, button rendering, and payment flow.
 * Handles PayPal SDK loading, button rendering, order creation, and payment authorization.
 *
 * @property {boolean} initialized - Whether PayPal SDK is initialized
 * @property {boolean} isLoading - Whether SDK is currently loading
 * @property {string} error - Error message from PayPal operations
 * @property {string|null} paypalToken - PayPal order token
 * @property {string|null} payerId - PayPal payer ID after approval
 * @property {boolean} isAuthorized - Whether payment has been authorized
 * @property {PayPalConfig|null} config - PayPal configuration
 *
 * @method initialize - Loads PayPal SDK with provided config
 * @method renderButton - Renders PayPal button in a container
 * @method completeOrder - Completes an authorized PayPal order
 * @method reset - Resets PayPal state to initial values
 */
class PayPal {
	initialized = $state(false);
	isLoading = $state(false);
	error = $state('');

	paypalToken = $state(null);
	payerId = $state(null);
	isAuthorized = $state(false);

	config = null;

	#renderedContainers = new Set();

	async initialize(config) {
		if (this.initialized || this.isLoading) return;
		if (!config?.clientId) {
			console.warn('[PayPal]: No clientId provided, skipping initialization');
			return;
		}

		this.isLoading = true;
		this.config = config;
		this.error = '';

		try {
			await loadPayPalSdk({
				clientId: config.clientId,
				merchantId: config.merchantId,
				currency: config.currency || 'USD',
				intent: config.intent || 'capture'
			});
			this.initialized = true;
		} catch (err) {
			this.error = err.message || 'Failed to load PayPal SDK';
			console.error('[PayPal]: SDK initialization failed', err);
		} finally {
			this.isLoading = false;
		}
	}

	renderButton(container, onSuccess, options = {}) {
		if (!this.initialized || !container) return;
		if (!document.body.contains(container)) return;

		const containerId = container.id || `paypal-container-${Date.now()}`;
		if (!container.id) container.id = containerId;
		if (this.#renderedContainers.has(containerId)) return;

		try {
			renderPayPalButton(
				container,
				{
					onCreateOrder: () => this.#handleCreateOrder(),
					onApprove: (data) => this.#handleApprove(data, onSuccess),
					onCancel: () => this.#handleCancel(),
					onError: (err) => this.#handleError(err)
				},
				options
			)
				.then(() => {
					this.#renderedContainers.add(containerId);
				})
				.catch((err) => {
					if (!document.body.contains(container)) return;
					console.error('[PayPal]: Failed to render button', err);
				});
		} catch (err) {
			console.error('[PayPal]: Failed to render button', err);
		}
	}

	async completeOrder() {
		if (!this.isAuthorized || !this.payerId || !this.paypalToken) {
			throw new Error('PayPal payment not authorized');
		}

		const checkout = getCheckout();
		const result = await this.#executePayPalOperation(
			() => paypalCompleteOrder(this.payerId, this.paypalToken, checkout.domain),
			'Failed to complete PayPal order'
		);
		checkout.setCart(result.data);
		return result.data;
	}

	reset() {
		this.paypalToken = null;
		this.payerId = null;
		this.isAuthorized = false;
		this.error = '';
		this.#renderedContainers.clear();
	}

	async #executePayPalOperation(operation, defaultError) {
		this.error = '';
		try {
			const result = await operation();
			if (result.status === 200) return result;
			throw new Error(result.data?.description || defaultError);
		} catch (err) {
			this.error = err.message;
			throw err;
		}
	}

	async #handleCreateOrder() {
		const checkout = getCheckout();
		const result = await this.#executePayPalOperation(
			() => paypalStartOrder(checkout.domain),
			'Failed to create PayPal order'
		);
		this.paypalToken = result.data?.payment_method?.attributes?.paypal_token;
		return this.paypalToken;
	}

	async #handleApprove(data, onSuccess) {
		const checkout = getCheckout();
		this.payerId = data.payerID;
		try {
			const result = await this.#executePayPalOperation(
				() => paypalAuthorizePayment(this.payerId, this.paypalToken, checkout.domain),
				'Failed to authorize PayPal payment'
			);
			this.isAuthorized = true;
			checkout.setCart(result.data);
			if (onSuccess) onSuccess(result.data);
			return result.data;
		} catch (err) {
			console.error('[PayPal]: Authorization failed', err);
		}
	}

	#handleCancel() {
		console.log('[PayPal]: Payment cancelled by user');
	}

	#handleError(err) {
		this.error = err.message || 'PayPal encountered an error';
		console.error('[PayPal]: Error', err);
	}
}

let instance = null;

export function initializePayPal() {
	instance = new PayPal();
	return instance;
}

export function getPayPal() {
	if (!instance) throw new Error('PayPal not initialized');
	return instance;
}

export function resetPayPal() {
	if (instance) instance.reset();
	instance = null;
}
