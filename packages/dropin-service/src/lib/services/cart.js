/**
 * @fileoverview Cart functions for managing the shopping cart.
 */

import { browserFetch } from './browser-fetch';
import { getHeaders } from './browser-session';
import { postUpdateCart } from './cross-messages';

let CART_HEALTH_CHECK_TIMERS = {};
const SESSION_CART = 'FSSCAR';
const PLATFORMS_TO_MAKE_CART_HEALTH_CHECK = ['sfcc'];

/**
 * Ping the cart, if necessary, to prevent it from being deleted by the merchant due to inactivity
 * TODO: Send event to backend to inform that we are making a health-check
 * @param {*} platform
 * @param {*} domain
 * @param {*} minutes
 */
function createOrResetCartHealtCheckTimer(platform, domain, minutes = 15) {
	if (PLATFORMS_TO_MAKE_CART_HEALTH_CHECK.includes(platform)) {
		clearTimeout(CART_HEALTH_CHECK_TIMERS[domain]);

		CART_HEALTH_CHECK_TIMERS[domain] = setTimeout(async () => {
			const cartResponse = await cartGetCart(domain, true);
			if (cartResponse.status == 200) {
				createOrResetCartHealtCheckTimer(platform, domain, minutes);
			}
		}, minutes * 60000);
	}
}

/**
 * Gets the session cart from session storage.
 * @returns {object|null} The session cart object, or null if not found.
 */
export function getSessionCart() {
	const value = sessionStorage.getItem(SESSION_CART);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

/**
 * Sets the session cart in session storage.
 * @param {object} value The session cart object to set.
 */
export function setSessionCart(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(SESSION_CART, js);
}

/**
 * Gets the domain URL for a given suffix and domain.
 * @param {string} suffix The URL suffix.
 * @param {string} domain The domain.
 * @returns {string} The complete domain URL.
 */
function getDomainUrl(suffix, domain) {
	return `${window.firmly.apiServer}/api/v1/domains/${domain || window.firmly.domain}/${suffix}`;
}

/**
 * Transfers a cart session.
 * @param {object} body The request body.
 * @param {string} domain The domain.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartSessionTransfer(body, domain) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('session/transfer', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Gets the cart for a given domain.
 * @param {string} domain The domain.
 * @param {boolean} healthCheckCall Indicates if this is a health check call.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartGetCart(domain, healthCheckCall = false) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('cart', domain), {
		...headers,
		method: 'GET'
	});

	// If this is already a health check call, we do not need to create a new one
	if (!healthCheckCall) {
		createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	}
	return res;
}

/**
 * Adds a line item to the cart.
 * @param {string} sku The SKU of the item to add.
 * @param {number} quantity The quantity of the item to add.
 * @param {array} variantHandles An array of variant handles.
 * @param {string} domain The domain.
 * @param {boolean} flushCart Indicates if the cart should be flushed.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartAddLineItem(
	sku,
	quantity,
	variantHandles = [],
	domain = undefined,
	flushCart = false
) {
	const headers = await getHeaders();
	const body = {
		variant_handles: variantHandles
	};
	const res = await browserFetch(
		getDomainUrl(`cart/line-items/${sku}/quantity/${quantity}?flush_cart=${flushCart}`, domain),
		{
			...headers,
			method: 'POST',
			body: JSON.stringify(body)
		}
	);
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	postUpdateCart();
	return res;
}

/**
 * Updates a SKU in the cart.
 * @param {string} sku The SKU to update.
 * @param {number} quantity The new quantity.
 * @param {array} variantHandles An array of variant handles.
 * @param {string} domain The domain.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartUpdateSku(sku, quantity, variantHandles = [], domain = undefined) {
	const headers = await getHeaders();
	const body = {
		quantity: quantity,
		variant_handles: variantHandles
	};
	const res = await browserFetch(getDomainUrl(`cart/line-items/${sku}`, domain), {
		...headers,
		method: 'PUT',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Clears the cart.
 * @param {string} domain The domain.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartClear(domain = undefined) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl(`cart/line-items`, domain), {
		...headers,
		method: 'DELETE'
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	postUpdateCart();
	return res;
}

/**
 * Updates the shipping information for the cart.
 * @param {object} body The request body.
 * @param {string} domain The domain.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartUpdateShippingInfo(body, domain) {
	const headers = await getHeaders();
	const res = await browserFetch(getDomainUrl('cart/shipping-info', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Updates the delivery method for the cart.
 * @param {string} sku The shipping method SKU.
 * @param {string} domain The domain.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartUpdateDelivery(sku, domain) {
	const headers = await getHeaders();
	const body = {
		shipping_method: sku
	};
	const res = await browserFetch(getDomainUrl('cart/shipping-method', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Completes the order for the cart.
 * @param {string} paymentToken The payment token.
 * @param {string} domain The domain.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartCompleteOrder(paymentToken, domain) {
	const headers = await getHeaders();
	const body = {
		payment_token: { id: paymentToken },
		vault_token: true
	};
	const res = await browserFetch(getDomainUrl('cart/complete-order', domain), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Gets the consents for the cart.
 * @returns {Promise<object>} The response from the server.
 */
export async function getConsents() {
	const headers = await getHeaders();

	const res = await browserFetch(getDomainUrl('cart/consents'), {
		...headers,
		method: 'GET'
	});

	return res;
}

/**
 * Sets the consents for the cart.
 * @param {object} consents The consents to set.
 * @returns {Promise<object>} The response from the server.
 */
export async function setConsents(consents) {
	const headers = await getHeaders();

	const res = await browserFetch(getDomainUrl('cart/consents'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(consents)
	});

	return res;
}

/**
 * Joins a session.
 * @param {string} password The session password.
 * @returns {Promise<object>} The response from the server.
 */
export async function sessionJoin(password) {
	const headers = await getHeaders();
	const body = {
		password
	};
	const res = await browserFetch(getDomainUrl('session/join'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Creates an OTP for a session.
 * @param {string} email The email address.
 * @returns {Promise<object>} The response from the server.
 */
export async function sessionCreateOtp(email) {
	const headers = await getHeaders();
	const body = {
		email
	};
	const res = await browserFetch(getDomainUrl('session/create-otp'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

/**
 * Validates an OTP for a session.
 * @param {string} email The email address.
 * @param {string} otp The OTP.
 * @returns {Promise<object>} The response from the server.
 */
export async function sessionValidateOtp(email, otp) {
	const headers = await getHeaders();
	const body = {
		email,
		otp
	};
	const res = await browserFetch(getDomainUrl('session/validate-otp'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}

/**
 * Completes an order with a saved payment.
 * @param {string} paymentId The payment ID.
 * @returns {Promise<object>} The response from the server.
 */
export async function cartSavedPaymentCompleteOrder(paymentId) {
	const headers = await getHeaders();
	const body = {
		payment_id: paymentId
	};
	const res = await browserFetch(getDomainUrl('cart/complete-order-with-saved-payment'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	if (res.status == 200) {
		setSessionCart(res.data);
	}

	createOrResetCartHealtCheckTimer(res.data?.platform_id, res.data?.shop_id);
	return res;
}
