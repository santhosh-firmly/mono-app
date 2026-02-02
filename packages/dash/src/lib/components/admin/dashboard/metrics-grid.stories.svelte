<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetricsGrid from './metrics-grid.svelte';
	import { mockSummary, mockSummaryNegative, mockSummaryEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Metrics Grid',
		component: MetricsGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<MetricsGrid
		summary={args.summary}
		activeMerchants={args.activeMerchants}
		activeDestinations={args.activeDestinations}
	/>
{/snippet}

<Story
	name="Default"
	args={{
		summary: mockSummary,
		activeMerchants: 6,
		activeDestinations: 4
	}}
	{template}
/>

<Story
	name="Negative Trends"
	args={{
		summary: mockSummaryNegative,
		activeMerchants: 4,
		activeDestinations: 3
	}}
	{template}
/>

<Story
	name="No Data"
	args={{
		summary: mockSummaryEmpty,
		activeMerchants: 0,
		activeDestinations: 0
	}}
	{template}
/>

<Story
	name="High Volume"
	args={{
		summary: {
			totalRevenue: 5250000.0,
			totalOrders: 38420,
			aov: 136.65,
			revenueChange: 28.5,
			ordersChange: 22.3,
			aovChange: 5.1
		},
		activeMerchants: 45,
		activeDestinations: 12
	}}
	{template}
/>
