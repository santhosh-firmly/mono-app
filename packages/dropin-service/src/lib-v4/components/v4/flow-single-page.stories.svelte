<script>
	// @ts-nocheck

	import FlowSinglePage from './flow-single-page.svelte';
	import ResponsiveWrapper from './configurator/responsive-wrapper.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
	import { writable } from 'svelte/store';
	import { http } from 'msw';
	import './theme.css';
	import '$lib-v4/browser/api-firmly';

	const cartData = {
		display_name: 'Young Rebelz',
		cart_status: 'active',
		platform_id: 'shopify',
		shop_id: 'youngrebelz.com',
		shop_properties: {
			paypal: {
				clientId:
					'AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr',
				merchantId: 'kumar@harrysholding.com'
			}
		},
		cart_id: '7f43d396-e3f7-4efb-8be3-dfc357cd0a4c',
		urls: {},
		line_items: [
			{
				line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4790',
				sku: '29227235868724',
				base_sku: '3796148518964',
				quantity: 2,
				msrp: {
					currency: 'USD',
					value: 6.5
				},
				price: {
					currency: 'USD',
					value: 6.5
				},
				line_price: {
					currency: 'USD',
					value: 13
				},
				requires_shipping: true,
				image: {
					url: 'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_large.jpg?v=1565574386',
					large:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_large.jpg?v=1565574386',
					grande:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_grande.jpg?v=1565574386',
					medium:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_medium.jpg?v=1565574386',
					compact:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_compact.jpg?v=1565574386',
					small:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_small.jpg?v=1565574386'
				},
				platform_line_item_id: '310b03b0be9f37edb3ae55631fdb8c0a',
				description: 'Plant 5 : Do not order'
			}
		],
		sub_total: {
			currency: 'USD',
			value: 13
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
			value: 0
		},
		total: {
			currency: 'USD',
			value: 13
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
				type: 'DemoCreditCard',
				wallet: 'test',
				art: '',
				card_type: 'Visa',
				last_four: '1111',
				month: '12',
				pan: '4111111111111111',
				year: '2030'
			}
		]
	};

	const cartDataOptionalShippingPhone = {
		...cartData,
		shop_properties: {
			paypal: {
				clientId:
					'AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr',
				merchantId: 'kumar@harrysholding.com'
			},
			optional_fields: {
				shipping_phone: true
			}
		}
	};

	const cartDataWithoutShippingPhone = {
		...cartData,
		shipping_info: {
			first_name: 'Frodo',
			last_name: 'Baggins',
			address1: '123 Nice St.',
			city: 'Newcastle',
			state_or_province: 'WA',
			country: 'United States',
			postal_code: '98056',
			email: 'frodo@firmly.ai'
		},
		shop_properties: {
			optional_fields: {
				shipping_phone: true
			}
		},
		shipping_method: {
			sku: 'shopify-Economy-2.00',
			description: 'Economy',
			price: {
				currency: 'USD',
				value: 2
			},
			applicable_line_items: []
		},
		shipping_method_options: [
			{
				sku: 'shopify-Economy-2.00',
				description: 'Economy',
				price: {
					currency: 'USD',
					value: 2
				}
			}
		],
		shipping_total: {
			currency: 'USD',
			value: 2.0
		}
	};

	const cartDataWithShipping = {
		...cartData,
		shipping_info: {
			first_name: 'John',
			last_name: 'Smith',
			phone: '(206) 555-1212',
			address1: '123 Nice St.',
			city: 'Newcastle',
			state_or_province: 'WA',
			country: 'United States',
			postal_code: '98056',
			email: 'john@firmly.ai'
		},
		shipping_method: {
			sku: 'shopify-Economy-2.00',
			description: 'Economy',
			price: {
				currency: 'USD',
				value: 2
			},
			applicable_line_items: []
		},
		shipping_method_options: [
			{
				sku: 'shopify-Economy-2.00',
				description: 'Economy',
				price: {
					currency: 'USD',
					value: 2
				}
			}
		],
		shipping_total: {
			currency: 'USD',
			value: 2.0
		}
	};

	const cartDataWithMultipleCards = {
		...cartDataWithShipping,
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
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'c2p',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'visa',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Palos de Gouvea',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14253368875'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351883',
				wallet: 'c2p',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'jcb',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Palos de Gouvea',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14253368875'
				}
			},
			{
				type: 'DemoCreditCard',
				wallet: 'test',
				art: '',
				card_type: 'Visa',
				last_four: '1111',
				month: '12',
				pan: '4111111111111111',
				year: '2030',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Palos de Gouvea',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14253368875'
				}
			}
		]
	};

	const cartDataWithZeroDollarOrder = {
		...cartDataWithShipping,
		total: {
			currency: 'USD',
			value: 0
		}
	};

	const cartDataWithSubscription = {
		display_name: 'Adore Me',
		cart_status: 'active',
		platform_id: 'adoreme',
		shop_id: 'adoreme.com',
		cart_id: 'f3434010-9f5d-4185-87e2-ed58a93c9187',
		urls: {
			privacy_policy: 'https://www.adoreme.com/privacy-policy'
		},
		line_items: [
			{
				sku: 'PCT155645',
				base_sku: 'PCT155645',
				quantity: 1,
				msrp: {
					currency: 'USD',
					value: 54.95
				},
				price: {
					currency: 'USD',
					value: 44.95
				},
				line_price: {
					currency: 'USD',
					value: 44.95
				},
				line_discount: {
					currency: 'USD',
					value: 17.98
				},
				vip_discount: true,
				variant_handles: ['eyJ0eXBlIjoiU2l6ZSIsInZhbHVlIjoieHMifQ=='],
				image: {
					url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/152087.jpg'
				},
				requires_shipping: true,
				platform_line_item_id: '0',
				description: 'Renetta Unlined',
				variant_description: 'xs',
				line_item_id: '63d34d49-d1b9-49aa-a279-dea4d17fc142'
			},
			{
				sku: 'VIP_SKU',
				base_sku: 'VIP_SKU',
				quantity: 1,
				fixed_quantity: true,
				recurring: 'monthly',
				price: {
					currency: 'USD',
					value: 39.95
				},
				line_price: {
					currency: 'USD',
					value: 39.95
				},
				line_discount: {
					currency: 'USD',
					value: 0
				},
				image: {
					url: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIiA/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMDgwIDEwODAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZGVmcz4KPC9kZWZzPgo8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMTQ5LDAsMTA2KSI+PC9yZWN0Pgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgyNSAwIDAgMjUgNTQwIDU0MCkiPgo8cGF0aCBzdHlsZT0ic3Ryb2tlOiBub25lOyBzdHJva2Utd2lkdGg6IDE7IHN0cm9rZS1kYXNoYXJyYXk6IG5vbmU7IHN0cm9rZS1saW5lY2FwOiBidXR0OyBzdHJva2UtZGFzaG9mZnNldDogMDsgc3Ryb2tlLWxpbmVqb2luOiBtaXRlcjsgc3Ryb2tlLW1pdGVybGltaXQ6IDQ7IGZpbGw6IHJnYigyNTUsMjU1LDI1NSk7IGZpbGwtcnVsZTogbm9uemVybzsgb3BhY2l0eTogMTsiICB0cmFuc2Zvcm09IiB0cmFuc2xhdGUoLTEyLjU2LCAtOC4xKSIgZD0iTSAyMy4xNzI0IDAuMDk5NjA5NCBMIDE4LjM1OTggMTMuMTcwMSBMIDEyLjY5MTMgMC4wOTk2MDk0IEwgMTAuMjE1OCAwLjA5OTYwOTQgTCAxMC4yMTU4IDAuMTc5MjQ4IEMgMTAuNzYzNSAwLjY3ODUyIDExLjI5MjcgMS42Mzg0NyAxMS43NjMyIDIuNjcyNTUgTCAxNy41ODczIDE2LjA5OTYgTCAxNy43OTU1IDE2LjA5OTYgTCAyMy4yMDA2IDEuNzA2NDcgTCAyMy4yMDA2IDE1LjgzNzQgTCAyNS4xMTMxIDE1LjgzNzQgTCAyNS4xMTMxIDAuMDk5NjA5NCBMIDIzLjE3MjQgMC4wOTk2MDk0IFogTSAzLjIxMjUgOS42NTkzIEwgNi4yNjkzOSAyLjYwMDg3IEwgOS4zMzQ4NiA5LjY1OTMgTCAzLjIxMjUgOS42NTkzIFogTSA0Ljc1NjI2IDAuMDk5NjA5NCBMIDQuNzU2MjYgMC4xNzkyNDggQyA1LjI4MzEgMC42NDQ4MjcgNS42OTk2NyAxLjM4MzAyIDUuOTkzNzIgMS45OTEzMyBMIDAgMTUuODM3NCBMIDAuNTgzODEyIDE1LjgzNzQgTCAzLjAyOTk0IDEwLjE4ODYgTCA5LjU2MzM3IDEwLjE4ODYgTCAxMi4wMTQ0IDE1LjgzNzQgTCAxNC4wNTYyIDE1LjgzNzQgTCA3LjIzMTc5IDAuMDk5NjA5NCBMIDQuNzU2MjYgMC4wOTk2MDk0IFoiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9nPgo8L3N2Zz4K'
				},
				requires_shipping: false,
				description: 'VIP Membership',
				variant_description:
					'Flexible monthly lingerie membership where you get first access and member-only discounts on exclusive monthly drops.',
				platform_line_item_id: '1',
				line_item_id: 'cdab2358-bfce-4268-ad13-daee60ca2702'
			}
		],
		total: {
			currency: 'USD',
			value: 26.97
		},
		sub_total: {
			currency: 'USD',
			value: 44.95
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
			value: 17.98
		},
		store_credit: {
			currency: 'USD',
			value: 10
		},
		available_store_credit: {
			currency: 'USD',
			value: 100
		},
		cart_discount_breakdown: [
			{
				is_vip: true,
				step: 1,
				label: 'First VIP set 40% OFF',
				discount: {
					currency: 'USD',
					value: 17.98
				}
			}
		],
		merchant_custom_data: {
			alternative_cart_details: {
				vip_option: false,
				line_items: [
					{
						sku: 'PCT155645',
						base_sku: 'PCT155645',
						quantity: 1,
						msrp: {
							currency: 'USD',
							value: 54.95
						},
						price: {
							currency: 'USD',
							value: 54.95
						},
						line_price: {
							currency: 'USD',
							value: 54.95
						},
						line_discount: {
							currency: 'USD',
							value: 0
						},
						variant_handles: ['eyJ0eXBlIjoiU2l6ZSIsInZhbHVlIjoieHMifQ=='],
						image: {
							url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/152087.jpg'
						},
						requires_shipping: true,
						platform_line_item_id: '0',
						description: 'Renetta Unlined',
						variant_description: 'xs',
						line_item_id: '63d34d49-d1b9-49aa-a279-dea4d17fc142'
					}
				],
				total: {
					currency: 'USD',
					value: 54.95
				},
				sub_total: {
					currency: 'USD',
					value: 54.95
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
				store_credit: {
					currency: 'USD',
					value: 0
				},
				available_store_credit: {
					currency: 'USD',
					value: 10
				},
				cart_discount_breakdown: []
			}
		},
		session: {
			requires_login: true,
			is_email_registered: false,
			is_logged_in: false,
			cookies: [],
			accepts_otp: ['phone', 'email'],
			accepts_membership: ['vip']
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			},
			{
				type: 'DemoCreditCard',
				wallet: 'test',
				art: '',
				card_type: 'Visa',
				last_four: '1111',
				month: '12',
				pan: '4111111111111111',
				year: '2030',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Palos de Gouvea',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14253368875'
				}
			}
		]
	};

	const cartDataWithRewardPoints = {
		display_name: 'Adore Me',
		cart_status: 'active',
		platform_id: 'adoreme',
		shop_id: 'adoreme.com',
		cart_id: 'f3434010-9f5d-4185-87e2-ed58a93c9187',
		urls: {
			privacy_policy: 'https://www.adoreme.com/privacy-policy'
		},
		line_items: [
			{
				sku: 'PCT155645',
				base_sku: 'PCT155645',
				quantity: 1,
				msrp: {
					currency: 'USD',
					value: 54.95
				},
				price: {
					currency: 'USD',
					value: 44.95
				},
				line_price: {
					currency: 'USD',
					value: 44.95
				},
				line_discount: {
					currency: 'USD',
					value: 17.98
				},
				vip_discount: true,
				variant_handles: ['eyJ0eXBlIjoiU2l6ZSIsInZhbHVlIjoieHMifQ=='],
				image: {
					url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/152087.jpg'
				},
				requires_shipping: true,
				platform_line_item_id: '0',
				description: 'Renetta Unlined',
				variant_description: 'xs',
				line_item_id: '63d34d49-d1b9-49aa-a279-dea4d17fc142'
			},
			{
				sku: 'VIP_SKU',
				base_sku: 'VIP_SKU',
				quantity: 1,
				fixed_quantity: true,
				recurring: 'monthly',
				price: {
					currency: 'USD',
					value: 39.95
				},
				line_price: {
					currency: 'USD',
					value: 39.95
				},
				line_discount: {
					currency: 'USD',
					value: 0
				},
				image: {
					url: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIiA/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHZlcnNpb249IjEuMSIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIHZpZXdCb3g9IjAgMCAxMDgwIDEwODAiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8ZGVmcz4KPC9kZWZzPgo8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJyZ2IoMTQ5LDAsMTA2KSI+PC9yZWN0Pgo8ZyB0cmFuc2Zvcm09Im1hdHJpeCgyNSAwIDAgMjUgNTQwIDU0MCkiPgo8cGF0aCBzdHlsZT0ic3Ryb2tlOiBub25lOyBzdHJva2Utd2lkdGg6IDE7IHN0cm9rZS1kYXNoYXJyYXk6IG5vbmU7IHN0cm9rZS1saW5lY2FwOiBidXR0OyBzdHJva2UtZGFzaG9mZnNldDogMDsgc3Ryb2tlLWxpbmVqb2luOiBtaXRlcjsgc3Ryb2tlLW1pdGVybGltaXQ6IDQ7IGZpbGw6IHJnYigyNTUsMjU1LDI1NSk7IGZpbGwtcnVsZTogbm9uemVybzsgb3BhY2l0eTogMTsiICB0cmFuc2Zvcm09IiB0cmFuc2xhdGUoLTEyLjU2LCAtOC4xKSIgZD0iTSAyMy4xNzI0IDAuMDk5NjA5NCBMIDE4LjM1OTggMTMuMTcwMSBMIDEyLjY5MTMgMC4wOTk2MDk0IEwgMTAuMjE1OCAwLjA5OTYwOTQgTCAxMC4yMTU4IDAuMTc5MjQ4IEMgMTAuNzYzNSAwLjY3ODUyIDExLjI5MjcgMS42Mzg0NyAxMS43NjMyIDIuNjcyNTUgTCAxNy41ODczIDE2LjA5OTYgTCAxNy43OTU1IDE2LjA5OTYgTCAyMy4yMDA2IDEuNzA2NDcgTCAyMy4yMDA2IDE1LjgzNzQgTCAyNS4xMTMxIDE1LjgzNzQgTCAyNS4xMTMxIDAuMDk5NjA5NCBMIDIzLjE3MjQgMC4wOTk2MDk0IFogTSAzLjIxMjUgOS42NTkzIEwgNi4yNjkzOSAyLjYwMDg3IEwgOS4zMzQ4NiA5LjY1OTMgTCAzLjIxMjUgOS42NTkzIFogTSA0Ljc1NjI2IDAuMDk5NjA5NCBMIDQuNzU2MjYgMC4xNzkyNDggQyA1LjI4MzEgMC42NDQ4MjcgNS42OTk2NyAxLjM4MzAyIDUuOTkzNzIgMS45OTEzMyBMIDAgMTUuODM3NCBMIDAuNTgzODEyIDE1LjgzNzQgTCAzLjAyOTk0IDEwLjE4ODYgTCA5LjU2MzM3IDEwLjE4ODYgTCAxMi4wMTQ0IDE1LjgzNzQgTCAxNC4wNTYyIDE1LjgzNzQgTCA3LjIzMTc5IDAuMDk5NjA5NCBMIDQuNzU2MjYgMC4wOTk2MDk0IFoiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgLz4KPC9nPgo8L3N2Zz4K'
				},
				requires_shipping: false,
				description: 'VIP Membership',
				variant_description:
					'Flexible monthly lingerie membership where you get first access and member-only discounts on exclusive monthly drops.',
				platform_line_item_id: '1',
				line_item_id: 'cdab2358-bfce-4268-ad13-daee60ca2702'
			}
		],
		total: {
			currency: 'USD',
			value: 26.97
		},
		sub_total: {
			currency: 'USD',
			value: 44.95
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
			value: 17.98
		},
		store_credit: {
			currency: 'USD',
			value: 10
		},
		available_store_credit: {
			currency: 'USD',
			value: 39.95
		},
		reward_points: {
			currency: 'USD',
			value: 39.95
		},
		available_reward_points: {
			currency: 'USD',
			value: 49.95
		},
		cart_discount_breakdown: [
			{
				is_vip: true,
				step: 1,
				label: 'First VIP set 40% OFF',
				discount: {
					currency: 'USD',
					value: 17.98
				}
			}
		],
		merchant_custom_data: {
			alternative_cart_details: {
				vip_option: false,
				line_items: [
					{
						sku: 'PCT155645',
						base_sku: 'PCT155645',
						quantity: 1,
						msrp: {
							currency: 'USD',
							value: 54.95
						},
						price: {
							currency: 'USD',
							value: 54.95
						},
						line_price: {
							currency: 'USD',
							value: 54.95
						},
						line_discount: {
							currency: 'USD',
							value: 0
						},
						variant_handles: ['eyJ0eXBlIjoiU2l6ZSIsInZhbHVlIjoieHMifQ=='],
						image: {
							url: 'https://www.adoreme.com/thumbnails/240_123/gallery/0/152087.jpg'
						},
						requires_shipping: true,
						platform_line_item_id: '0',
						description: 'Renetta Unlined',
						variant_description: 'xs',
						line_item_id: '63d34d49-d1b9-49aa-a279-dea4d17fc142'
					}
				],
				total: {
					currency: 'USD',
					value: 54.95
				},
				sub_total: {
					currency: 'USD',
					value: 54.95
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
				store_credit: {
					currency: 'USD',
					value: 0
				},
				available_store_credit: {
					currency: 'USD',
					value: 10
				},
				cart_discount_breakdown: []
			}
		},
		session: {
			requires_login: true,
			is_email_registered: false,
			is_logged_in: false,
			cookies: [],
			accepts_otp: ['phone', 'email'],
			accepts_membership: ['vip']
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			},
			{
				type: 'DemoCreditCard',
				wallet: 'test',
				art: '',
				card_type: 'Visa',
				last_four: '1111',
				month: '12',
				pan: '4111111111111111',
				year: '2030',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Palos de Gouvea',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14253368875'
				}
			}
		]
	};

	const cartDataWithShippingOptions = {
		...cartDataWithShipping,
		shipping_info_options: [
			{
				first_name: 'John',
				last_name: 'Smiths',
				phone: '(206) 555-1212',
				address1: '123 Nice St.',
				city: 'Newcastle',
				state_or_province: 'WA',
				country: 'United States',
				postal_code: '98056',
				email: 'john@firmly.ai'
			},
			{
				first_name: 'John',
				last_name: 'Smith',
				phone: '(206) 555-1212',
				address1: '123 Nice St.',
				city: 'Newcastle',
				state_or_province: 'WA',
				country: 'United States',
				postal_code: '98056',
				email: 'john@firmly.ai'
			}
		],
		shipping_method_options: [
			{
				sku: '123',
				description: 'Standard Shipping',
				estimated_delivery: '2-3 business days',
				price: {
					currency: 'USD',
					value: 1
				}
			},
			{
				sku: '456',
				description: 'Express Shipping',
				estimated_delivery: '1-2 business days',
				price: {
					currency: 'USD',
					value: 2
				}
			},
			{
				sku: 'shopify-Economy-2.00',
				description: 'Economy',
				price: {
					currency: 'USD',
					value: 2
				}
			}
		],
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
				expired: false,
				type: 'CreditCard',
				wallet: 'merchant',
				provider: 'visa',
				art: 'https://sandbox.assets.vims.visa.com/vims/cardart/22af01f2bdf445e497895d502dd1f1ae_imageA@2x.png',
				id: '550cca50-3f26-8e14-8e24-1dab61d85f01',
				last_four: '2504',
				month: '12',
				year: '2023',
				card_type: 'VISA',
				billing_info: {
					address1: '32{*****',
					address2: 'Set*****',
					city: '*****',
					state_or_province: 'DF',
					postal_code: '*****',
					country: 'BR'
				}
			},
			{
				type: 'DemoCreditCard',
				wallet: 'test',
				art: '',
				card_type: 'Visa',
				last_four: '1111',
				month: '12',
				pan: '4111111111111111',
				year: '2030',
				billing_info: {
					first_name: 'Romeu',
					last_name: 'Palos de Gouvea',
					address1: '7367 126th Pl SE',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14253368875'
				}
			}
		]
	};

	const cartDataWithCoupons = {
		...cartDataWithShipping,
		coupons: ['WELCOME10']
	};

	const cart = writable(cartData);
	const cartOptionalShippingPhone = writable(cartDataOptionalShippingPhone);
	const cartWithShipping = writable(cartDataWithShipping);
	const cartWithoutShippingPhone = writable(cartDataWithoutShippingPhone);
	const cartWithShippingOptions = writable(cartDataWithShippingOptions);
	const cartWithMultipleCards = writable(cartDataWithMultipleCards);
	const cartWithZeroDollarOrder = writable(cartDataWithZeroDollarOrder);
	const cartWithSubscription = writable(cartDataWithSubscription);
	const cartWithRewardPoints = writable(cartDataWithRewardPoints);
	const cartWithCoupons = writable(cartDataWithCoupons);
	const cartWithSeveralItems = writable({
		...cartDataWithMultipleCards,
		line_items: [
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 1
			},
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 2
			},
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 3
			},
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 4
			},
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 5
			},
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 6
			},
			{
				...cartDataWithMultipleCards.line_items[0],
				line_item_id: cartDataWithMultipleCards.line_items[0].line_item_id + 7
			}
		]
	});
