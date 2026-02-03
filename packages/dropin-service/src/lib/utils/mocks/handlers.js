import { http, HttpResponse } from 'msw';
import {
	mockCartBlank,
	mockCartWithShipping,
	mockOrder,
	mockC2PCards,
	mockPayPalShippingInfo
} from './mock-data.js';

let configuratorInstance = null;
let currentCartState = {
	shipping_info: null,
	billing_info: null,
	payment_method: null
};

export function setConfiguratorForHandlers(configurator) {
	configuratorInstance = configurator;
}

export function resetCartState() {
	currentCartState = {
		shipping_info: null,
		billing_info: null,
		payment_method: null
	};
}

function getFeatures() {
	if (!configuratorInstance) return { promo_codes: true, paypal: true };
	return {
		promo_codes: configuratorInstance.features.promoCodes,
		paypal: configuratorInstance.features.paypal
	};
}

function getShopProperties() {
	const features = getFeatures();
	return {
		paypal: features.paypal
			? {
					sandbox: true,
					payment_enabled: true
				}
			: null
	};
}

function getRequestName(url) {
	const pathname = new URL(url).pathname;

	if (pathname.includes('/cart/shipping-info')) return 'Update Shipping Info';
	if (pathname.includes('/cart/shipping-method')) return 'Update Shipping Method';
	if (pathname.includes('/cart/line-items')) return 'Update Line Item';
	if (pathname.includes('/cart/promo-codes')) return 'Promo Code';
	if (pathname.includes('/cart/complete-order-with-saved-payment'))
		return 'Complete Order (Saved Payment)';
	if (pathname.includes('/cart/complete-order')) return 'Complete Order';
	if (pathname.includes('/cart')) return 'Get Cart';
	if (pathname.includes('/addresses') && pathname.split('/').length > 5)
		return 'Get Address Details';
	if (pathname.includes('/addresses')) return 'Search Addresses';
	if (pathname.includes('/payment/key')) return 'Get Payment Key';
	if (pathname.includes('/paypal-complete-order')) return 'Complete Order (PayPal)';
	if (pathname.includes('/wallet-complete-order')) return 'Complete Order (Wallet)';
	if (pathname.includes('/express/paypal/complete-order')) return 'PayPal Express Complete';
	if (pathname.includes('/express/paypal/authorize')) return 'PayPal Express Authorize';
	if (pathname.includes('/express/paypal/start')) return 'PayPal Express Start';
	if (pathname.includes('/browser-session')) return 'Browser Session';

	return 'API Request';
}

async function handleRequest(requestName, url, method, responseBuilder) {
	if (!configuratorInstance) {
		return responseBuilder();
	}

	try {
		await configuratorInstance.addRequest(requestName, {
			url: url.toString(),
			method
		});

		return responseBuilder();
	} catch (error) {
		return HttpResponse.json({ error: error.message || 'Request rejected' }, { status: 400 });
	}
}

