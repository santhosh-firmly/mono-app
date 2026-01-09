<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrdersByDestinationCard from './orders-by-destination-card.svelte';
	import { mockDestinationChart, mockDestinationChartEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Orders By Destination Card',
		component: OrdersByDestinationCard,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-md">
		<OrdersByDestinationCard {...args} />
	</div>
{/snippet}

<Story
	name="With Data"
	args={{
		destinationChart: mockDestinationChart
	}}
	{template}
/>

<Story
	name="Empty Data"
	args={{
		destinationChart: mockDestinationChartEmpty
	}}
	{template}
/>

<Story
	name="Single Destination"
	args={{
		destinationChart: [
			{ id: 'shopify', name: 'Shopify', revenue: 18500, orders: 62, aov: 298.39 }
		]
	}}
	{template}
/>
