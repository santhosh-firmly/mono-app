<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TopProductsCard from './top-products-card.svelte';
	import { mockTopProducts, mockTopProductsEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Top Products Card',
		component: TopProductsCard,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<TopProductsCard {...args} />
	</div>
{/snippet}

<Story
	name="With Data"
	args={{
		topProducts: mockTopProducts
	}}
	{template}
/>

<Story
	name="Empty Data"
	args={{
		topProducts: mockTopProductsEmpty
	}}
	{template}
/>

<Story
	name="Single Product"
	args={{
		topProducts: [
			{ id: 'prod-1', name: 'Premium Widget Pro', quantity: 45, orders: 38, revenue: 8955 }
		]
	}}
	{template}
/>

<Story
	name="Long Product Names"
	args={{
		topProducts: [
			{
				id: 'prod-1',
				name: 'Premium Widget Pro with Extended Features and Accessories Bundle Pack',
				quantity: 45,
				orders: 38,
				revenue: 8955
			},
			{
				id: 'prod-2',
				name: 'Classic Widget Standard Edition for Professional Use',
				quantity: 32,
				orders: 28,
				revenue: 4480
			}
		]
	}}
	{template}
/>
