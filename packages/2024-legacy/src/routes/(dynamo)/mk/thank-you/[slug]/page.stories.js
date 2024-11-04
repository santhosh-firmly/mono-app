import ThankYouPage from './+page.svelte';

export default {
	title: 'Dynamo/Thank you Page',
	component: ThankYouPage,
	tags: ['autodocs']
};

const Order1 = {
	display_name: 'Magento Demo',
	cart_status: 'submitted',
	platform_id: 'magento',
	shop_id: 'magento-898055-3117720.cloudwaysapps.com',
	cart_id: '99da4c97-2cdf-4c2d-a034-d8eed742ce2a',
	submitted_at: '2023-09-29T20:57:06.530Z',
	urls: {
		thank_you_page: 'https://magento-898055-3117720.cloudwaysapps.com/checkout/onepage/success'
	},
	payment_method_options: [
		{
			type: 'CreditCard',
			wallet: 'user'
		}
	],
	line_items: [
		{
			line_item_id: '675c3411-2a5a-43a0-ad6f-560a849ac217',
			sku: 'Santos-Jersey',
			base_sku: 'Santos-Jersey',
			quantity: 1,
			requires_shipping: true,
			image: {
				url: 'https://magento-898055-3117720.cloudwaysapps.com/media/catalog/product/s/a/santos-22-23-kits-3.jpg'
			},
			msrp: {
				currency: 'USD',
				value: 0.8
			},
			price: {
				currency: 'USD',
				value: 0.8
			},
			line_price: {
				currency: 'USD',
				value: 0.8
			},
			platform_line_item_id: '0',
			description: 'Santos Jersey'
		}
	],
	shipping_info: {
		address1: '7367 126th Place Southeast',
		first_name: 'Romeu',
		last_name: 'Gouvea',
		email: 'romeo@firmly.ai',
		phone: '1000000000',
		city: 'Newcastle',
		postal_code: '98056',
		state_or_province: 'WA',
		state_name: 'Washington',
		country: 'United States'
	},
	shipping_method: {
		sku: 'freeshipping_freeshipping',
		description: 'Free',
		price: {
			currency: 'USD',
			value: 0
		}
	},
	shipping_method_options: [
		{
			sku: 'freeshipping_freeshipping',
			description: 'Free',
			price: {
				currency: 'USD',
				value: 0
			}
		},
		{
			sku: 'flatrate_flatrate',
			description: 'Fixed',
			price: {
				currency: 'USD',
				value: 0.1
			}
		}
	],
	total: {
		currency: 'USD',
		value: 0.8
	},
	sub_total: {
		currency: 'USD',
		value: 0.8
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
	},
	platform_order_number: '186',
	payment_method: {
		card_holder_name: 'Romeu Gouvea',
		bin: '411810',
		last_four: '8798',
		month: '3',
		year: '2030',
		card_type: 'Visa'
	},
	handle:
		'eyJ0aGFua1lvdVBhZ2VVcmwiOiJodHRwczovL21hZ2VudG8tODk4MDU1LTMxMTc3MjAuY2xvdWR3YXlzYXBwcy5jb20vY2hlY2tvdXQvb25lcGFnZS9zdWNjZXNzIiwiY29va2llcyI6WyJtYWdlLWNhY2hlLXNlc3NpZD07IERvbWFpbj1tYWdlbnRvLTg5ODA1NS0zMTE3NzIwLmNsb3Vkd2F5c2FwcHMuY29tOyBleHBpcmVzPVRodSwgMDEgSmFuIDE5NzAgMDA6MDA6MDAgR01UIl19',
	billing_info: {
		address1: '7367 126th Place Southeast',
		first_name: 'Romeu',
		last_name: 'Gouvea',
		email: 'romeo@firmly.ai',
		phone: '1000000000',
		city: 'Newcastle',
		postal_code: '98056',
		state_or_province: 'WA',
		state_name: 'Washington',
		country: 'United States'
	},
	payment_summary: {
		card_holder_name: 'Romeu Gouvea',
		bin: '411810',
		last_four: '8798',
		month: 3,
		year: 2030,
		card_type: 'Visa'
	}
};

