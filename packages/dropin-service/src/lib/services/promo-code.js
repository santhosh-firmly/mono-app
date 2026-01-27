/**
 * Promo Code Service
 *
 * API calls for promo code operations.
 * Uses api-client for DRY request handling.
 */

import { domainRequest } from '$lib/utils/api-client.js';
import { getHeaders } from './browser-session.js';

/**
 * Add a promo code to the cart
 * @param {string} promoCode - The promo code to add
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function addPromoCode(promoCode, domain) {
	if (!promoCode) {
		return { status: 400, data: null };
	}

	try {
		const { headers } = await getHeaders();
		return await domainRequest('cart/promo-codes', domain, {
			method: 'POST',
			body: { promo_codes: [promoCode] },
			headers
		});
	} catch (error) {
		console.error('Add promo code error:', error);
		return { status: 500, data: null };
	}
}

/**
 * Remove all promo codes from the cart
 * @param {string} domain - The merchant domain
 * @returns {Promise<{status: number, data: Object}>}
 */
export async function removeAllPromoCodes(domain) {
	try {
		const { headers } = await getHeaders();
		return await domainRequest('cart/promo-codes', domain, {
			method: 'DELETE',
			headers
		});
	} catch (error) {
		console.error('Remove promo codes error:', error);
		return { status: 500, data: null };
	}
}
