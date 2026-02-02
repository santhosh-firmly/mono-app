<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DashboardFilters from './dashboard-filters.svelte';
	import { mockMerchants, mockDestinations } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Dashboard Filters',
		component: DashboardFilters,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<DashboardFilters
		merchants={args.merchants}
		destinations={args.destinations}
		selectedMerchants={args.selectedMerchants}
		selectedDestinations={args.selectedDestinations}
	/>
{/snippet}

<Story
	name="Default"
	args={{
		merchants: mockMerchants,
		destinations: mockDestinations,
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>

<Story
	name="With Selections"
	args={{
		merchants: mockMerchants,
		destinations: mockDestinations,
		selectedMerchants: ['Luxe Fashion', 'Tech Gadgets Pro'],
		selectedDestinations: ['Affirm']
	}}
	{template}
/>

<Story
	name="Many Selections"
	args={{
		merchants: mockMerchants,
		destinations: mockDestinations,
		selectedMerchants: ['Luxe Fashion', 'Tech Gadgets Pro', 'Home Essentials', 'Sports Outlet'],
		selectedDestinations: ['Affirm', 'Klarna', 'Afterpay']
	}}
	{template}
/>

<Story
	name="Empty Options"
	args={{
		merchants: [],
		destinations: [],
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>
