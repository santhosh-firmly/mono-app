<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CatalogOverviewPage from './catalog-overview-page.svelte';
	import { mockDomainStats, mockRunningWorkflows } from '../__mocks__/index.js';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/CatalogOverviewPage',
		component: CatalogOverviewPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Empty stats for empty state
	const emptyStats = {
		total_domains: 0,
		aggregate: {
			total_products: 0,
			pending: 0,
			success: 0,
			failed: 0,
			permanently_failed: 0,
			completion_percent: 0
		},
		domains: []
	};
</script>

{#snippet template(args)}
	<CatalogOverviewPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		pdStats: mockDomainStats,
		runningWorkflows: null,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		pdStats: null,
		runningWorkflows: null,
		loading: true,
		error: null
	}}
	{template}
/>

<Story
	name="With Running Workflows"
	args={{
		pdStats: mockDomainStats,
		runningWorkflows: mockRunningWorkflows,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="Empty State"
	args={{
		pdStats: emptyStats,
		runningWorkflows: null,
		loading: false,
		error: null
	}}
	{template}
/>
