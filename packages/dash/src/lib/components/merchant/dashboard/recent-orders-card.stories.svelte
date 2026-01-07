<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RecentOrdersCard from './recent-orders-card.svelte';
	import { mockRecentOrders, mockRecentOrdersEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Recent Orders Card',
		component: RecentOrdersCard,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<RecentOrdersCard {...args} />
	</div>
{/snippet}

<Story
	name="With Data"
	args={{
		recentOrders: mockRecentOrders
	}}
	{template}
/>

<Story
	name="Empty Data"
	args={{
		recentOrders: mockRecentOrdersEmpty
	}}
	{template}
/>

<Story
	name="Single Order"
	args={{
		recentOrders: [
			{
				id: 'ORD-2024-001234',
				destination: 'Shopify',
				amount: 299.99,
				date: new Date().toISOString(),
				itemCount: 3
			}
		]
	}}
	{template}
/>

<Story
	name="Single Item Orders"
	args={{
		recentOrders: [
			{
				id: 'ORD-2024-001234',
				destination: 'Shopify',
				amount: 99.99,
				date: new Date().toISOString(),
				itemCount: 1
			},
			{
				id: 'ORD-2024-001233',
				destination: 'WooCommerce',
				amount: 149.5,
				date: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
				itemCount: 1
			}
		]
	}}
	{template}
/>
