<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AreaChart from './area-chart.svelte';

	const { Story } = defineMeta({
		title: 'Data Display/Charts/Area Chart',
		component: AreaChart,
		parameters: {
			layout: 'padded'
		}
	});

	// Current month data (partial month - only 10 days)
	const currentMonthData = [
		{ day: 1, date: 'Jan 01', revenue: 1200 },
		{ day: 2, date: 'Jan 02', revenue: 2400 },
		{ day: 3, date: 'Jan 03', revenue: 3100 },
		{ day: 4, date: 'Jan 04', revenue: 3100 },
		{ day: 5, date: 'Jan 05', revenue: 4500 },
		{ day: 6, date: 'Jan 06', revenue: 5800 },
		{ day: 7, date: 'Jan 07', revenue: 7200 },
		{ day: 8, date: 'Jan 08', revenue: 8100 },
		{ day: 9, date: 'Jan 09', revenue: 9500 },
		{ day: 10, date: 'Jan 10', revenue: 10200 }
	];

	// Previous month data (full month - 31 days)
	const previousMonthData = Array.from({ length: 31 }, (_, i) => ({
		day: i + 1,
		date: `Dec ${String(i + 1).padStart(2, '0')}`,
		revenue: Math.round(500 + i * 300 + Math.random() * 200)
	}));

	// Previous month with higher values
	const previousMonthHigherData = Array.from({ length: 31 }, (_, i) => ({
		day: i + 1,
		date: `Dec ${String(i + 1).padStart(2, '0')}`,
		revenue: Math.round(2000 + i * 500 + Math.random() * 300)
	}));

	// Previous month with all zeros (no orders)
	const previousMonthZeroData = Array.from({ length: 31 }, (_, i) => ({
		day: i + 1,
		date: `Dec ${String(i + 1).padStart(2, '0')}`,
		revenue: 0
	}));

	// Empty array
	const emptyData = [];
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<AreaChart {...args} />
	</div>
{/snippet}

<Story
	name="With Comparison Data"
	args={{
		data: currentMonthData,
		comparisonData: previousMonthData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#8b5cf6'
	}}
	{template}
/>

<Story
	name="Current Month Higher Than Last"
	args={{
		data: currentMonthData,
		comparisonData: previousMonthData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#8b5cf6'
	}}
	{template}
/>

<Story
	name="Last Month Higher Than Current"
	args={{
		data: currentMonthData,
		comparisonData: previousMonthHigherData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#8b5cf6'
	}}
	{template}
/>

<Story
	name="No Comparison Data"
	args={{
		data: currentMonthData,
		comparisonData: emptyData,
		label: 'This month',
		color: '#8b5cf6'
	}}
	{template}
/>

<Story
	name="Last Month All Zeros"
	args={{
		data: currentMonthData,
		comparisonData: previousMonthZeroData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#8b5cf6'
	}}
	{template}
/>

<Story
	name="Empty Current Month"
	args={{
		data: emptyData,
		comparisonData: previousMonthData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#8b5cf6'
	}}
	{template}
/>

<Story
	name="Blue Color"
	args={{
		data: currentMonthData,
		comparisonData: previousMonthData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#3b82f6'
	}}
	{template}
/>

<Story
	name="Green Color"
	args={{
		data: currentMonthData,
		comparisonData: previousMonthData,
		label: 'This month',
		comparisonLabel: 'Last month',
		color: '#10b981'
	}}
	{template}
/>
