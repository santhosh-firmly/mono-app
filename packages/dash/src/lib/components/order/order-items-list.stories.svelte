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

<Story
	name="With Delivered Status"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			platform_status: 'Delivered'
		}))
	}}
	{template}
/>

<Story
	name="With Shipped Status"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			platform_status: 'Shipped'
		}))
	}}
	{template}
/>

<Story
	name="With Cancelled Status"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			platform_status: 'Cancelled'
		}))
	}}
	{template}
/>

<Story
	name="With Returned Status"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			platform_status: 'Returned'
		}))
	}}
	{template}
/>

<Story
	name="With Pending Status"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			platform_status: 'Pending'
		}))
	}}
	{template}
/>

<Story
	name="With Mixed Statuses"
	args={{
		items: [
			{ ...orderData.order.order_info.line_items[0], platform_status: 'Delivered' },
			{
				...orderData.order.order_info.line_items[0],
				description: 'Second Item',
				platform_status: 'Shipped'
			},
			{
				...orderData.order.order_info.line_items[0],
				description: 'Third Item',
				platform_status: 'Cancelled'
			},
			{
				...orderData.order.order_info.line_items[0],
				description: 'Fourth Item',
				platform_status: null
			}
		]
	}}
	{template}
/>

<Story
	name="Without Status (No Badge)"
	args={{
		items: orderData.order.order_info.line_items.map((item) => ({
			...item,
			platform_status: null
		}))
	}}
	{template}
/>
