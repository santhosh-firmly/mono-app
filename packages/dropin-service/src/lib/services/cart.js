/**
 * Cart Service
 *
 * API calls for cart operations.
 * Uses api-client for request handling, browser-session for auth.
 */

import { domainRequest } from '$lib/utils/api-client.js';
import { postUpdateCart } from '$lib/utils/message-transport.js';
import { getHeaders } from './browser-session.js';

const SESSION_CART = 'FSSCAR';

/**
 * Save cart data to session storage
 * @param {Object} data - Cart data
 */
function saveCart(data) {
	if (data) {
		sessionStorage.setItem(SESSION_CART, JSON.stringify(data));
	}
}

/**
 * Gets the session cart from session storage.
 * @returns {Object|null} The session cart object, or null if not found.
 */
export function getSessionCart() {
	const value = sessionStorage.getItem(SESSION_CART);
	return value ? JSON.parse(value) : null;
}

/**
 * Sets the session cart in session storage.
 * @param {Object} value - The session cart object to set.
 */
export function setSessionCart(value) {
	sessionStorage.setItem(SESSION_CART, JSON.stringify(value));
}

/**
 * Transfers a cart session.
 * @param {Object} body - The request body.
 * @param {string} domain - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartSessionTransfer(body, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('session/transfer', domain, {
		method: 'POST',
		body,
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Gets the cart for a given domain.
 * @param {string} domain - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartGetCart(domain) {
	const { headers } = await getHeaders();
	return domainRequest('cart', domain, { headers });
}

/**
 * Adds a line item to the cart.
 * @param {string} sku - The SKU of the item to add.
 * @param {number} quantity - The quantity of the item to add.
 * @param {Array} [variantHandles=[]] - An array of variant handles.
 * @param {string} [domain] - The domain.
 * @param {boolean} [flushCart=false] - Indicates if the cart should be flushed.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartAddLineItem(
	sku,
	quantity,
	variantHandles = [],
	domain,
	flushCart = false
) {
	const { headers } = await getHeaders();
	const res = await domainRequest(
		`cart/line-items/${sku}/quantity/${quantity}?flush_cart=${flushCart}`,
		domain,
		{
			method: 'POST',
			body: { variant_handles: variantHandles },
			headers
		}
	);
	if (res.status === 200) saveCart(res.data);
	postUpdateCart();
	return res;
}

/**
 * Updates a SKU in the cart.
 * @param {string} sku - The SKU to update.
 * @param {number} quantity - The new quantity.
 * @param {Array} [variantHandles=[]] - An array of variant handles.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartUpdateSku(sku, quantity, variantHandles = [], domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest(`cart/line-items/${sku}`, domain, {
		method: 'PUT',
		body: { quantity, variant_handles: variantHandles },
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Clears the cart.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartClear(domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('cart/line-items', domain, { method: 'DELETE', headers });
	if (res.status === 200) saveCart(res.data);
	postUpdateCart();
	return res;
}

/**
 * Updates the shipping information for the cart.
 * @param {Object} body - The request body.
 * @param {string} domain - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartUpdateShippingInfo(body, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('cart/shipping-info', domain, {
		method: 'POST',
		body,
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Updates the delivery method for the cart.
 * @param {string} sku - The shipping method SKU.
 * @param {string} domain - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartUpdateDelivery(sku, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('cart/shipping-method', domain, {
		method: 'POST',
		body: { shipping_method: sku },
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Completes the order for the cart.
 * @param {string} paymentToken - The payment token.
 * @param {string} domain - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartCompleteOrder(paymentToken, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('cart/complete-order', domain, {
		method: 'POST',
		body: {
			payment_token: { id: paymentToken },
			vault_token: true
		},
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Gets the consents for the cart.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function getConsents(domain) {
	const { headers } = await getHeaders();
	return domainRequest('cart/consents', domain, { headers });
}

/**
 * Sets the consents for the cart.
 * @param {Object} consents - The consents to set.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function setConsents(consents, domain) {
	const { headers } = await getHeaders();
	return domainRequest('cart/consents', domain, {
		method: 'POST',
		body: consents,
		headers
	});
}

/**
 * Joins a session.
 * @param {string} password - The session password.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function sessionJoin(password, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('session/join', domain, {
		method: 'POST',
		body: { password },
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Creates an OTP for a session.
 * @param {string} email - The email address.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function sessionCreateOtp(email, domain) {
	const { headers } = await getHeaders();
	return domainRequest('session/create-otp', domain, {
		method: 'POST',
		body: { email },
		headers
	});
}

/**
 * Validates an OTP for a session.
 * @param {string} email - The email address.
 * @param {string} otp - The OTP.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function sessionValidateOtp(email, otp, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('session/validate-otp', domain, {
		method: 'POST',
		body: { email, otp },
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}

/**
 * Completes an order with a saved payment.
 * @param {string} paymentId - The payment ID.
 * @param {string} [domain] - The domain.
 * @returns {Promise<Object>} The response from the server.
 */
export async function cartSavedPaymentCompleteOrder(paymentId, domain) {
	const { headers } = await getHeaders();
	const res = await domainRequest('cart/complete-order-with-saved-payment', domain, {
		method: 'POST',
		body: { payment_id: paymentId },
		headers
	});
	if (res.status === 200) saveCart(res.data);
	return res;
}
