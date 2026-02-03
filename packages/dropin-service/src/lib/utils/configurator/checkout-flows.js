const MOCK_USER = {
	email: 'demo@example.com',
	name: 'John Demo',
	address: '123 Demo Street',
	city: 'Seattle',
	state: 'WA',
	zip: '98101',
	phone: '2065551234'
};

const MOCK_CARD = {
	number: '4111111111111111',
	expiration: '1228',
	cvv: '123'
};

export const CHECKOUT_FLOWS = {
	simple: {
		id: 'simple',
		name: 'Simple Checkout',
		description: 'Basic checkout with card payment',
		featureConfig: {
			promoCodes: false,
			paypal: false,
			clickToPay: false
		},
		steps: [
			{ action: 'type', selector: '[autocomplete="shipping email"]', value: MOCK_USER.email },
			{ action: 'wait', ms: 800 },
			{ action: 'type', selector: '[autocomplete="shipping name"]', value: MOCK_USER.name },
			{
				action: 'type',
				selector: '[autocomplete="shipping address-line1"]',
				value: MOCK_USER.address
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level2"]',
				value: MOCK_USER.city
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping postal-code"]',
				value: MOCK_USER.zip
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level1"]',
				value: MOCK_USER.state
			},
			{ action: 'type', selector: '[autocomplete="shipping tel"]', value: MOCK_USER.phone },
			{ action: 'wait', ms: 1500 },
			{
				action: 'type',
				selector: '[placeholder="4111 4111 4111 4111"]',
				value: MOCK_CARD.number
			},
			{ action: 'type', selector: '[placeholder="MM / YY"]', value: MOCK_CARD.expiration },
			{ action: 'type', selector: '[placeholder="CVC"]', value: MOCK_CARD.cvv },
			{ action: 'wait', ms: 500 },
			{ action: 'click', selector: 'button[type="submit"]' },
			{ action: 'waitForText', text: 'Thank You!', timeout: 5000 }
		]
	},

	withPromo: {
		id: 'withPromo',
		name: 'Checkout with Promo',
		description: 'Apply a promo code during checkout',
		featureConfig: {
			promoCodes: true,
			paypal: false,
			clickToPay: false
		},
		steps: [
			{ action: 'type', selector: '[autocomplete="shipping email"]', value: MOCK_USER.email },
			{ action: 'wait', ms: 800 },
			{ action: 'type', selector: '[autocomplete="shipping name"]', value: MOCK_USER.name },
			{
				action: 'type',
				selector: '[autocomplete="shipping address-line1"]',
				value: MOCK_USER.address
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level2"]',
				value: MOCK_USER.city
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping postal-code"]',
				value: MOCK_USER.zip
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level1"]',
				value: MOCK_USER.state
			},
			{ action: 'type', selector: '[autocomplete="shipping tel"]', value: MOCK_USER.phone },
			{ action: 'wait', ms: 1500 },
			{ action: 'clickByText', tagName: 'button', text: 'promotion code' },
			{ action: 'wait', ms: 300 },
			{
				action: 'type',
				selector: 'input[placeholder="Add promotion code"]',
				value: 'SAVE20'
			},
			{ action: 'clickByText', tagName: 'button', text: 'Apply' },
			{ action: 'wait', ms: 1000 },
			{
				action: 'type',
				selector: '[placeholder="4111 4111 4111 4111"]',
				value: MOCK_CARD.number
			},
			{ action: 'type', selector: '[placeholder="MM / YY"]', value: MOCK_CARD.expiration },
			{ action: 'type', selector: '[placeholder="CVC"]', value: MOCK_CARD.cvv },
			{ action: 'wait', ms: 500 },
			{ action: 'click', selector: 'button[type="submit"]' },
			{ action: 'waitForText', text: 'Thank You!', timeout: 5000 }
		]
	},

	clickToPay: {
		id: 'clickToPay',
		name: 'Click to Pay',
		description: 'Checkout using saved C2P cards (no CVV)',
		featureConfig: {
			promoCodes: false,
			paypal: false,
			clickToPay: true
		},
		steps: [
			{
				action: 'type',
				selector: '[autocomplete="shipping email"]',
				value: 'c2p@example.com'
			},
			{ action: 'wait', ms: 500 },
			{ action: 'click', selector: '[autocomplete="shipping name"]' },
			{ action: 'wait', ms: 1500 },
			{
				action: 'waitForElement',
				selector: 'input[aria-label="OTP digit 1"]',
				timeout: 8000
			},
			{ action: 'type', selector: 'input[aria-label="OTP digit 1"]', value: '1' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 2"]', value: '2' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 3"]', value: '3' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 4"]', value: '4' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 5"]', value: '5' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 6"]', value: '6' },
			{ action: 'wait', ms: 2000 },
			{ action: 'click', selector: 'input[name="saved-card"]' },
			{ action: 'wait', ms: 500 },
			{ action: 'type', selector: '[autocomplete="shipping name"]', value: MOCK_USER.name },
			{
				action: 'type',
				selector: '[autocomplete="shipping address-line1"]',
				value: MOCK_USER.address
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level2"]',
				value: MOCK_USER.city
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping postal-code"]',
				value: MOCK_USER.zip
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level1"]',
				value: MOCK_USER.state
			},
			{ action: 'type', selector: '[autocomplete="shipping tel"]', value: MOCK_USER.phone },
			{ action: 'wait', ms: 1500 },
			{ action: 'click', selector: 'button[type="submit"]' },
			{ action: 'waitForText', text: 'Thank You!', timeout: 5000 }
		]
	},

	clickToPayWithCvv: {
		id: 'clickToPayWithCvv',
		name: 'Click to Pay (CVV)',
		description: 'Checkout using C2P card requiring CVV',
		featureConfig: {
			promoCodes: false,
			paypal: false,
			clickToPay: true
		},
		steps: [
			{
				action: 'type',
				selector: '[autocomplete="shipping email"]',
				value: 'c2p@example.com'
			},
			{ action: 'wait', ms: 500 },
			{ action: 'click', selector: '[autocomplete="shipping name"]' },
			{ action: 'wait', ms: 1500 },
			{
				action: 'waitForElement',
				selector: 'input[aria-label="OTP digit 1"]',
				timeout: 8000
			},
			{ action: 'type', selector: 'input[aria-label="OTP digit 1"]', value: '1' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 2"]', value: '2' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 3"]', value: '3' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 4"]', value: '4' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 5"]', value: '5' },
			{ action: 'type', selector: 'input[aria-label="OTP digit 6"]', value: '6' },
			{ action: 'wait', ms: 2000 },
			{ action: 'click', selector: '#card-2' },
			{ action: 'wait', ms: 500 },
			{ action: 'type', selector: '[autocomplete="shipping name"]', value: MOCK_USER.name },
			{
				action: 'type',
				selector: '[autocomplete="shipping address-line1"]',
				value: MOCK_USER.address
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level2"]',
				value: MOCK_USER.city
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping postal-code"]',
				value: MOCK_USER.zip
			},
			{
				action: 'type',
				selector: '[autocomplete="shipping address-level1"]',
				value: MOCK_USER.state
			},
			{ action: 'type', selector: '[autocomplete="shipping tel"]', value: MOCK_USER.phone },
			{ action: 'wait', ms: 1500 },
			{ action: 'click', selector: 'button[type="submit"]' },
			{ action: 'waitForElement', selector: '[placeholder="CVV"]', timeout: 3000 },
			{ action: 'type', selector: '[placeholder="CVV"]', value: '1234' },
			{ action: 'clickByText', tagName: 'button', text: 'Place order' },
			{ action: 'waitForText', text: 'Thank You!', timeout: 5000 }
		]
	},

	paypal: {
		id: 'paypal',
		name: 'PayPal Express',
		description: 'Checkout using PayPal',
		featureConfig: {
			promoCodes: false,
			paypal: true,
			clickToPay: false
		},
		steps: [
			{ action: 'click', selector: '.mock-paypal-button, [data-testid="paypal-button"]' },
			{ action: 'wait', ms: 3500 },
			{
				action: 'waitForElement',
				selector: '[autocomplete="shipping email"]',
				timeout: 3000
			},
			{ action: 'wait', ms: 500 },
			{ action: 'click', selector: 'button[type="submit"]' },
			{ action: 'waitForText', text: 'Thank You!', timeout: 5000 }
		]
	},

	prefilledShipping: {
		id: 'prefilledShipping',
		name: 'Pre-filled Shipping',
		description: 'Cart with shipping info already filled (collapsed view)',
		featureConfig: {
			promoCodes: false,
			paypal: false,
			clickToPay: false
		},
		cartState: 'prefilledShipping',
		steps: [
			{ action: 'wait', ms: 1000 },
			{
				action: 'type',
				selector: '[placeholder="4111 4111 4111 4111"]',
				value: MOCK_CARD.number
			},
			{ action: 'type', selector: '[placeholder="MM / YY"]', value: MOCK_CARD.expiration },
			{ action: 'type', selector: '[placeholder="CVC"]', value: MOCK_CARD.cvv },
			{ action: 'wait', ms: 500 },
			{ action: 'click', selector: 'button[type="submit"]' },
			{ action: 'waitForText', text: 'Thank You!', timeout: 5000 }
		]
	}
};

export function getAvailableFlows() {
	return Object.values(CHECKOUT_FLOWS);
}
