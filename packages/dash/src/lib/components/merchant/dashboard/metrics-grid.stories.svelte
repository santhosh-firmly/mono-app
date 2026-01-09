<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetricsGrid from './metrics-grid.svelte';
	import { mockSummary, mockSummaryNegative, mockSummaryZero } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Metrics Grid',
		component: MetricsGrid,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<MetricsGrid {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		summary: mockSummary,
		activeDestinations: 4
	}}
	{template}
/>

<Story
	name="With Negative Changes"
	args={{
		summary: mockSummaryNegative,
		activeDestinations: 3
	}}
	{template}
/>

<Story
	name="All Zeros"
	args={{
		summary: mockSummaryZero,
		activeDestinations: 0
	}}
	{template}
/>

<Story
	name="High Values"
	args={{
		summary: {
			totalRevenue: 1250000.99,
			totalOrders: 4523,
			aov: 276.42,
			revenueChange: 45.2,
			ordersChange: 38.7,
			aovChange: 4.8
		},
		activeDestinations: 8
	}}
	{template}
/>
