export const mockPayPalShippingInfo = {
	first_name: 'PayPal',
	last_name: 'User',
	email: 'paypal.user@example.com',
	phone: '(555) 123-4567',
	address1: '1 PayPal Way',
	address2: null,
	city: 'San Jose',
	state_or_province: 'CA',
	postal_code: '95131',
	country: 'United States'
};

export const mockC2PCards = [
	{
		expired: false,
		type: 'CreditCard',
		wallet: 'c2p',
		provider: 'mastercard',
		brand: 'Mastercard',
		art: null,
		id: 'c2p-card-001',
		last4: '5678',
		last_four: '5678',
		first4: '5412',
		month: '12',
		year: '2027',
		card_type: 'CREDIT',
		fromC2P: true,
		billing_info: {
			first_name: null,
			last_name: null,
			address1: '***Demo St',
			address2: null,
			city: 'Seattle',
			state_or_province: 'WA',
			postal_code: '98***',
			country: 'United States',
			email: null
		}
	},
	{
		expired: false,
		type: 'CreditCard',
		wallet: 'c2p',
		provider: 'visa',
		brand: 'Visa',
		art: null,
		id: 'c2p-card-002',
		last4: '4242',
		last_four: '4242',
		first4: '4111',
		month: '08',
		year: '2026',
		card_type: 'CREDIT',
		fromC2P: true,
		billing_info: {
			first_name: null,
			last_name: null,
			address1: '***Oak Ave',
			address2: null,
			city: 'Portland',
			state_or_province: 'OR',
			postal_code: '97***',
			country: 'United States',
			email: null
		}
	},
	{
		expired: false,
		type: 'CreditCard',
		wallet: 'c2p',
		provider: 'amex',
		brand: 'American Express',
		art: null,
		id: 'c2p-card-003',
		last4: '1234',
		last_four: '1234',
		first4: '3782',
		month: '06',
		year: '2028',
		card_type: 'CREDIT',
		fromC2P: true,
		requiresCvv: true,
		billing_info: {
			first_name: null,
			last_name: null,
			address1: '***Main St',
			address2: null,
			city: 'New York',
			state_or_province: 'NY',
			postal_code: '10***',
			country: 'United States',
			email: null
		}
	}
];

export const mockCartBlank = {
	display_name: 'Demo Store',
	cart_status: 'active',
	platform_id: 'demo',
	shop_id: 'demo-store',
	shop_properties: {
		paypal: {
			sandbox: true,
			payment_enabled: true
		}
	},
	cart_id: 'mock-cart-001',
	urls: {},
	line_items: [
		{
			sku: 'DEMO-001',
			base_sku: 'DEMO-001',
			quantity: 2,
			msrp: { currency: 'USD', value: 45 },
			price: { currency: 'USD', value: 45 },
			line_price: { currency: 'USD', value: 90 },
			line_discount: { currency: 'USD', value: 0 },
			requires_shipping: true,
			image: {
				url: 'https://cdn-havaianas-global-3.yapoli.com/4148491-farm-samba-das-araras-23-0090-0.png?d=140x140&t=webP',
				alt: 'Product Image'
			},
			platform_line_item_id: 'line-001',
			description: 'Demo Product - Blue',
			variant_description: 'Color: Blue, Size: M',
			line_item_id: 'line-001'
		},
		{
			sku: 'DEMO-002',
			base_sku: 'DEMO-002',
			quantity: 1,
			msrp: { currency: 'USD', value: 38 },
			price: { currency: 'USD', value: 38 },
			line_price: { currency: 'USD', value: 38 },
			line_discount: { currency: 'USD', value: 0 },
			requires_shipping: true,
			image: {
				url: 'https://cdn-havaianas-global-3.yapoli.com/4148491-farm-samba-das-araras-23-0090-0.png?d=140x140&t=webP',
				alt: 'Product Image'
			},
			platform_line_item_id: 'line-002',
			description: 'Demo Product - Red',
			variant_description: 'Color: Red, Size: L',
			line_item_id: 'line-002'
		}
	],
	total: { currency: 'USD', value: 128 },
	sub_total: { currency: 'USD', value: 128 },
	shipping_total: { currency: 'USD', value: 0 },
	tax: { currency: 'USD', value: 0 },
	cart_discount: { currency: 'USD', value: 0 },
	payment_method_options: [{ type: 'CreditCard', wallet: 'user' }]
};

