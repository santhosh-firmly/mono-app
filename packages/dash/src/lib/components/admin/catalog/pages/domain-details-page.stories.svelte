<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DomainDetailsPage from './domain-details-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/DomainDetailsPage',
		component: DomainDetailsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock domain stats
	const mockStats = {
		totalProducts: 15420,
		normalizationStats: {
			normalized: 14986,
			unnormalized: 434
		},
		byNormalizedType: [
			{ category: 'Electronics', count: 4500 },
			{ category: 'Apparel', count: 3200 },
			{ category: 'Home & Garden', count: 2800 },
			{ category: 'Footwear', count: 1920 },
			{ category: 'Sports & Outdoors', count: 1600 },
			{ category: 'Accessories', count: 1100 },
			{ category: 'Uncategorized', count: 300 }
		],
		byVendor: [
			{ vendor: 'Samsung', count: 1200 },
			{ vendor: 'Apple', count: 980 },
			{ vendor: 'Nike', count: 850 },
			{ vendor: 'Sony', count: 720 },
			{ vendor: 'Adidas', count: 680 },
			{ vendor: 'LG', count: 540 },
			{ vendor: 'Philips', count: 480 },
			{ vendor: 'Bose', count: 390 },
			{ vendor: 'JBL', count: 320 },
			{ vendor: 'Levi\'s', count: 280 }
		]
	};

	// Mock workflows
	const mockWorkflows = [
		{
			workflow_id: 'wf-abc123def456',
			status: 'completed',
			created_at: '2024-01-15T10:00:00Z',
			steps: [
				{ name: 'Fetch Products', status: 'completed', productsProcessed: 15420 },
				{ name: 'Normalize Categories', status: 'completed', productsProcessed: 15420 },
				{ name: 'Enrich Data', status: 'completed', productsProcessed: 14986 },
				{ name: 'Generate Export', status: 'completed', productsProcessed: 14986 }
			],
			current_step: 3
		},
		{
			workflow_id: 'wf-xyz789ghi012',
			status: 'running',
			created_at: '2024-01-16T14:30:00Z',
			steps: [
				{ name: 'Fetch Products', status: 'completed', productsProcessed: 15420 },
				{ name: 'Normalize Categories', status: 'running', productsProcessed: 8500 },
				{ name: 'Enrich Data', status: 'pending' },
				{ name: 'Generate Export', status: 'pending' }
			],
			current_step: 1
		},
		{
			workflow_id: 'wf-err456fail789',
			status: 'failed',
			created_at: '2024-01-14T09:00:00Z',
			error_message: 'Rate limit exceeded while fetching product details',
			steps: [
				{ name: 'Fetch Products', status: 'completed', productsProcessed: 5230 },
				{ name: 'Normalize Categories', status: 'failed' },
				{ name: 'Enrich Data', status: 'pending' },
				{ name: 'Generate Export', status: 'pending' }
			],
			current_step: 1
		}
	];

	// Mock latest export
	const mockLatestExport = {
		workflowId: 'wf-abc123def456',
		createdAt: '2024-01-15T12:30:00Z',
		totalProducts: 14986,
		files: [
			{
				filename: 'electronics.jsonl.gz',
				productCount: 4500,
				gzSizeBytes: 245000
			},
			{
				filename: 'apparel.jsonl.gz',
				productCount: 3200,
				gzSizeBytes: 178000
			},
			{
				filename: 'home-garden.jsonl.gz',
				productCount: 2800,
				gzSizeBytes: 156000
			},
			{
				filename: 'other.jsonl.gz',
				productCount: 4486,
				gzSizeBytes: 312000
			}
		]
	};

	// Workflows with running workflow
	const workflowsWithRunning = [mockWorkflows[1], mockWorkflows[0], mockWorkflows[2]];
</script>

{#snippet template(args)}
	<DomainDetailsPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		domain: 'acme-store.com',
		stats: mockStats,
		workflows: [mockWorkflows[0]],
		latestExport: null,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="With Workflows"
	args={{
		domain: 'acme-store.com',
		stats: mockStats,
		workflows: workflowsWithRunning,
		latestExport: null,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="With Exports"
	args={{
		domain: 'acme-store.com',
		stats: mockStats,
		workflows: [mockWorkflows[0]],
		latestExport: mockLatestExport,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		domain: 'acme-store.com',
		stats: null,
		workflows: [],
		latestExport: null,
		loading: true,
		error: null
	}}
	{template}
/>