</script>

<Meta
	title="Checkout V4/View Models/Single Page"
	component={FlowSinglePage}
	tags={['autodocs']}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Template let:args>
	<FlowSinglePage {...args} />
</Template>

<Story name="Default">
	<FlowSinglePage {cart} />
</Story>

<Story name="Without Shipping Phone">
	<FlowSinglePage cart={cartOptionalShippingPhone} />
</Story>

<Story
	name="Responsive"
	args={{
		cart
	}}
>
	<ResponsiveWrapper
		src="/iframe.html?args=&globals=&id=checkout-v4-view-models-single-page--default&viewMode=story"
		title="Checkout"
	/>
</Story>

<Story name="Skeleton" />

<Story
	name="Shipping Info in Progress"
	args={{
		cart: cartWithShipping,
		shippingInfoInProgress: true
	}}
/>

<Story
	name="Shipping Info in Progress Without Phone"
	args={{
		cart: cartWithoutShippingPhone,
		shippingInfoInProgress: true
	}}
/>

<Story
	name="Shipping Method in Progress"
	args={{
		cart: cartWithShipping,
		shippingMethodInProgress: true
	}}
/>

<Story
	name="Place Order in Progress"
	args={{
		cart: cartWithShipping,
		placeOrderInProgress: true
	}}
