<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ThankYouView from './thank-you.svelte';

	const MOCKED_ORDER_BASE = {
		id: 'order-123456',
		platform_order_number: 'ORD-2024-12345',
		shop_id: 'shop.liquid-iv.com',
		display_name: 'Liquid IV',
		total: 54.97,
		totals: {
			total: '54.97',
			currency: '$'
		},
		shipping_info: {
			first_name: 'John',
			last_name: 'Smith',
			address1: '123 Main Street',
			address2: 'Apt 4B',
			city: 'Seattle',
			state_or_province: 'WA',
			postal_code: '98101',
			phone: '(206) 555-0123',
			email: 'john.smith@example.com'
		},
		shipping_method: {
			description: 'Standard Shipping (3-5 business days)',
			price: { value: 5.99, currency: 'USD' }
		},
		line_items: [
			{
				id: 'item-1',
				name: 'Blackberry Peach Hydration Multiplier',
				quantity: 1,
				image_url: 'https://cdn.shopify.com/s/files/1/1338/1013/files/placeholder.jpg',
				price: { value: 24.99, currency: '$' }
			},
			{
				id: 'item-2',
				name: 'Lemon Lime Hydration Multiplier',
				quantity: 2,
				image_url: 'https://cdn.shopify.com/s/files/1/1338/1013/files/placeholder.jpg',
				price: { value: 19.99, currency: '$' }
			}
		]
	};

	const MOCKED_ORDER_CARD = {
		...MOCKED_ORDER_BASE,
		payment_summary: {
			payment_type: 'CreditCard',
			first_four: '4111',
			last_four: '4242',
			card_type: 'Visa'
		}
	};

	const MOCKED_ORDER_C2P = {
		...MOCKED_ORDER_BASE,
		payment_summary: {
			payment_type: 'CreditCard',
			first_four: '5555',
			last_four: '5726',
			card_type: 'Mastercard',
			wallet: 'c2p',
			art: 'https://sbx.assets.mastercard.com/card-art/combined-image-asset/6713d73d-a701-4bd2-bc9b-2e98940de9c7.png'
		}
	};

	const MOCKED_ORDER_PAYPAL = {
		...MOCKED_ORDER_BASE,
		payment_summary: {
			payment_type: 'PayPal',
			last_four: null,
			card_type: null
		}
	};

	const LIQUID_IV_MERCHANT = {
		largeLogo: 'https://cdn.shopify.com/s/files/1/1515/2714/files/LiquidIV_Logo.png'
	};

	const LIQUID_IV_COLORS = {
		primary: '#ffffff',
		action: '#35cad0'
	};

	const { Story } = defineMeta({
		title: 'Views/Thank You',
		component: ThankYouView,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			onClose: fn(),
			colors: LIQUID_IV_COLORS,
			merchantInfo: LIQUID_IV_MERCHANT
		}
	});
</script>

{#snippet template(args)}
	<div class="h-screen">
		<ThankYouView {...args} />
	</div>
{/snippet}

<Story name="Credit Card" args={{ order: MOCKED_ORDER_CARD }} {template} />

<Story name="Click to Pay" args={{ order: MOCKED_ORDER_C2P }} {template} />

<Story name="PayPal" args={{ order: MOCKED_ORDER_PAYPAL }} {template} />
