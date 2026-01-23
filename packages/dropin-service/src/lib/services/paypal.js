/**
 * PayPal Service
 *
 * Handles PayPal SDK loading and API operations.
 * Uses api-client for request handling, browser-session for auth.
 */

import { domainRequest } from '$lib/utils/api-client.js';
import { getHeaders } from './browser-session.js';

const PAYPAL_SDK_BASE_URL = 'https://www.paypal.com/sdk/js';

let paypalSdkPromise = null;

const BASE_BUTTON_STYLE = {
	color: 'gold',
	shape: 'rect',
	layout: 'horizontal',
	height: 50,
	tagline: false
};

/**
 * Creates the PayPal SDK script URL with configuration parameters.
 * @param {Object} config - PayPal configuration
 * @param {string} config.clientId - PayPal client ID
 * @param {string} [config.merchantId] - PayPal merchant ID
 * @param {string} [config.currency='USD'] - Currency code
 * @param {string} [config.intent='capture'] - Payment intent
 * @returns {string} The complete PayPal SDK URL
 */
export function createPayPalSdkUrl(config) {
	const url = new URL(PAYPAL_SDK_BASE_URL);

	url.searchParams.set('client-id', config.clientId);

	if (config.merchantId) {
		url.searchParams.set('merchant-id', config.merchantId);
	}

	url.searchParams.set('currency', config.currency || 'USD');
	url.searchParams.set('intent', config.intent || 'capture');
	url.searchParams.set('commit', 'false');
	url.searchParams.set('disable-funding', 'paylater,card');
	url.searchParams.set('components', 'buttons');

	return url.toString();
}

/**
 * Loads the PayPal SDK asynchronously.
 * @param {Object} config - PayPal configuration for SDK URL
 * @returns {Promise<Object>} The PayPal SDK object (window.paypal)
 * @throws {Error} If SDK fails to load or times out (30s)
 */
export function loadPayPalSdk(config) {
	if (paypalSdkPromise) {
		return paypalSdkPromise;
	}

	if (window.paypal) {
		return Promise.resolve(window.paypal);
	}

	paypalSdkPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = createPayPalSdkUrl(config);
		script.async = true;

		const timeout = setTimeout(() => {
			reject(new Error('PayPal SDK load timeout'));
		}, 30000);

		script.onload = () => {
			clearTimeout(timeout);
			if (window.paypal) {
				resolve(window.paypal);
			} else {
				reject(new Error('PayPal SDK not available after script load'));
			}
		};

		script.onerror = () => {
			clearTimeout(timeout);
			paypalSdkPromise = null;
			reject(new Error('Failed to load PayPal SDK'));
		};

		document.head.appendChild(script);
	});

	return paypalSdkPromise;
}

/**
 * Checks if the PayPal SDK is already loaded.
 * @returns {boolean} True if SDK is available on window
 */
export function isPayPalSdkLoaded() {
	return Boolean(window.paypal);
}

/**
 * Renders the PayPal button into a container element.
 * @param {HTMLElement} container - DOM element to render the button into
 * @param {Object} callbacks - Event handlers for PayPal button
 * @param {Function} callbacks.onCreateOrder - Called to create the order
 * @param {Function} callbacks.onApprove - Called when payment is approved
 * @param {Function} callbacks.onCancel - Called when user cancels
 * @param {Function} callbacks.onError - Called on payment error
 * @param {Object} [options] - Button styling options
 * @param {string} [options.label] - Button label override
 * @returns {Promise<void>} Resolves when button is rendered
 * @throws {Error} If PayPal SDK is not loaded
 */
export function renderPayPalButton(container, callbacks, options = {}) {
	if (!window.paypal) {
		throw new Error('PayPal SDK not loaded');
	}

	const style = {
		...BASE_BUTTON_STYLE,
		...(options.label && { label: options.label })
	};

	const buttonConfig = {
		style,
		createOrder: callbacks.onCreateOrder,
		onApprove: callbacks.onApprove,
		onCancel: callbacks.onCancel,
		onError: callbacks.onError
	};

	return window.paypal.Buttons(buttonConfig).render(container);
}

/**
 * Initiates a PayPal express checkout order.
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data?: Object}>} API response with order token
 */
export async function paypalStartOrder(domain) {
	const { headers } = await getHeaders();
	return domainRequest('express/paypal/start', domain, {
		method: 'POST',
		headers
	});
}

/**
 * Authorizes a PayPal payment after user approval.
 * @param {string} payerId - PayPal payer ID from approval
 * @param {string} paypalToken - PayPal token from approval
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data?: Object}>} API response with authorization result
 */
export async function paypalAuthorizePayment(payerId, paypalToken, domain) {
	const { headers } = await getHeaders();
	return domainRequest('express/paypal/authorize', domain, {
		method: 'POST',
		body: {
			attributes: {
				payer_id: payerId,
				paypal_token: paypalToken
			}
		},
		headers
	});
}

/**
 * Completes a PayPal order after authorization.
 * @param {string} payerId - PayPal payer ID
 * @param {string} paypalToken - PayPal token
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data?: Object}>} API response with completion result
 */
export async function paypalCompleteOrder(payerId, paypalToken, domain) {
	const { headers } = await getHeaders();
	return domainRequest('express/paypal/complete-order', domain, {
		method: 'POST',
		body: {
			attributes: {
				payer_id: payerId,
				paypal_token: paypalToken
			}
		},
		headers
	});
}
