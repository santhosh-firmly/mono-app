<script>
	import Summary from './summary.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';
	import { within } from '@storybook/testing-library';
	import { expect } from '@storybook/jest';

	const cart = {
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
				description: 'Plant 5 : Do not order',
				variant_description: 'M / White'
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
		]
	};

	const lineItems = cart.line_items;

	const subscriptionLineItem = {
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
		line_item_id: 'cdab2358-bfce-4268-ad13-daee60ca2703'
	};
</script>

<Meta title="Checkout V4/Header/Summary" component={Summary} tags={['autodocs']} />

<Template let:args>
	<Summary subtotal={cart.sub_total} tax={cart.tax} total={cart.total} {...args} />
</Template>

<Story
	name="Single Line Item"
	args={{
		lineItems: [lineItems[0]]
	}}
/>
<Story
	name="Two Line Items"
	args={{
		lineItems: [
			lineItems[0],
			{ ...lineItems[0], line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }
		]
	}}
/>
<Story
	name="With Shipping Information"
	args={{
		lineItems: [
			lineItems[0],
			{ ...lineItems[0], line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }
		],
		shippingMethod: {
			description: 'Economy shipping',
			price: {
				currency: 'USD',
				value: 100.5
			}
		},
		tax: {
			currency: 'USD',
			value: 13.95
		}
	}}
/>
<Story
	name="With Subscription"
	args={{
		lineItems: [
			lineItems[0],
			subscriptionLineItem,
			{ ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }
		],
		shippingMethod: {
			description: 'Economy shipping',
			price: {
				currency: 'USD',
				value: 100.5
			}
		},
		tax: {
			currency: 'USD',
			value: 13.95
		}
	}}
/>
<Story
	name="With Store Credit and Reward Points"
	args={{
		lineItems: [
			lineItems[0],
			subscriptionLineItem,
			{ ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }
		],
		shippingMethod: {
			description: 'Economy shipping',
			price: {
				currency: 'USD',
				value: 100.5
			}
		},
		storeCredit: {
			currency: 'USD',
			value: 10.0
		},
		rewardPoints: {
			currency: 'USD',
			value: 39.95
		},
		tax: {
			currency: 'USD',
			value: 13.95
		}
	}}
/>
<Story
	name="With Zero Dollar Cart"
	args={{
		lineItems: [
			lineItems[0],
			subscriptionLineItem,
			{ ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }
		],
		shippingMethod: {
			description: 'Economy shipping',
			price: {
				currency: 'USD',
				value: 100.5
			}
		},
		total: {
			currency: 'USD',
			value: 0
		}
	}}
/>

<Story
	name="With Discounts Breakdown"
	args={{
		lineItems: [
			lineItems[0],
			subscriptionLineItem,
			{ ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }
		],
		shippingMethod: {
			description: 'Economy shipping',
			price: {
				currency: 'USD',
				value: 100.5
			}
		},
		total: {
			currency: 'USD',
			value: 0
		},
		discountsBreakdown: [
			{
				is_vip: false,
				step: 1,
				label: 'First Set for $19.99',
				discount: {
					currency: 'USD',
					value: 39.96
				}
			},
			{
				is_vip: true,
				step: 2,
				label: '2 VIP sets 45% OFF',
				discount: {
					currency: 'USD',
					value: 53.96
				}
			}
		]
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		await step('Validate discounts breakdown are present', async () => {
			const elements = canvas.queryAllByTestId('discount');

			expect(elements.length).toEqual(2);
			expect(elements[0].textContent).toEqual('First Set for $19.99 (-$39.96) ');
			expect(elements[1].textContent).toEqual('2 VIP sets 45% OFF (-$53.96) ');
		});
	}}
/>

<Story name="Skeleton">
	<Summary />
</Story>