/>

<Story
	name="Multiple Credit Cards"
	args={{
		cart: cartWithMultipleCards
	}}
/>

<Story
	name="With Subscription"
	args={{
		cart: cartWithSubscription
	}}
/>

<Story name="With Subscription Dark Theme">
	<div class="adoreme-dark">
		<FlowSinglePage cart={cartWithSubscription} />
	</div>
</Story>

<Story name="With Reward Points">
	<div class="adoreme-dark">
		<FlowSinglePage cart={cartWithRewardPoints} />
	</div>
</Story>

<Story
	name="With Shipping Info Options"
	args={{
		cart: cartWithShippingOptions
	}}
/>

<Story
	name="With Shipping method Options and shipping method in progress"
	args={{
		cart: cartWithShippingOptions,
		shippingMethodInProgress: true
	}}
/>

<Story
	name="Zero dollar cart"
	args={{
		cart: cartWithZeroDollarOrder
	}}
/>

<Story
	name="With consent under email"
	args={{
		cart
	}}
	parameters={{
		msw: {
			handlers: [
				http.get('*/cart/consents', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							consents: [
								{
									id: 'ade949a1-f866-4423-9fb1-3ef7c3d8d4e6',
									ui_slot: 'UNDER_EMAIL_INPUT',
									text: 'Email me with news and offers\n',
									type: 'marketing',
									explicit: true,
									rich_text: false,
									required: false,
									revokable: true,
									signed: false
								}
							]
						})
					);
				})
			]
		}
	}}
