<script>
	// @ts-nocheck
	import { writable } from 'svelte/store';
	import FlowSinglePage from '../flow-single-page.svelte';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { colord } from 'colord';
	import '../theme.css';
	import { isPrimaryDark, isActionDark } from '../theme-context.js';
	import ThankYouPage from '../thank-you-page.svelte';

	let shippingInfoInProgress = false;
	let shippingMethodInProgress = false;
	let placeOrderInProgress = false;
	let largeLogo;
	let smallLogo;

	const cartData = {
		display_name: 'Havaianas',
		cart_status: 'active',
		platform_id: 'sfcc',
		shop_id: 'staging-na01-havaianas.demandware.net',
		shop_properties: {
			paypal: {
				sandbox: true,
				integration_version: 'billing-aggreement-v1',
				clientId:
					'AaV3gvxuLdin4yEdhSZXCSssYbBcZty_aGSnSUBH5ES_ZO8GVHSrz_GCwxngmL2scdO8EY1BwIHNhc68',
				billing_agreement: true,
				requires_review: true,
				express_enabled: false,
				payment_enabled: true
			},
			captcha: {
				type: 'recaptcha-v3',
				api_key: '6LdO8jgcAAAAANkSna5tGVs0nb15cpWSwWeA1-k5',
				url: 'https://staging-na01-havaianas.demandware.net/s/Havaianas-US/checkout-login/',
				captcha_on_place_order: 'true'
			}
		},
		cart_id: '8346addd-06e3-43cc-b71f-4431ad415e25',
		urls: {},
		line_items: [
			{
				sku: '4148491-0090-356',
				base_sku: '4148491-0090-356',
				quantity: 3,
				msrp: {
					currency: 'USD',
					value: 38
				},
				price: {
					currency: 'USD',
					value: 38
				},
				line_price: {
					currency: 'USD',
					value: 114
				},
				line_discount: {
					currency: 'USD',
					value: 0
				},
				requires_shipping: true,
				image: {
					url: 'https://cdn-havaianas-global-3.yapoli.com/4148491-farm-samba-das-araras-23-0090-0.png?d=140x140&t=webP',
					alt: 'https://cdn-havaianas-global-3.yapoli.com/4148491-farm-samba-das-araras-23-0090-0.png?d=140x140&t=webP'
				},
				platform_line_item_id: '0d6ee9a7e56f2f20e2a3a8173c',
				description: 'Farm Rio Black Parrots Flip Flops',
				variant_description: 'Color: 0090, Size: 356',
				line_item_id: '56a0073a-6dc0-42e6-af86-7f51c792e342'
			}
		],
		total: {
			currency: 'USD',
			value: 114
		},
		sub_total: {
			currency: 'USD',
			value: 114
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
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			}
		]
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
			},
			{
				sku: 'shopify-Economy-20.00',
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
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'visa',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'mastercard',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'amex',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'discover',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'dinersclub',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'jcb',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			},
			{
				type: 'CreditCard',
				art: '',
				id: '249351882',
				wallet: 'shoppay',
				last_four: '8798',
				month: 3,
				year: 2030,
				card_type: 'unionpay',
				billing_info: {
					first_name: 'John',
					last_name: 'Smith',
					address1: '123 Beautiful St.',
					address2: '',
					city: 'Newcastle',
					state_or_province: 'WA',
					state_name: 'Washington',
					postal_code: '98056',
					country: 'United States',
					phone: '+14255551234'
				}
			}
		]
	};

	const orderData = {
		...cartDataWithShipping,
		urls: {
			thank_you_page: 'https://magento-898055-3117720.cloudwaysapps.com/checkout/onepage/success'
		},
		platform_order_number: '186872537',
		billing_info: {
			address1: '1234 123th Place West',
			first_name: 'John',
			last_name: 'Doe',
			email: 'johndoe@firmly.ai',
			phone: '1000000000',
			city: 'Newcastle',
			postal_code: '98056',
			state_or_province: 'WA',
			state_name: 'Washington',
			country: 'United States'
		},
		payment_summary: {
			card_holder_name: 'John Doe',
			bin: '411810',
			last_four: '8798',
			month: 3,
			year: 2030,
			card_type: 'Visa'
		}
	};

	const cart = writable(cartData);

	function configurationListener(message) {
		if (message.data?.from === 'firmly-configurator') {
			let currentCart = {
				...cartDataWithShipping,
				display_name: message.data.name,
				payment_method_options: [
					...cartDataWithShipping.payment_method_options,
					{
						type: 'CreditCard',
						wallet: 'user'
					},
					...(message.data.shopPayEnabled ? [{ type: 'ShopPay', wallet: 'shoppay' }] : []),
					...(message.data.payPalEnabled ? [{ type: 'PayPal', wallet: 'paypal' }] : [])
				],
				requires_shipping: message.data.shippingEnabled,
				session: {
					requires_login: message.data.loginEnabled
				}
			};
			cart.set();
			shippingInfoInProgress = false;
			shippingMethodInProgress = false;
			placeOrderInProgress = false;
			isPrimaryDark.set(colord(message.data.primaryColor).isDark());
			isActionDark.set(colord(message.data.actionColor).isDark());
			switch (message.data.state) {
				case 'Blank':
					delete currentCart.shipping_info;
					delete currentCart.shipping_method;
					delete currentCart.shipping_method_options;
					break;
				case 'Skeleton':
					currentCart = null;
					break;
				case 'Updt Ship':
					shippingInfoInProgress = true;
					break;
				case 'Updt Method':
					shippingMethodInProgress = true;
					break;
				case 'Placing Order':
					placeOrderInProgress = true;
					break;
				case 'Thank You':
					currentCart = orderData;
					break;
			}

			largeLogo = message.data.largeLogo;
			smallLogo = message.data.smallLogo;
			cart.set(currentCart);
			document.documentElement.style.setProperty('--fy-primary', message.data.primaryColor);
			document.documentElement.style.setProperty(
				'--fy-on-primary',
				$isPrimaryDark ? 'white' : 'black'
			);
			document.documentElement.style.setProperty(
				'--fy-on-primary-subtle',
				$isPrimaryDark ? '#a2a2a2' : '#a2a2a2'
			);
			document.documentElement.style.setProperty('--fy-action', message.data.actionColor);
			document.documentElement.style.setProperty(
				'--fy-on-action',
				$isActionDark ? 'white' : 'black'
			);
		}
	}

	onMount(() => {
		window.addEventListener('message', configurationListener);

		return () => {
			window.removeEventListener('message', configurationListener);
		};
	});
</script>

<div transition:fade>
	{#if $cart?.platform_order_number}
		<ThankYouPage
			order={$cart}
			merchantInfo={{
				smallLogo,
				largeLogo
			}}
		/>
	{:else}
		<FlowSinglePage
			{cart}
			{shippingInfoInProgress}
			{shippingMethodInProgress}
			{placeOrderInProgress}
			{largeLogo}
			{smallLogo}
		/>
	{/if}
</div>
