<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { AdminDashboard } from '$lib/components/admin/dashboard/index.js';
	import {
		mockDashboardData,
		mockDashboardDataEmpty
	} from '$lib/components/admin/dashboard/_mock-data.js';

	const { Story } = defineMeta({
		title: 'Pages/Admin/Dashboard',
		component: AdminDashboard,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="bg-background min-h-screen p-6">
		<h1 class="text-2xl font-semibold mb-6">Dashboard</h1>
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
	name="With Filters"
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
	name="Error"
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
