<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TopProductsCard from './top-products-card.svelte';
	import { mockTopProducts } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Top Products Card',
		component: TopProductsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<TopProductsCard topProducts={args.topProducts} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		topProducts: mockTopProducts
	}}
	{template}
/>

<Story
	name="Few Products"
	args={{
		topProducts: mockTopProducts.slice(0, 3)
	}}
	{template}
/>

<Story
	name="No Data"
	args={{
		topProducts: []
	}}
	{template}
/>
