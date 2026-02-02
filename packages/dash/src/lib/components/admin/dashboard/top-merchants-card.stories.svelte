<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TopMerchantsCard from './top-merchants-card.svelte';
	import { mockTopMerchants } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Top Merchants Card',
		component: TopMerchantsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<TopMerchantsCard topMerchants={args.topMerchants} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		topMerchants: mockTopMerchants
	}}
	{template}
/>

<Story
	name="Few Merchants"
	args={{
		topMerchants: mockTopMerchants.slice(0, 2)
	}}
	{template}
/>

<Story
	name="No Data"
	args={{
		topMerchants: []
	}}
	{template}
/>
