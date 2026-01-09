<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RevenueChartCard from './revenue-chart-card.svelte';
	import {
		mockRevenueChart,
		mockRevenueChartNoComparison,
		mockRevenueChartEmpty
	} from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Revenue Chart Card',
		component: RevenueChartCard,
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<RevenueChartCard {...args} />
	</div>
{/snippet}

<Story
	name="With Comparison Data"
	args={{
		revenueChart: mockRevenueChart
	}}
	{template}
/>

<Story
	name="No Comparison Data"
	args={{
		revenueChart: mockRevenueChartNoComparison
	}}
	{template}
/>

<Story
	name="Empty Data"
	args={{
		revenueChart: mockRevenueChartEmpty
	}}
	{template}
/>
