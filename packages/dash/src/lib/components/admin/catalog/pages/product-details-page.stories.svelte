<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SvelteMap } from 'svelte/reactivity';
	import ProductDetailsPage from './product-details-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/ProductDetailsPage',
		component: ProductDetailsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock data
	const mockDomains = [
		{
			domain: 'acme-store.com',
			countryCode: 'US',
			total: 15420,
			pending: 234,
			success: 14986,
			failed: 150,
			permanently_failed: 50,
			completion_percent: 97
		},
		{
			domain: 'widgets-inc.com',
			countryCode: 'US',
			total: 8750,
			pending: 0,
			success: 8700,
			failed: 30,
			permanently_failed: 20,
			completion_percent: 100
		},
		{
			domain: 'gadgets-world.com',
			countryCode: 'UK',
			total: 5230,
			pending: 1500,
			success: 3500,
			failed: 180,
			permanently_failed: 50,
			completion_percent: 67
		},
		{
			domain: 'tech-emporium.com',
			countryCode: 'US',
			total: 22100,
			pending: 5000,
			success: 16500,
			failed: 400,
			permanently_failed: 200,
			completion_percent: 75
		},
		{
			domain: 'fashion-hub.com',
			countryCode: 'DE',
			total: 12340,
			pending: 0,
			success: 12340,
			failed: 0,
			permanently_failed: 0,
			completion_percent: 100
		}
	];

	const mockStats = {
		total_domains: 5,
		aggregate: {
			total_products: 63840,
			pending: 6734,
			success: 56026,
			failed: 760,
			permanently_failed: 320,
			completion_percent: 88
		},
		domains: mockDomains,
		domains_with_errors: []
	};

	const mockVariantStats = {
		total_domains_with_variants: 4,
		aggregate: {
			total_variants: 145000,
			available_count: 128500,
			out_of_stock_count: 16500,
			price_history_records: 892000
		}
	};

	function createLastRunDatesMap() {
		const map = new SvelteMap();
		map.set('acme-store.com/US', '2024-01-15T10:30:00Z');
		map.set('widgets-inc.com/US', '2024-01-14T08:00:00Z');
		map.set('fashion-hub.com/DE', '2024-01-13T16:00:00Z');
		return map;
	}

	const defaultArgs = {
		stats: mockStats,
		variantStats: mockVariantStats,
		loading: false,
		loadingMetadata: false,
		error: null,
		lastRunDates: createLastRunDatesMap(),
		onRefresh: () => console.log('Refresh clicked'),
		onTriggerWorkflows: async (domains, callbacks) => {
			console.log('Triggering workflows for:', domains);
			for (let i = 0; i < domains.length; i++) {
				const key = `${domains[i].domain}/${domains[i].countryCode}`;
				callbacks.onProgress(i, 'running', `job-${i}`);
				callbacks.onJobStarted(key, { status: 'running', jobId: `job-${i}` });
				await new Promise((r) => setTimeout(r, 1500));
				callbacks.onProgress(i, 'complete', `job-${i}`);
				callbacks.onJobCompleted(key, new Date().toISOString());
			}
		},
		onDismissError: () => console.log('Error dismissed'),
		domainLinkPrefix: '/admin/catalog/product-details'
	};

	const mockStatsWithErrors = {
		...mockStats,
		domains_with_errors: [
			{
				domain: 'gadgets-world.com',
				countryCode: 'UK',
				error: 'Rate limit exceeded - too many requests'
			},
			{
				domain: 'tech-emporium.com',
				countryCode: 'US',
				error: 'Connection timeout after 30 seconds'
			}
		]
	};
</script>

{#snippet template(args)}
	<ProductDetailsPage {...args} />
{/snippet}

<Story name="Default" args={defaultArgs} {template} />

<Story
	name="With Variants"
	args={{
		...defaultArgs,
		variantStats: {
			total_domains_with_variants: 5,
			aggregate: {
				total_variants: 245000,
				available_count: 210500,
				out_of_stock_count: 34500,
				price_history_records: 1520000
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
	name="Loading Metadata"
	args={{
		...defaultArgs,
		loadingMetadata: true,
		lastRunDates: new SvelteMap()
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		...defaultArgs,
		stats: {
			total_domains: 0,
			aggregate: {
				total_products: 0,
				pending: 0,
				success: 0,
				failed: 0,
				permanently_failed: 0,
				completion_percent: 0
			},
			domains: [],
			domains_with_errors: []
		},
		variantStats: null,
		lastRunDates: new SvelteMap()
	}}
	{template}
/>

<Story
	name="With Domain Errors"
	args={{
		...defaultArgs,
		stats: mockStatsWithErrors
	}}
	{template}
/>

<Story
	name="With API Error"
	args={{
		...defaultArgs,
		error: 'Failed to load product details stats. Please check your connection and try again.'
	}}
	{template}
/>

<Story
	name="No Variants"
	args={{
		...defaultArgs,
		variantStats: null
	}}
	{template}
/>
