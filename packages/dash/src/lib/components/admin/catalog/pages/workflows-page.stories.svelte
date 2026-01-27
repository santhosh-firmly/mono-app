<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorkflowsPage from './workflows-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/WorkflowsPage',
		component: WorkflowsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			loading: { control: 'boolean' },
			startingBulk: { control: 'boolean' },
			statusFilter: {
				control: 'select',
				options: ['all', 'processing', 'completed', 'with_errors', 'idle']
			},
			sortBy: {
				control: 'select',
				options: [
					'pending_desc',
					'pending_asc',
					'completion_asc',
					'completion_desc',
					'total_desc',
					'total_asc',
					'domain_asc',
					'domain_desc',
					'errors_desc'
				]
			}
		}
	});

	const mockDomains = [
		{
			domain: 'example.com',
			countryCode: 'US',
			total: 1500,
			success: 1200,
			pending: 200,
			failed: 80,
			permanently_failed: 20,
			completion_percent: 80
		},
		{
			domain: 'shop.example.com',
			countryCode: 'GB',
			total: 2500,
			success: 2400,
			pending: 50,
			failed: 40,
			permanently_failed: 10,
			completion_percent: 96
		},
		{
			domain: 'store.example.com',
			countryCode: 'DE',
			total: 800,
			success: 600,
			pending: 150,
			failed: 40,
			permanently_failed: 10,
			completion_percent: 75
		},
		{
			domain: 'buy.example.com',
			countryCode: 'FR',
			total: 1200,
			success: 500,
			pending: 600,
			failed: 80,
			permanently_failed: 20,
			completion_percent: 42
		},
		{
			domain: 'market.example.com',
			countryCode: 'ES',
			total: 950,
			success: 950,
			pending: 0,
			failed: 0,
			permanently_failed: 0,
			completion_percent: 100
		},
		{
			domain: 'deals.example.com',
			countryCode: 'IT',
			total: 700,
			success: 700,
			pending: 0,
			failed: 0,
			permanently_failed: 0,
			completion_percent: 100
		}
	];

	const mockPdStats = {
		total_domains: 6,
		domains: mockDomains
	};

	const allRunningDomains = mockDomains.map((d) => ({
		...d,
		pending: Math.floor(d.total * 0.3),
		success: Math.floor(d.total * 0.6),
		completion_percent: 60
	}));

	const allCompleteDomains = mockDomains.map((d) => ({
		...d,
		pending: 0,
		success: d.total,
		failed: 0,
		permanently_failed: 0,
		completion_percent: 100
	}));

	const noop = () => {};
</script>

{#snippet template(args)}
	<WorkflowsPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		pdStats: mockPdStats,
		statusFilter: 'all',
		sortBy: 'pending_desc',
		searchQuery: '',
		loading: false,
		startingBulk: false,
		triggeringDomain: null,
		error: null,
		onRefresh: noop,
		onTriggerWorkflow: noop,
		onStartBulkWorkflows: noop,
		onStatusFilterChange: noop,
		onSortByChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Filtered"
	args={{
		pdStats: mockPdStats,
		statusFilter: 'processing',
		sortBy: 'pending_desc',
		searchQuery: '',
		loading: false,
		startingBulk: false,
		triggeringDomain: null,
		error: null,
		onRefresh: noop,
		onTriggerWorkflow: noop,
		onStartBulkWorkflows: noop,
		onStatusFilterChange: noop,
		onSortByChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="All Running"
	args={{
		pdStats: {
			total_domains: 6,
			domains: allRunningDomains
		},
		statusFilter: 'all',
		sortBy: 'pending_desc',
		searchQuery: '',
		loading: false,
		startingBulk: false,
		triggeringDomain: null,
		error: null,
		onRefresh: noop,
		onTriggerWorkflow: noop,
		onStartBulkWorkflows: noop,
		onStatusFilterChange: noop,
		onSortByChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="All Complete"
	args={{
		pdStats: {
			total_domains: 6,
			domains: allCompleteDomains
		},
		statusFilter: 'all',
		sortBy: 'completion_desc',
		searchQuery: '',
		loading: false,
		startingBulk: false,
		triggeringDomain: null,
		error: null,
		onRefresh: noop,
		onTriggerWorkflow: noop,
		onStartBulkWorkflows: noop,
		onStatusFilterChange: noop,
		onSortByChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		pdStats: null,
		statusFilter: 'all',
		sortBy: 'pending_desc',
		searchQuery: '',
		loading: true,
		startingBulk: false,
		triggeringDomain: null,
		error: null,
		onRefresh: noop,
		onTriggerWorkflow: noop,
		onStartBulkWorkflows: noop,
		onStatusFilterChange: noop,
		onSortByChange: noop,
		onSearchQueryChange: noop,
		onDismissError: noop
	}}
	{template}
/>