export const mockCartWithShipping = {
	...mockCartBlank,
	shipping_info: {
		first_name: 'John',
		last_name: 'Smith',
		phone: '(206) 555-1212',
		address1: '123 Demo Street',
		city: 'Seattle',
		state_or_province: 'WA',
		country: 'United States',
		postal_code: '98101',
		email: 'john@example.com'
	},
	shipping_method: {
		sku: 'standard-shipping',
		description: 'Standard Shipping',
		price: { currency: 'USD', value: 5.99 }
	},
	shipping_method_options: [
		{
			sku: 'standard-shipping',
			description: 'Standard Shipping (5-7 days)',
			price: { currency: 'USD', value: 5.99 }
		},
		{
			sku: 'express-shipping',
			description: 'Express Shipping (2-3 days)',
			price: { currency: 'USD', value: 12.99 }
		},
		{
			sku: 'overnight-shipping',
			description: 'Overnight Shipping',
			price: { currency: 'USD', value: 24.99 }
		}
	],
	shipping_total: { currency: 'USD', value: 5.99 },
	total: { currency: 'USD', value: 133.99 },
	payment_method_options: [
		{ type: 'CreditCard', wallet: 'user' },
		{
			type: 'CreditCard',
			wallet: 'shoppay',
			id: 'card-001',
			last_four: '4242',
			month: 12,
			year: 2028,
			card_type: 'visa',
			billing_info: {
				first_name: 'John',
				last_name: 'Smith',
				address1: '123 Demo Street',
				city: 'Seattle',
				state_or_province: 'WA',
				postal_code: '98101',
				country: 'United States'
			}
		}
	]
};

export const mockOrder = {
	...mockCartWithShipping,
	id: 'order-mock-001',
	urls: {
		thank_you_page: 'https://demo-store.com/thank-you'
	},
	platform_order_number: 'ORD-123456',
	total: '133.99',
	totals: {
		total: '133.99',
		currency: '$'
	},
	billing_info: {
		first_name: 'John',
		last_name: 'Smith',
		email: 'john@example.com',
		phone: '(206) 555-1212',
		address1: '123 Demo Street',
		city: 'Seattle',
		state_or_province: 'WA',
		postal_code: '98101',
		country: 'United States'
	},
	payment_summary: {
		payment_type: 'CreditCard',
		card_holder_name: 'John Smith',
		first_four: '4242',
		last_four: '4242',
		month: 12,
		year: 2028,
		card_type: 'Visa'
	},
	line_items: [
		{
			id: 'line-001',
			name: 'Demo Product - Blue',
			quantity: 2,
			image_url:
				'https://cdn-havaianas-global-3.yapoli.com/4148491-farm-samba-das-araras-23-0090-0.png?d=140x140&t=webP',
			price: { value: '45.00', currency: '$' }
		},
		{
			id: 'line-002',
			name: 'Demo Product - Red',
			quantity: 1,
			image_url:
				'https://cdn-havaianas-global-3.yapoli.com/4148491-farm-samba-das-araras-23-0090-0.png?d=140x140&t=webP',
			price: { value: '38.00', currency: '$' }
		}
	]
};

export function getCartForState(state) {
	switch (state) {
		case 'Blank':
			return { ...mockCartBlank };
		case 'Skeleton':
			return null;
		case 'Updt Ship':
			return { ...mockCartBlank, _updatingShipping: true };
		case 'Updt Method':
			return { ...mockCartWithShipping, _updatingMethod: true };
		case 'Placing Order':
			return { ...mockCartWithShipping, _placingOrder: true };
		case 'Thank You':
			return { ...mockOrder };
		default:
			return { ...mockCartBlank };
	}
}

export function applyFeaturesToCart(cart, features) {
	if (!cart) return cart;

	const updatedCart = { ...cart };
	const paymentOptions = [{ type: 'CreditCard', wallet: 'user' }];

	if (features.shopPay) {
		paymentOptions.push({ type: 'ShopPay', wallet: 'shoppay' });
	}

	if (features.payPal) {
		paymentOptions.push({ type: 'PayPal', wallet: 'paypal' });
	}

	updatedCart.payment_method_options = paymentOptions;
	updatedCart.requires_shipping = features.shipping;

	if (features.login) {
		updatedCart.session = { requires_login: true };
	}

	return updatedCart;
}
