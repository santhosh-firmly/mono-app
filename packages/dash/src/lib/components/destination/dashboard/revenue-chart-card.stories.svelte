<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RevenueChartCard from './revenue-chart-card.svelte';

	const { Story } = defineMeta({
		title: 'Destination/Dashboard/Revenue Chart Card',
		component: RevenueChartCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

<script>
	// Generate mock cumulative revenue data
	function generateCumulativeData(days, baseValue, variance) {
		let cumulative = 0;
		return Array.from({ length: days }, (_, i) => {
			const dailyRevenue = baseValue + (Math.random() - 0.5) * variance;
			cumulative += dailyRevenue;
			return {
				date: `Day ${i + 1}`,
				value: Math.round(cumulative * 100) / 100
			};
		});
	}

	const mockRevenueChart = {
		currentMonth: generateCumulativeData(15, 5000, 2000),
		previousMonth: generateCumulativeData(30, 4500, 1800),
		currentMonthLabel: 'January 2026',
		previousMonthLabel: 'December 2025'
	};

	const mockRevenueChartEmpty = {
		currentMonth: [],
		previousMonth: [],
		currentMonthLabel: 'January 2026',
		previousMonthLabel: 'December 2025'
	};

	const mockRevenueChartGrowth = {
		currentMonth: generateCumulativeData(20, 8000, 3000),
		previousMonth: generateCumulativeData(30, 5000, 2000),
		currentMonthLabel: 'January 2026',
		previousMonthLabel: 'December 2025'
	};
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
	name="Strong Growth"
	args={{
		revenueChart: mockRevenueChartGrowth
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
			currentMonth: generateCumulativeData(10, 6000, 2500),
			previousMonth: [],
			currentMonthLabel: 'January 2026',
			previousMonthLabel: null
		}
	}}
	{template}
/>
