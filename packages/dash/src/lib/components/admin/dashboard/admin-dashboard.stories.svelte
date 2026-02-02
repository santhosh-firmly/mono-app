<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AdminDashboard from './admin-dashboard.svelte';
	import { mockDashboardData, mockDashboardDataEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Admin/Dashboard/Admin Dashboard',
		component: AdminDashboard,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="p-6">
		<AdminDashboard
			dashboardData={args.dashboardData}
			loading={args.loading}
			error={args.error}
			selectedMerchants={args.selectedMerchants}
			selectedDestinations={args.selectedDestinations}
		/>
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		dashboardData: mockDashboardData,
		loading: false,
		error: '',
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>

<Story
	name="With Filters Applied"
	args={{
		dashboardData: mockDashboardData,
		loading: false,
		error: '',
		selectedMerchants: ['Luxe Fashion', 'Tech Gadgets Pro'],
		selectedDestinations: ['Affirm']
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		dashboardData: null,
		loading: true,
		error: '',
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>

<Story
	name="Loading With Data"
	args={{
		dashboardData: mockDashboardData,
		loading: true,
		error: '',
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>

<Story
	name="Error State"
	args={{
		dashboardData: null,
		loading: false,
		error: 'Failed to fetch dashboard data. Please try again.',
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>

<Story
	name="Empty Data"
	args={{
		dashboardData: mockDashboardDataEmpty,
		loading: false,
		error: '',
		selectedMerchants: [],
		selectedDestinations: []
	}}
	{template}
/>