/>

<Story
	name="With consent above place order"
	args={{
		cart
	}}
	parameters={{
		msw: {
			handlers: [
				http.get('*/cart/consents', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							consents: [
								{
									id: 'ce2ba583-4edc-4cfd-941c-80b543d7d07b',
									ui_slot: 'ABOVE_PLACE_ORDER_BUTTON',
									text: 'Keep me up to date on news and exclusive offers with promotional text alerts. Msg & data rates may apply.',
									type: 'marketing',
									explicit: true,
									rich_text: false,
									required: false,
									revokable: true
								}
							]
						})
					);
				})
			]
		}
	}}
/>

<Story
	name="With consent and consent terms"
	args={{
		cart
	}}
	parameters={{
		msw: {
			handlers: [
				http.get('*/cart/consents', async (req, res, ctx) => {
					return res(
						ctx.status(200),
						ctx.json({
							consents: [
								{
									id: '71b35917-7de4-4b3e-b421-bc37f80f38ce',
									ui_slot: 'ABOVE_PLACE_ORDER_BUTTON',
									text: 'Keep me up to date on news and exclusive offers! I agree to the %fterms{"text": "Text Terms"}%, and consent to receive recurring automated marketing texts from on behalf of Adore Me, at the phone number provided. Consent is not a condition of any purchase. Reply STOP to stop. Msg & data rates may apply.\n',
									type: 'marketing',
									explicit: true,
									rich_text: false,
									required: false,
									revokable: true,
									signed: false
								}
							]
						})
					);
				})
			]
		}
	}}
/>

<Story
	name="With coupons"
	args={{
		cart: cartWithCoupons
	}}
/>

<Story name="With several items">
	<FlowSinglePage cart={cartWithSeveralItems} />
</Story>
