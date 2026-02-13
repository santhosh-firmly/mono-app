<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SvelteMap } from 'svelte/reactivity';
	import EnrichmentPage from './enrichment-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/EnrichmentPage',
		component: EnrichmentPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock data
	const mockOverview = {
		summary: {
			totalCategories: 156,
			totalMappings: 12500,
			uniqueDomains: 45,
			totalJobs: 234,
			completedJobs: 210,
			runningJobs: 3
		},
		enrichmentStats: {
			totalAliasHits: 45000,
			totalCacheHits: 32000,
			totalAiCalls: 8500
		}
	};

	const mockDomains = [
		{
			domain: 'acme-store.com',
			countryCode: 'US',
			total: 15420,
			pending: 234,
			success: 14986,
			failed: 200
		},
		{
			domain: 'widgets-inc.com',
			countryCode: 'US',
			total: 8750,
			pending: 0,
			success: 8700,
			failed: 50
		},
		{
			domain: 'gadgets-world.com',
			countryCode: 'UK',
			total: 5230,
			pending: 1500,
			success: 3500,
			failed: 230
		},
		{
			domain: 'tech-emporium.com',
			countryCode: 'US',
			total: 22100,
			pending: 5000,
			success: 16500,
			failed: 600
		}
	];

	const mockCategories = [
		{ name: 'Electronics', product_count: 12500, aliases: ['Tech', 'Gadgets', 'Devices'] },
		{ name: 'Apparel', product_count: 8900, aliases: ['Clothing', 'Fashion', 'Wear'] },
		{ name: 'Footwear', product_count: 4200, aliases: ['Shoes', 'Boots', 'Sneakers'] },
		{ name: 'Accessories', product_count: 6700, aliases: ['Bags', 'Wallets', 'Jewelry'] },
		{ name: 'Home & Garden', product_count: 9800, aliases: ['Home', 'Garden', 'Decor'] },
		{
			name: 'Sports & Outdoors',
			product_count: 5400,
			aliases: ['Sports', 'Outdoor', 'Fitness']
		}
	];

	const mockJobs = [
		{
			id: 'job-001',
			domain: 'acme-store.com',
			countryCode: 'US',
			status: 'running',
			total_products: 15420,
			processed_products: 8500,
			started_at: '2024-01-15T10:00:00Z'
		},
		{
			id: 'job-002',
			domain: 'widgets-inc.com',
			countryCode: 'US',
			status: 'completed',
			total_products: 8750,
			processed_products: 8750,
			started_at: '2024-01-14T09:00:00Z',
			completed_at: '2024-01-14T11:30:00Z'
		},
		{
			id: 'job-003',
			domain: 'gadgets-world.com',
			countryCode: 'UK',
			status: 'failed',
			total_products: 5230,
			processed_products: 2100,
			started_at: '2024-01-13T14:00:00Z',
			error_message: 'Rate limit exceeded'
		}
	];

	const mockRunningJobs = [
		{
			id: 'job-running-001',
			domain: 'acme-store.com',
			countryCode: 'US',
			status: 'running',
			total_products: 15420,
			processed_products: 10200,
			started_at: new Date().toISOString()
		},
		{
			id: 'job-running-002',
			domain: 'tech-emporium.com',
			countryCode: 'US',
			status: 'pending',
			total_products: 22100,
			processed_products: 0,
			started_at: new Date().toISOString()
		}
	];

	const defaultArgs = {
		overview: mockOverview,
		domains: mockDomains,
		categories: mockCategories,
		jobs: mockJobs,
		loading: false,
		error: null,
		onRefresh: () => console.log('Refresh clicked'),
		onTriggerWorkflows: async (domains, callbacks) => {
			console.log('Triggering workflows for:', domains);
			for (let i = 0; i < domains.length; i++) {
				callbacks.onProgress(i, 'running', `job-${i}`);
				await new Promise((r) => setTimeout(r, 500));
				callbacks.onProgress(i, 'complete', `job-${i}`);
			}
		},
		onDismissError: () => console.log('Error dismissed'),
		categoryLinkPrefix: '/admin/catalog/enrichment/category'
	};
</script>

{#snippet template(args)}
	<EnrichmentPage {...args} />
{/snippet}

<Story name="Default" args={defaultArgs} {template} />

<Story
	name="With Running Jobs"
	args={{
		...defaultArgs,
		jobs: mockRunningJobs,
		overview: {
			...mockOverview,
			summary: {
				...mockOverview.summary,
				runningJobs: 2
			}
		}
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		...defaultArgs,
		loading: true
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		...defaultArgs,
		overview: null,
		domains: [],
		categories: [],
		jobs: []
	}}
	{template}
/>