export const handlers = [
	// 1. CART OPERATIONS

	// Get cart
	http.get('*/cart', async ({ request }) => {
		const url = new URL(request.url);
		return handleRequest(getRequestName(url.href), url, 'GET', () => {
			const cart = {
				...mockCartBlank,
				features: getFeatures(),
				shop_properties: getShopProperties()
			};
			return HttpResponse.json(cart);
		});
	}),

	// Update line item (quantity/remove)
	http.put('*/cart/line-items/:sku', async ({ request, params }) => {
		const url = new URL(request.url);
		const body = await request.json();

		return handleRequest(getRequestName(url.href), url, 'PUT', () => {
			const updatedCart = {
				...mockCartBlank,
				features: getFeatures(),
				shop_properties: getShopProperties()
			};
			const lineItem = updatedCart.line_items.find((item) => item.sku === params.sku);

			if (lineItem && body.quantity === 0) {
				updatedCart.line_items = updatedCart.line_items.filter(
					(item) => item.sku !== params.sku
				);
			} else if (lineItem) {
				lineItem.quantity = body.quantity;
				lineItem.line_price.value = lineItem.price.value * body.quantity;
			}

			const newSubTotal = updatedCart.line_items.reduce(
				(sum, item) => sum + item.line_price.value,
				0
			);
			updatedCart.sub_total.value = newSubTotal;
			updatedCart.total.value =
				newSubTotal + updatedCart.shipping_total.value + updatedCart.tax.value;

			return HttpResponse.json(updatedCart);
		});
	}),

	// Update shipping info
	http.post('*/cart/shipping-info', async ({ request }) => {
		const url = new URL(request.url);
		const body = await request.json();

		return handleRequest(getRequestName(url.href), url, 'POST', () => {
			currentCartState.shipping_info = body;

			return HttpResponse.json({
				...mockCartWithShipping,
				features: getFeatures(),
				shop_properties: getShopProperties(),
				shipping_info: body,
				...(currentCartState.payment_method && {
					payment_method: currentCartState.payment_method
				})
			});
		});
	}),

	// Update shipping method
	http.post('*/cart/shipping-method', async ({ request }) => {
		const url = new URL(request.url);
		const body = await request.json();

		return handleRequest(getRequestName(url.href), url, 'POST', () => {
			const selectedMethod = mockCartWithShipping.shipping_method_options.find(
				(method) => method.sku === body.shipping_method
			);

			return HttpResponse.json({
				...mockCartWithShipping,
				features: getFeatures(),
				shop_properties: getShopProperties(),
				...(currentCartState.shipping_info && {
					shipping_info: currentCartState.shipping_info
				}),
				...(currentCartState.billing_info && {
					billing_info: currentCartState.billing_info
				}),
				...(currentCartState.payment_method && {
					payment_method: currentCartState.payment_method
				}),
				shipping_method: selectedMethod || mockCartWithShipping.shipping_method_options[0],
				shipping_total: selectedMethod
					? selectedMethod.price
					: mockCartWithShipping.shipping_method_options[0].price,
				total: {
					currency: 'USD',
					value:
						mockCartWithShipping.sub_total.value + (selectedMethod?.price.value || 5.99)
				}
			});
		});
	}),

	// Complete order with saved payment
	http.post('*/cart/complete-order-with-saved-payment', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'POST', () =>
			HttpResponse.json(mockOrder)
		);
	}),

	// 2. PROMO CODE OPERATIONS

	// Add promo code
	http.post('*/cart/promo-codes', async ({ request }) => {
		const url = new URL(request.url);
		const body = await request.json();

		return handleRequest(getRequestName(url.href), url, 'POST', () => {
			const discount = 20; // $20 or 20% off
			return HttpResponse.json({
				...mockCartWithShipping,
				features: getFeatures(),
				shop_properties: getShopProperties(),
				promo_codes: body.promo_codes,
				cart_discount: { currency: 'USD', value: discount },
				total: {
					currency: 'USD',
					value: mockCartWithShipping.total.value - discount
				}
			});
		});
	}),

	// Remove promo codes
	http.delete('*/cart/promo-codes', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'DELETE', () =>
			HttpResponse.json({
				...mockCartWithShipping,
				features: getFeatures(),
				shop_properties: getShopProperties(),
				promo_codes: [],
				cart_discount: { currency: 'USD', value: 0 }
			})
		);
	}),

	// 3. ADDRESS AUTOCOMPLETE

	// Search addresses
	http.get('*/addresses', async ({ request }) => {
		const url = new URL(request.url);
		const query = url.searchParams.get('q');

		if (!query || query.length < 4) {
			return HttpResponse.json({ predictions: [] });
		}

		return handleRequest(getRequestName(url.href), url, 'GET', () =>
			HttpResponse.json({
				predictions: [
					{
						id: 'addr-001',
						address: '123 Demo Street, Seattle, WA 98101',
						address1: '123 Demo Street'
					},
					{
						id: 'addr-002',
						address: '456 Oak Avenue, Portland, OR 97201',
						address1: '456 Oak Avenue'
					},
					{
						id: 'addr-003',
						address: '789 Pine Road, San Francisco, CA 94102',
						address1: '789 Pine Road'
					}
				]
			})
		);
	}),

	// Get address details
	http.get('*/addresses/:id', async ({ request, params }) => {
		const url = new URL(request.url);

		const addresses = {
			'addr-001': {
				address1: '123 Demo Street',
				address2: '',
				city: 'Seattle',
				state_or_province: 'WA',
				postal_code: '98101',
				country: 'US'
			},
			'addr-002': {
				address1: '456 Oak Avenue',
				address2: '',
				city: 'Portland',
				state_or_province: 'OR',
				postal_code: '97201',
				country: 'US'
			},
			'addr-003': {
				address1: '789 Pine Road',
				address2: '',
				city: 'San Francisco',
				state_or_province: 'CA',
				postal_code: '94102',
				country: 'US'
			}
		};

		return handleRequest(getRequestName(url.href), url, 'GET', () =>
			HttpResponse.json(addresses[params.id] || addresses['addr-001'])
		);
	}),

	// 4. ORDER PLACEMENT

	// Get payment encryption key
	// Valid RSA-2048 public key for mock encryption (from RFC 7517 example)
	http.get('*/payment/key', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'GET', () =>
			HttpResponse.json({
				kty: 'RSA',
				e: 'AQAB',
				use: 'enc',
				kid: 'mock-key-001',
				alg: 'RSA-OAEP-256',
				n: '0vx7agoebGcQSuuPiLJXZptN9nndrQmbXEps2aiAFbWhM78LhWx4cbbfAAtVT86zwu1RK7aPFFxuhDR1L6tSoc_BJECPebWKRXjBZCiFV4n3oknjhMstn64tZ_2W-5JsGY4Hc5n9yBXArwl93lqt7_RN5w6Cf0h4QyQ5v-65YGjQR0_FDW2QvzqY368QQMicAtaSqzs8KJZgnYb9c7d0zgdAZHzu6qMQvRL5hajrn1n91CbOpbISD08qNLyrdkt-bFTWhAI4vMQFh6WeZu0fM4lFd2NcRwr3XPksINHaQ-G_xBniIqbw0Ls1jF44-csFCur-kEgU8awapJzKnqDKgw'
			})
		);
	}),

	// Complete order with credit card
	http.post('*/payment/domains/*/complete-order', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'POST', () =>
			HttpResponse.json(mockOrder)
		);
	}),

	// Complete order with PayPal
	http.post('*/payment/domains/*/paypal-complete-order', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'POST', () =>
			HttpResponse.json({
				...mockOrder,
				shipping_info: mockPayPalShippingInfo,
				billing_info: mockPayPalShippingInfo,
				payment_summary: {
					payment_type: 'PayPal',
					email: mockPayPalShippingInfo.email,
					payer_id: 'PAYERID123'
				}
			})
		);
	}),

	// Complete order with wallet (Click-to-Pay)
	http.post('*/payment/domains/*/wallet-complete-order', async ({ request }) => {
		const url = new URL(request.url);
		const body = await request.json();

		return handleRequest(getRequestName(url.href), url, 'POST', () => {
			const card = mockC2PCards.find((c) => c.id === body.credit_card_id) || mockC2PCards[0];

			if (card?.requiresCvv) {
				if (!body.verification_value) {
					return HttpResponse.json({ cvv_required: true });
				}
				// Validate that encrypted CVV was provided (it will be a non-empty string)
				if (
					typeof body.verification_value !== 'string' ||
					body.verification_value.length < 10
				) {
					return HttpResponse.json(
						{ description: 'Invalid CVV format' },
						{ status: 400 }
					);
				}
			}

			return HttpResponse.json({
				...mockOrder,
				payment_summary: {
					payment_type: 'CreditCard',
					card_holder_name: 'Click to Pay User',
					first_four: card.first4,
					last_four: card.last4,
					month: parseInt(card.month, 10),
					year: parseInt(card.year, 10),
					card_type: card.brand,
					wallet: 'c2p',
					art: card.art
				}
			});
		});
	}),

	// 5. PAYPAL EXPRESS

	// Start PayPal order
	http.post('*/express/paypal/start', async ({ request }) => {
		const url = new URL(request.url);
		const paypalToken = 'MOCK-PAYPAL-TOKEN-' + Date.now();

		return handleRequest(getRequestName(url.href), url, 'POST', () =>
			HttpResponse.json({
				id: 'PAYPAL-ORDER-001',
				status: 'CREATED',
				payment_method: {
					attributes: {
						paypal_token: paypalToken
					}
				},
				links: [
					{
						rel: 'approve',
						href: `https://www.sandbox.paypal.com/checkoutnow?token=${paypalToken}`
					}
				]
			})
		);
	}),

	// Authorize PayPal payment
	http.post('*/express/paypal/authorize', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'POST', () => {
			currentCartState.shipping_info = mockPayPalShippingInfo;
			currentCartState.billing_info = mockPayPalShippingInfo;
			currentCartState.payment_method = {
				type: 'PayPal',
				wallet: 'paypal',
				attributes: {
					payer_id: 'PAYERID123',
					email: mockPayPalShippingInfo.email
				}
			};

			return HttpResponse.json({
				...mockCartWithShipping,
				features: getFeatures(),
				shop_properties: getShopProperties(),
				shipping_info: currentCartState.shipping_info,
				billing_info: currentCartState.billing_info,
				payer: {
					email_address: mockPayPalShippingInfo.email,
					payer_id: 'PAYERID123'
				},
				payment_method: currentCartState.payment_method
			});
		});
	}),

	// Complete PayPal express order
	http.post('*/express/paypal/complete-order', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'POST', () =>
			HttpResponse.json({
				...mockOrder,
				shipping_info: mockPayPalShippingInfo,
				billing_info: mockPayPalShippingInfo,
				payment_summary: {
					payment_type: 'PayPal',
					email: mockPayPalShippingInfo.email,
					payer_id: 'PAYERID123'
				}
			})
		);
	}),

	// 6. BROWSER SESSION

	// Create/refresh browser session
	http.post('*/browser-session', async ({ request }) => {
		const url = new URL(request.url);

		return handleRequest(getRequestName(url.href), url, 'POST', () =>
			HttpResponse.json({
				access_token: 'mock-access-token-' + Date.now(),
				device_id: 'mock-device-id',
				expires_in: 3600
			})
		);
	})
];
