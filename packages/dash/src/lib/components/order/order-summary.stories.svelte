<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import OrderSummary from './order-summary.svelte';

	const orderInfo = orderData.order.order_info;

	const { Story } = defineMeta({
		title: 'Orders/Order Summary',
		component: OrderSummary,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			subtotal: orderInfo.sub_total,
			discount: orderInfo.cart_discount?.value || 0,
			shipping: orderInfo.shipping_total,
			tax: orderInfo.tax,
			total: orderInfo.total
		},
		argTypes: {
			subtotal: { control: 'number', description: 'Order subtotal' },
			discount: { control: 'number', description: 'Discount amount (shown in green if > 0)' },
			shipping: { control: 'number', description: 'Shipping cost' },
			tax: { control: 'number', description: 'Tax amount' },
			total: { control: 'number', description: 'Order total' },
			refund: {
				control: 'object',
				description: 'Refund total (currency object with value, shown in red if > 0)'
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm rounded-lg border bg-card p-4">
		<OrderSummary {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="No Discount"
	args={{
		subtotal: 100,
		discount: 0,
		shipping: 10,
		tax: 8,
		total: 118
	}}
	{template}
/>

<Story
	name="Free Shipping"
	args={{
		subtotal: 150,
		discount: 15,
		shipping: 0,
		tax: 12.15,
		total: 147.15
	}}
	{template}
/>

<Story
	name="Large Order"
	args={{
		subtotal: 1299.99,
		discount: 200,
		shipping: 0,
		tax: 98.99,
		total: 1198.98
	}}
	{template}
/>

<Story
	name="With Partial Refund"
	args={{
		subtotal: 100,
		discount: 0,
		shipping: 10,
		tax: 8,
		total: 118,
		refund: { currency: 'USD', value: 27.53, number: 2753, symbol: '$' }
	}}
	{template}
/>

<Story
	name="With Full Refund"
	args={{
		subtotal: 100,
		discount: 0,
		shipping: 10,
		tax: 8,
		total: 118,
		refund: { currency: 'USD', value: 118, number: 11800, symbol: '$' }
	}}
	{template}
/>
