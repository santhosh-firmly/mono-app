// @ts-nocheck

import { within } from '@storybook/test';
import MerchantsSummary from './merchants-summary.svelte';
import { expect } from '@storybook/test';

export default {
	title: 'Dynamo/Merchants Summary Form',
	component: MerchantsSummary,
	tags: ['autodocs']
};

export const Merchant = {
	args: {
		cartsAndOrders: [
			{
				display_name: 'Firmly Test Store',
				cart_status: 'active',
				platform_id: 'shopify',
				shop_id: 'firmlyai.myshopify.com',
				cart_id: '2a132653-539e-4a1c-9665-952fb380d84d',
				urls: {},
				line_items: [
					{
						domain: 'firmlyai.myshopify.com',
						readOnly: false,
						line_item_id: 'd7d8de53-467d-4060-bde6-4cadd0e122a0',
						sku: '43624719843576',
						base_sku: '7921742577912',
						quantity: 1,
						msrp: {
							currency: 'USD',
							value: 2
						},
						price: {
							currency: 'USD',
							value: 2
						},
						line_price: {
							currency: 'USD',
							value: 2
						},
						requires_shipping: true,
						image: {
							url: 'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_large.jpg?v=1674229252',
							large:
								'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_large.jpg?v=1674229252',
							grande:
								'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_grande.jpg?v=1674229252',
							medium:
								'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_medium.jpg?v=1674229252',
							compact:
								'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_compact.jpg?v=1674229252',
							small:
								'http://cdn.shopify.com/s/files/1/0650/9202/6616/products/ford-escort-mk-rs-illustration-mki-43267785_small.jpg?v=1674229252'
						},
						platform_line_item_id: 'fe7af4766bd088cb8ab57af8cf6a209f',
						description: 'Cheapest Car in the world',
						variant_description: 'Cheapest Car in the world'
					}
				],
				sub_total: {
					currency: 'USD',
					value: 2
				},
				cart_discount: {
					currency: 'USD',
					value: 0
				},
				shipping_total: {
					currency: 'USD',
					value: 53.3
				},
				tax: {
					currency: 'USD',
					value: 5.58
				},
				total: {
					currency: 'USD',
					value: 60.88
				},
				shipping_method_options: [
					{
						sku: 'shopify-best%20shipping%20ever-9.00',
						description: 'best shipping ever',
						price: {
							currency: 'USD',
							value: 9
						}
					},
					{
						sku: 'usps-PriorityExpress-53.30',
						description: 'Priority Mail Express: 1 business day',
						price: {
							currency: 'USD',
							value: 53.3
						}
					}
				],
				shipping_method: {
					sku: 'usps-PriorityExpress-53.30',
					description: 'Priority Mail Express: 1 business day',
					price: {
						currency: 'USD',
						value: 53.3
					}
				},
				shipping_info: {
					country: 'United States',
					state_or_province: 'wa',
					city: 'redmond',
					postal_code: '98052',
					address2: '',
					last_name: 'Last',
					first_name: 'First',
					phone: '1234567891',
					email: 'teste@teste.com',
					address1: '1 microsoft way'
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
				]
			}
		]
	}
};

export const RadioButtonDisabled = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const radioButtons = canvas.getAllByRole('radio');
		radioButtons.forEach(async (element) => {
			await expect(element).toBeDisabled();
		});
	},
	args: {
		...Merchant.args,
		disabled: true,
		showShippingMethodSkeleton: true
	}
};

export const TwoMerchants = {
	args: {
		cartsAndOrders: [...Merchant.args.cartsAndOrders, ...Merchant.args.cartsAndOrders]
	}
};

export const Empty = {
	args: {}
};
