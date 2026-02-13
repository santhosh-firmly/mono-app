<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { SvelteMap } from 'svelte/reactivity';
	import ExportPage from './export-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/ExportPage',
		component: ExportPage,
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
		domains: mockDomains
	};

	function createLatestExportsMap() {
		const map = new SvelteMap();
		map.set('acme-store.com/US', {
			versionId: 'v-20240115-001',
			createdAt: '2024-01-15T08:00:00Z',
			totalProducts: 14986,
			filesCount: 3,
			totalVersions: 5
		});
		map.set('widgets-inc.com/US', {
			versionId: 'v-20240114-002',
			createdAt: '2024-01-14T12:00:00Z',
			totalProducts: 8700,
			filesCount: 2,
			totalVersions: 3
		});
		map.set('fashion-hub.com/DE', {
			versionId: 'v-20240113-001',
			createdAt: '2024-01-13T16:00:00Z',
			totalProducts: 12340,
			filesCount: 3,
			totalVersions: 2
		});
		return map;
	}

	const defaultArgs = {
		stats: mockStats,
		latestExports: createLatestExportsMap(),
		loading: false,
		loadingLatestExports: false,
		error: null,
		onRefresh: () => console.log('Refresh clicked'),
		onTriggerExport: async (domains, callbacks) => {
			console.log('Triggering export for:', domains);
			for (let i = 0; i < domains.length; i++) {
				callbacks.onProgress(i, 'running', `job-${i}`);
				await new Promise((r) => setTimeout(r, 1000));
				callbacks.onProgress(i, 'complete', `job-${i}`);
			}
		},
		onViewHistory: async (domain, countryCode) => {
			console.log('View history for:', domain, countryCode);
			return {
				versions: [
					{
						versionId: 'v-20240115-001',
						createdAt: '2024-01-15T08:00:00Z',
						totalProducts: 14986,
						files: [
							{
								fileName: 'products-001.jsonl.gz',
								productCount: 5000,
								gzSizeBytes: 1250000
							},
							{
								fileName: 'products-002.jsonl.gz',
								productCount: 5000,
								gzSizeBytes: 1180000
							},
							{
								fileName: 'products-003.jsonl.gz',
								productCount: 4986,
								gzSizeBytes: 1120000
							}
						]
					},
					{
						versionId: 'v-20240114-001',
						createdAt: '2024-01-14T08:00:00Z',
						totalProducts: 14500,
						files: [
							{
								fileName: 'products-001.jsonl.gz',
								productCount: 5000,
								gzSizeBytes: 1200000
							},
							{
								fileName: 'products-002.jsonl.gz',
								productCount: 5000,
								gzSizeBytes: 1150000
							},
							{
								fileName: 'products-003.jsonl.gz',
								productCount: 4500,
								gzSizeBytes: 1050000
							}
						]
					}
				]
			};
		},
		onDownloadFile: (domain, countryCode, versionId, fileName) =>
			console.log('Download:', domain, countryCode, versionId, fileName),
		onDismissError: () => console.log('Error dismissed')
	};
</script>

{#snippet template(args)}
	<ExportPage {...args} />
{/snippet}

<Story name="Default" args={defaultArgs} {template} />

<Story
	name="With Progress"
	args={{
		...defaultArgs
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
	name="Loading Latest Exports"
	args={{
		...defaultArgs,
		loadingLatestExports: true,
		latestExports: new SvelteMap()
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
			domains: []
		},
		latestExports: new SvelteMap()
	}}
	{template}
/>

<Story
	name="No Exports Yet"
	args={{
		...defaultArgs,
		latestExports: new SvelteMap()
	}}
	{template}
/>
