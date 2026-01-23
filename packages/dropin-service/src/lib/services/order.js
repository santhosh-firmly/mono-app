/**
 * Order Service
 *
 * API calls for placing and managing orders.
 * Uses JWE encryption for secure credit card handling.
 */

import { config } from '$lib/utils/config.js';
import { importJWKKey, encryptPayload } from '$lib/utils/jwe.js';
import { getHeaders } from './browser-session.js';
import { cartSavedPaymentCompleteOrder } from './cart.js';

let cachedPublicKey = null;
let cachedJwkKey = null;

function getCCServer() {
	return config.ccServer || config.apiServer?.replace('api', 'cc');
}

function getCCUrl(suffix, domain) {
	return `${getCCServer()}/api/v1/payment/domains/${domain}/${suffix}`;
}

async function fetchPaymentKey() {
	const ccServer = getCCServer();
	if (!ccServer) {
		throw new Error('Payment server not configured');
	}

	const response = await fetch(`${ccServer}/api/v1/payment/key`);
	if (!response.ok) {
		throw new Error('Failed to fetch payment key');
	}

	cachedJwkKey = await response.json();
	cachedPublicKey = await importJWKKey(cachedJwkKey);
}

async function encryptCreditCard(creditCard, billingInfo) {
	if (!cachedPublicKey) {
		await fetchPaymentKey();
	}

	const encryptedCard = await encryptPayload(creditCard, cachedPublicKey, cachedJwkKey.kid);

	return {
		billing_info: billingInfo,
		encrypted_card: encryptedCard
	};
}

export async function placeOrderWithCreditCard(domain, creditCard, billingInfo) {
	try {
		if (!getCCServer()) {
			return { success: false, error: 'Payment server not configured' };
		}

		const ccInfo = {
			number: creditCard.number.replace(/\s/g, ''),
			exp_month: creditCard.expMonth,
			exp_year: creditCard.expYear,
			verification_value: creditCard.cvv
		};

		const encryptedPayload = await encryptCreditCard(ccInfo, billingInfo);
		const { headers } = await getHeaders();

		const response = await fetch(getCCUrl('complete-order', domain), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(encryptedPayload)
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data?.description || data?.message || 'Failed to place order'
			};
		}

		return {
			success: true,
			order: data,
			redirectUrl: data?.urls?.thank_you_page
		};
	} catch (error) {
		return {
			success: false,
			error: error.message || 'An unexpected error occurred'
		};
	}
}

export async function placeOrderWithSavedCard(domain, cardId) {
	try {
		const orderRes = await cartSavedPaymentCompleteOrder(cardId, domain);

		if (orderRes.status !== 200) {
			return {
				success: false,
				error:
					orderRes.data?.description || orderRes.data?.message || 'Failed to place order'
			};
		}

		return {
			success: true,
			order: orderRes.data,
			redirectUrl: orderRes.data?.urls?.thank_you_page
		};
	} catch (error) {
		return {
			success: false,
			error: error.message || 'An unexpected error occurred'
		};
	}
}

export async function placeOrderWithPayPal(domain) {
	try {
		const { headers } = await getHeaders();
		const response = await fetch(getCCUrl('paypal-complete-order', domain), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify({})
		});

		const data = await response.json();

		if (!response.ok) {
			return {
				success: false,
				error: data?.description || data?.message || 'Failed to complete PayPal order'
			};
		}

		return {
			success: true,
			order: data,
			redirectUrl: data?.urls?.thank_you_page
		};
	} catch (error) {
		return {
			success: false,
			error: error.message || 'An unexpected error occurred'
		};
	}
}

export async function placeOrderWithC2P(domain, c2pData, cvv = null) {
	try {
		const { headers } = await getHeaders();
		const payload = { ...c2pData };

		if (cvv) {
			if (!cachedPublicKey) {
				await fetchPaymentKey();
			}
			payload.verification_value = await encryptPayload(
				{ verification_value: cvv },
				cachedPublicKey,
				cachedJwkKey.kid
			);
		}

		const response = await fetch(getCCUrl('wallet-complete-order', domain), {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', ...headers },
			body: JSON.stringify(payload)
		});

		const data = await response.json();

		if (data?.cvv_required) {
			return {
				success: false,
				cvvRequired: true,
				cardId: c2pData.credit_card_id
			};
		}

		if (!response.ok) {
			return {
				success: false,
				error: data?.description || data?.message || 'Failed to complete Click-to-Pay order'
			};
		}

		return {
			success: true,
			order: data,
			redirectUrl: data?.urls?.thank_you_page
		};
	} catch (error) {
		return {
			success: false,
			error: error.message || 'An unexpected error occurred'
		};
	}
}
