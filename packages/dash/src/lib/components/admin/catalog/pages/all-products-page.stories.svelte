<script module>
	import { SvelteMap } from 'svelte/reactivity';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AllProductsPage from './all-products-page.svelte';
	import { mockDomainStats } from '../__mocks__/index.js';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/AllProductsPage',
		component: AllProductsPage,
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

	// Mock active jobs
	const mockActiveJobs = new SvelteMap([
		[
			'acme-store.com/US',
			{
				domain: 'acme-store.com',
				countryCode: 'US',
				jobId: 'job-abc123def456',
				status: 'running',
				startedAt: new Date().toISOString()
			}
		],
		[
			'widgets-inc.com/US',
			{
				domain: 'widgets-inc.com',
				countryCode: 'US',
				jobId: 'job-xyz789ghi012',
				status: 'complete',
				startedAt: new Date(Date.now() - 3600000).toISOString(),
				completedAt: new Date().toISOString()
			}
		],
		[
			'gadgets-world.com/UK',
			{
				domain: 'gadgets-world.com',
				countryCode: 'UK',
				jobId: 'job-err456fail',
				status: 'errored',
				startedAt: new Date(Date.now() - 7200000).toISOString(),
				error: 'Rate limit exceeded'
			}
		]
	]);

	const emptyJobs = new SvelteMap();
</script>

{#snippet template(args)}
	<AllProductsPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		pdStats: mockDomainStats,
		activeJobs: emptyJobs,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="With Active Jobs"
	args={{
		pdStats: mockDomainStats,
		activeJobs: mockActiveJobs,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		pdStats: null,
		activeJobs: emptyJobs,
		loading: true,
		error: null
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		pdStats: emptyStats,
		activeJobs: emptyJobs,
		loading: false,
		error: null
	}}
	{template}
/>
