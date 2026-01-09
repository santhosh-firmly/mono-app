<script context="module">
	import PieChart from './pie-chart.svelte';
	export const meta = {
		title: 'Data Display/Charts/Pie Chart',
		component: PieChart,
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

	const manyItems = [
		{ name: 'ChatGPT', orders: 1247, revenue: 177705 },
		{ name: 'Gemini', orders: 2156, revenue: 337959 },
		{ name: 'Klarna', orders: 1891, revenue: 316554 },
		{ name: 'Co-Pilot', orders: 1534, revenue: 214607 },
		{ name: 'Perplexity', orders: 893, revenue: 114567 },
		{ name: 'Claude', orders: 672, revenue: 65990 },
		{ name: 'Alexa', orders: 421, revenue: 90767 },
		{ name: 'Siri', orders: 312, revenue: 45678 }
	];

	const emptyData = [];
</script>

<Story name="Orders Distribution">
	<div class="max-w-md">
		<PieChart data={destinationData} valueKey="orders" />
	</div>
</Story>

<Story name="Revenue Distribution">
	<div class="max-w-md">
		<PieChart data={destinationData} valueKey="revenue" />
	</div>
</Story>

<Story name="Single Item">
	<div class="max-w-md">
		<PieChart data={singleItem} valueKey="orders" />
	</div>
</Story>

<Story name="Many Items">
	<div class="max-w-md">
		<PieChart data={manyItems} valueKey="orders" />
	</div>
</Story>

<Story name="Empty Data">
	<div class="max-w-md">
		<PieChart data={emptyData} valueKey="orders" />
	</div>
</Story>
