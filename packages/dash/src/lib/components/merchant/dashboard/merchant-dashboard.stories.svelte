<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MerchantDashboard from './merchant-dashboard.svelte';
	import { mockDashboardData, mockDashboardDataEmpty } from './_mock-data.js';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Full Dashboard',
		component: MerchantDashboard,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

{#snippet template(args)}
	<div class="p-6 bg-gray-50 min-h-screen">
		<MerchantDashboard {...args} />
	</div>
{/snippet}

<Story
	name="Full Dashboard"
	args={{
		dashboardData: mockDashboardData,
		userName: 'John Doe'
	}}
	{template}
/>

<Story
	name="Empty Dashboard"
	args={{
		dashboardData: mockDashboardDataEmpty,
		userName: 'New User'
	}}
	{template}
/>

<Story
	name="No User Name"
	args={{
		dashboardData: mockDashboardData,
		userName: ''
	}}
	{template}
/>
