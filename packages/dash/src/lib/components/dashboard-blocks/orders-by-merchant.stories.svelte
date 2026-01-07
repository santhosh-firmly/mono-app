<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrdersByMerchant from './orders-by-merchant.svelte';

	const { Story } = defineMeta({
		title: 'Data Display/Cards/Orders By Merchant',
		component: OrdersByMerchant,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const mockOrdersByMerchant = {
		results: [
			{
				shop_id: 'acme-store.com',
				total_orders: 156,
				net_sales: 23450.0,
				aov: 150.32
			},
			{
				shop_id: 'best-deals.com',
				total_orders: 89,
				net_sales: 12340.5,
				aov: 138.66
			},
			{
				shop_id: 'fashion-hub.com',
				total_orders: 234,
				net_sales: 45678.9,
				aov: 195.21
			},
			{
				shop_id: 'tech-gadgets.io',
				total_orders: 67,
				net_sales: 18900.0,
				aov: 282.09
			}
		]
	};

	const mockMerchants = {
		results: [
			{
				key: 'acme-store.com',
				info: JSON.stringify({ display_name: 'ACME Store' })
			},
			{
				key: 'best-deals.com',
				info: JSON.stringify({ display_name: 'Best Deals' })
			},
			{
				key: 'fashion-hub.com',
				info: JSON.stringify({ display_name: 'Fashion Hub' })
			},
			{
				key: 'tech-gadgets.io',
				info: JSON.stringify({ display_name: 'Tech Gadgets' })
			}
		]
	};
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<OrdersByMerchant {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		ordersByMerchant: mockOrdersByMerchant,
		merchants: mockMerchants
	}}
	{template}
/>

<Story
	name="Single Merchant"
	args={{
		ordersByMerchant: {
			results: [mockOrdersByMerchant.results[0]]
		},
		merchants: mockMerchants
	}}
	{template}
/>

<Story
	name="Unknown Merchants"
	args={{
		ordersByMerchant: mockOrdersByMerchant,
		merchants: { results: [] }
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		ordersByMerchant: { results: [] },
		merchants: { results: [] }
	}}
	{template}
/>
