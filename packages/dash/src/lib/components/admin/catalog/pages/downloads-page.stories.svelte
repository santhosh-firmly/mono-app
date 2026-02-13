<script module>
	import { SvelteMap } from 'svelte/reactivity';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DownloadsPage from './downloads-page.svelte';
	import { mockDomains } from '../__mocks__/index.js';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/DownloadsPage',
		component: DownloadsPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock domain exports map
	const mockDomainExports = new SvelteMap([
		[
			'acme-store.com',
			{
				workflowId: 'wf-abc123',
				createdAt: '2024-01-15T12:30:00Z',
				totalProducts: 15420,
				files: [
					{ filename: 'electronics.jsonl.gz', productCount: 5200, gzSizeBytes: 245000 },
					{ filename: 'apparel.jsonl.gz', productCount: 4100, gzSizeBytes: 198000 },
					{ filename: 'other.jsonl.gz', productCount: 6120, gzSizeBytes: 312000 }
				]
			}
		],
		[
			'widgets-inc.com',
			{
				workflowId: 'wf-def456',
				createdAt: '2024-01-14T09:00:00Z',
				totalProducts: 8750,
				files: [{ filename: 'products.jsonl.gz', productCount: 8750, gzSizeBytes: 456000 }]
			}
		],
		[
			'fashion-hub.com',
			{
				workflowId: 'wf-ghi789',
				createdAt: '2024-01-13T16:45:00Z',
				totalProducts: 12340,
				files: [
					{ filename: 'apparel.jsonl.gz', productCount: 9800, gzSizeBytes: 567000 },
					{ filename: 'footwear.jsonl.gz', productCount: 2540, gzSizeBytes: 145000 }
				]
			}
		]
	]);

	// Empty exports map
	const emptyExports = new SvelteMap();
</script>

{#snippet template(args)}
	<DownloadsPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		domains: mockDomains,
		domainExports: mockDomainExports,
		loading: false,
		error: null
	}}
	{template}
/>

{#snippet withSelectionTemplate(args)}
	<DownloadsPage {...args} />
{/snippet}

<Story
	name="With Selection"
	args={{
		domains: mockDomains,
		domainExports: mockDomainExports,
		loading: false,
		error: null
	}}
>
	{#snippet children(args)}
		<DownloadsPage {...args} />
	{/snippet}
</Story>

<Story
	name="Empty"
	args={{
		domains: [],
		domainExports: emptyExports,
		loading: false,
		error: null
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		domains: [],
		domainExports: emptyExports,
		loading: true,
		error: null
	}}
	{template}
/>
