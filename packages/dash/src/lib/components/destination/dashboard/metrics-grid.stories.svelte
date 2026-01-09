<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MetricsGrid from './metrics-grid.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Dashboard/Metrics Grid',
		component: MetricsGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<script>
	const mockSummaryPositive = {
		totalRevenue: 125750.5,
		totalOrders: 342,
		aov: 367.69,
		revenueChange: 12.5,
		ordersChange: 8.3,
		aovChange: 3.8
	};

	const mockSummaryNegative = {
		totalRevenue: 89420.0,
		totalOrders: 215,
		aov: 415.91,
		revenueChange: -5.2,
		ordersChange: -12.1,
		aovChange: 7.8
	};

	const mockSummaryZero = {
		totalRevenue: 0,
		totalOrders: 0,
		aov: 0,
		revenueChange: null,
		ordersChange: null,
		aovChange: null
	};
</script>

{#snippet template(args)}
	<MetricsGrid summary={args.summary} activeMerchants={args.activeMerchants} />
{/snippet}

<Story
	name="With Positive Changes"
	args={{
		summary: mockSummaryPositive,
		activeMerchants: 24
	}}
	{template}
/>

<Story
	name="With Negative Changes"
	args={{
		summary: mockSummaryNegative,
		activeMerchants: 18
	}}
	{template}
/>

<Story
	name="No Data"
	args={{
		summary: mockSummaryZero,
		activeMerchants: 0
	}}
	{template}
/>

<Story
	name="High Volume"
	args={{
		summary: {
			totalRevenue: 2500000.0,
			totalOrders: 15420,
			aov: 162.13,
			revenueChange: 45.2,
			ordersChange: 38.7,
			aovChange: 4.7
		},
		activeMerchants: 156
	}}
	{template}
/>
