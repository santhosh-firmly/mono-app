<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import OrderItemsList from './order-items-list.svelte';

	const { Story } = defineMeta({
		title: 'Orders/Order Items List',
		component: OrderItemsList,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			items: orderData.order.order_info.line_items,
			title: 'Order Items'
		},
		argTypes: {
			items: { control: 'object', description: 'Array of line items to display' },
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<OrderItemsList {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="Single Item" args={{ items: [orderData.order.order_info.line_items[0]] }} {template} />

<Story name="Empty" args={{ items: [] }} {template} />

<Story
	name="Without Images"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			image_url: null
		}))
	}}
	{template}
/>
