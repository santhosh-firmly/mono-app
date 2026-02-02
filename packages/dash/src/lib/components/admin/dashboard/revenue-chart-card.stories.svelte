<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RevenueChartCard from './revenue-chart-card.svelte';
	import { mockRevenueChart, mockRevenueChartEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Revenue Chart Card',
		component: RevenueChartCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<RevenueChartCard revenueChart={args.revenueChart} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		revenueChart: mockRevenueChart
	}}
	{template}
/>

<Story
	name="No Data"
	args={{
		revenueChart: mockRevenueChartEmpty
	}}
	{template}
/>

<Story
	name="Current Month Only"
	args={{
		revenueChart: {
			currentMonth: mockRevenueChart.currentMonth,
			previousMonth: [],
			currentMonthLabel: 'This month',
			previousMonthLabel: 'Last month'
		}
	}}
	{template}
/>
