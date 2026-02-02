<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TopDestinationsCard from './top-destinations-card.svelte';
	import { mockTopDestinations } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Top Destinations Card',
		component: TopDestinationsCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-md">
		<TopDestinationsCard topDestinations={args.topDestinations} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		topDestinations: mockTopDestinations
	}}
	{template}
/>

<Story
	name="Few Destinations"
	args={{
		topDestinations: mockTopDestinations.slice(0, 3)
	}}
	{template}
/>

<Story
	name="No Data"
	args={{
		topDestinations: []
	}}
	{template}
/>
