<script context="module">
	import BarChart from './bar-chart.svelte';
	export const meta = {
		title: 'Data Display/Charts/Bar Chart',
		component: BarChart,
		parameters: {
			layout: 'padded'
		}
	};
</script>

<script>
	import { Story } from '@storybook/addon-svelte-csf';

	const destinationData = [
		{ name: 'ChatGPT', orders: 1247, revenue: 177705 },
		{ name: 'Gemini', orders: 2156, revenue: 337959 },
		{ name: 'Klarna', orders: 1891, revenue: 316554 },
		{ name: 'Co-Pilot', orders: 1534, revenue: 214607 },
		{ name: 'Perplexity', orders: 893, revenue: 114567 }
	];

	const singleItem = [{ name: 'ChatGPT', orders: 1247, revenue: 177705 }];

	const twoItems = [
		{ name: 'ChatGPT', orders: 1247, revenue: 177705 },
		{ name: 'Gemini', orders: 2156, revenue: 337959 }
	];

	const emptyData = [];
</script>

<Story name="Default">
	<div class="max-w-3xl">
		<BarChart data={destinationData} />
	</div>
</Story>

<Story name="Single Destination">
	<div class="max-w-3xl">
		<BarChart data={singleItem} />
	</div>
</Story>

<Story name="Two Destinations">
	<div class="max-w-3xl">
		<BarChart data={twoItems} />
	</div>
</Story>

<Story name="Empty Data">
	<div class="max-w-3xl">
		<BarChart data={emptyData} />
	</div>
</Story>
