// @ts-nocheck

import OrderSummaryBox from './order-box.svelte';

export default {
	title: 'Dynamo/Order Summary Box',
	component: OrderSummaryBox,
	tags: ['autodocs']
};

export const WithoutShippingMethod = {
	args: {
		cart: {
			line_items: [],
			shipping_info: {
				first_name: 'First',
				last_name: 'Last',
				phone: '1234567891',
				address1: '1 microsoft way',
				address2: '',
				city: 'redmond',
				state_or_province: 'wa',
				country: 'us',
				postal_code: '98052',
				email: 'teste@teste.com'
			},
			total: {
				currency: 'USD',
				value: 0
			},
			sub_total: {
				currency: 'USD',
				value: 0
			},
			shipping_total: {
				currency: 'USD',
				value: 0
			},
			tax: {
				currency: 'USD',
				value: 0
			},
			cart_discount: {
				currency: 'USD',
				value: 0
			}
		}
	}
};

export const WithoutShippingInfo = {
	args: {
		cart: {
			line_items: [],
			total: {
				currency: 'USD',
				value: 0
			},
			sub_total: {
				currency: 'USD',
				value: 0
			},
			shipping_total: {
				currency: 'USD',
				value: 0
			},
			tax: {
				currency: 'USD',
				value: 0
			},
			cart_discount: {
				currency: 'USD',
				value: 0
			}
		}
	}
};

export const CalculatingValues = {
	args: {
		cart: {
			line_items: [],
			shipping_info: {
				first_name: 'First',
				last_name: 'Last',
				phone: '1234567891',
				address1: '1 microsoft way',
				address2: '',
				city: 'redmond',
				state_or_province: 'wa',
				country: 'us',
				postal_code: '98052',
				email: 'teste@teste.com'
			},
			total: {
				currency: 'USD',
				value: 0
			},
			sub_total: {
				currency: 'USD',
				value: 0
			},
			shipping_total: {
				currency: 'USD',
				value: 0
			},
			tax: {
				currency: 'USD',
				value: 0
			},
			cart_discount: {
				currency: 'USD',
				value: 0
			}
		},
		showCalculatingText: true
	}
};
