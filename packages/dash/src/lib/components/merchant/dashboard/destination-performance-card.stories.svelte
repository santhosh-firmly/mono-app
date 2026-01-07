<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationPerformanceCard from './destination-performance-card.svelte';
	import { mockDestinationChart, mockDestinationChartEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Destination Performance Card',
		component: DestinationPerformanceCard,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<DestinationPerformanceCard {...args} />
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
	name="Many Destinations"
	args={{
		destinationChart: [
			{ id: 'shopify', name: 'Shopify', revenue: 18500, orders: 62, aov: 298.39 },
			{ id: 'woocommerce', name: 'WooCommerce', revenue: 12300, orders: 45, aov: 273.33 },
			{ id: 'bigcommerce', name: 'BigCommerce', revenue: 8900, orders: 32, aov: 278.13 },
			{ id: 'magento', name: 'Magento', revenue: 5530, orders: 17, aov: 325.29 },
			{ id: 'prestashop', name: 'PrestaShop', revenue: 3200, orders: 12, aov: 266.67 },
			{ id: 'squarespace', name: 'Squarespace', revenue: 2100, orders: 8, aov: 262.5 }
		]
	}}
	{template}
/>