const Order2 = {
	display_name: 'Young Rebelz',
	cart_status: 'submitted',
	platform_id: 'shopify',
	shop_id: 'youngrebelz.com',
	shop_properties: {
		paypal: {
			clientId: 'AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr',
			merchantId: 'kumar@harrysholding.com'
		}
	},
	cart_id: 'e38b5a35-9994-469d-9d6f-e6d87b840a9d',
	submitted_at: '2023-09-29T20:57:09.046Z',
	urls: {
		thank_you_page:
			'https://www.youngrebelz.com/6558122036/checkouts/c9eaa007cb94fade73a6df0305c443f1/thank_you?key=ac59f106fcfdc76693e31676b78bfeee'
	},
	line_items: [
		{
			line_item_id: '0115fe07-744d-4dd1-94a4-92ba6a5486a7',
			sku: '42384793469105',
			base_sku: '7395908321457',
			quantity: 1,
			msrp: {
				currency: 'USD',
				value: 42.99
			},
			price: {
				currency: 'USD',
				value: 1
			},
			line_price: {
				currency: 'USD',
				value: 1
			},
			requires_shipping: true,
			image: {
				url: 'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_large.jpg?v=1671231451',
				large:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_large.jpg?v=1671231451',
				grande:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_grande.jpg?v=1671231451',
				medium:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_medium.jpg?v=1671231451',
				compact:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_compact.jpg?v=1671231451',
				small:
					'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Skyblue_hoodie_4373fc2e-27ff-4627-9d1d-1936d022a192_small.jpg?v=1671231451'
			},
			platform_line_item_id: '50d1bb7641f799f04c253fcf8e188774',
			description: 'Plant 2 : Do not order',
			variant_description: 'L / Sky Blue'
		}
	],
	sub_total: {
		currency: 'USD',
		value: 1
	},
	cart_discount: {
		currency: 'USD',
		value: 0
	},
	shipping_total: {
		currency: 'USD',
		value: 0
	},
	tax: {
		currency: 'USD',
		value: 0.11
	},
	total: {
		currency: 'USD',
		value: 1.11
	},
	shipping_method_options: [
		{
			sku: 'shopify-Standard%20(2-6%20days)-0.00',
			description: 'Standard (2-6 days)',
			price: {
				currency: 'USD',
				value: 0
			}
		},
		{
			sku: 'shopify-Economy-1.00',
			description: 'Economy: 5 to 8 business days',
			price: {
				currency: 'USD',
				value: 1
			}
		},
		{
			sku: 'shopify-Expedited%20(1-3%20days)-6.90',
			description: 'Expedited (1-3 days)',
			price: {
				currency: 'USD',
				value: 6.9
			}
		},
		{
			sku: 'shopify-Express-10.00',
			description: 'Express: 1 to 2 business days',
			price: {
				currency: 'USD',
				value: 10
			}
		},
		{
			sku: 'shopify-Super%20fast-20.00',
			description: 'Super fast',
			price: {
				currency: 'USD',
				value: 20
			}
		}
	],
	shipping_method: {
		sku: 'shopify-Standard%20(2-6%20days)-0.00',
		description: 'Standard (2-6 days)',
		price: {
			currency: 'USD',
			value: 0
		}
	},
	platform_order_number: 'Order #2821',
	shipping_info: {
		first_name: 'Romeu',
		last_name: 'Gouvea',
		phone: '1000000000',
		address1: '7367 126th Place Southeast',
		city: 'Newcastle',
		state_or_province: 'WA',
		state_name: 'Washington',
		country: 'United States',
		postal_code: '98056',
		email: 'romeo@firmly.ai'
	},
	payment_method_options: [
		{
			type: 'CreditCard',
			wallet: 'user'
		},
		{
			type: 'PayPal',
			wallet: 'paypal'
		},
		{
			type: 'ShopPay',
			wallet: 'shoppay'
		}
	],
	payment_method: {
		payment_type: 'CreditCard',
		last_four: '8798',
		month: 3,
		year: 2030
	},
	billing_info: {
		address1: '7367 126th Place Southeast',
		first_name: 'Romeu',
		last_name: 'Gouvea',
		email: 'romeo@firmly.ai',
		phone: '1000000000',
		city: 'Newcastle',
		postal_code: '98056',
		state_or_province: 'WA',
		state_name: 'Washington',
		country: 'United States'
	}
};

export const SingleOrder = {
	args: {
		orders: [Order1]
	}
};

export const MultipleOrders = {
	args: {
		orders: [Order1, Order2]
	}
};
