<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StoragePage from './storage-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/StoragePage',
		component: StoragePage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			loading: { control: 'boolean' },
			loadingStorage: { control: 'boolean' },
			showFileModal: { control: 'boolean' },
			loadingFile: { control: 'boolean' }
		}
	});

	const mockDomains = [
		{ domain: 'example.com' },
		{ domain: 'shop.example.com' },
		{ domain: 'store.example.com' },
		{ domain: 'buy.example.com' }
	];

	const mockStats = {
		totalFiles: 1250,
		totalSizeFormatted: '2.4 GB',
		byFolder: {
			products: 500,
			variants: 450,
			exports: 200,
			cache: 100
		}
	};

	const mockFiles = {
		folders: [
			{ name: 'products', path: 'products/' },
			{ name: 'variants', path: 'variants/' },
			{ name: 'exports', path: 'exports/' },
			{ name: 'cache', path: 'cache/' }
		],
		files: [
			{
				name: 'config.json',
				key: 'config.json',
				size: 2048,
				uploaded: new Date().toISOString()
			},
			{
				name: 'metadata.json',
				key: 'metadata.json',
				size: 1024,
				uploaded: new Date(Date.now() - 86400000).toISOString()
			}
		]
	};

	const mockSubfolderFiles = {
		folders: [],
		files: [
			{
				name: 'product-001.json',
				key: 'products/product-001.json',
				size: 4096,
				uploaded: new Date().toISOString()
			},
			{
				name: 'product-002.json',
				key: 'products/product-002.json',
				size: 3584,
				uploaded: new Date(Date.now() - 3600000).toISOString()
			},
			{
				name: 'product-003.json',
				key: 'products/product-003.json',
				size: 5120,
				uploaded: new Date(Date.now() - 7200000).toISOString()
			}
		]
	};

	const mockFileContent = {
		path: 'products/product-001.json',
		size: 4096,
		contentType: 'application/json',
		uploaded: new Date().toISOString(),
		content: {
			id: 'product-001',
			title: 'Premium Wireless Headphones',
			handle: 'premium-headphones',
			variants: [
				{ sku: 'SKU-001', price: 149.99, available: true },
				{ sku: 'SKU-002', price: 129.99, available: false }
			]
		}
	};

	const noop = () => {};
</script>

{#snippet template(args)}
	<StoragePage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		domains: mockDomains,
		currentDomain: 'example.com',
		currentPath: '',
		files: mockFiles,
		stats: mockStats,
		loading: false,
		loadingStorage: false,
		error: null,
		showFileModal: false,
		fileContent: null,
		loadingFile: false,
		onRefresh: noop,
		onDomainChange: noop,
		onNavigateToFolder: noop,
		onNavigateUp: noop,
		onNavigateToBreadcrumb: noop,
		onNavigateToRoot: noop,
		onViewFile: noop,
		onCloseFileModal: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="In Subfolder"
	args={{
		domains: mockDomains,
		currentDomain: 'example.com',
		currentPath: 'products',
		files: mockSubfolderFiles,
		stats: mockStats,
		loading: false,
		loadingStorage: false,
		error: null,
		showFileModal: false,
		fileContent: null,
		loadingFile: false,
		onRefresh: noop,
		onDomainChange: noop,
		onNavigateToFolder: noop,
		onNavigateUp: noop,
		onNavigateToBreadcrumb: noop,
		onNavigateToRoot: noop,
		onViewFile: noop,
		onCloseFileModal: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Viewing File"
	args={{
		domains: mockDomains,
		currentDomain: 'example.com',
		currentPath: 'products',
		files: mockSubfolderFiles,
		stats: mockStats,
		loading: false,
		loadingStorage: false,
		error: null,
		showFileModal: true,
		fileContent: mockFileContent,
		loadingFile: false,
		onRefresh: noop,
		onDomainChange: noop,
		onNavigateToFolder: noop,
		onNavigateUp: noop,
		onNavigateToBreadcrumb: noop,
		onNavigateToRoot: noop,
		onViewFile: noop,
		onCloseFileModal: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		domains: mockDomains,
		currentDomain: 'example.com',
		currentPath: 'cache',
		files: { folders: [], files: [] },
		stats: mockStats,
		loading: false,
		loadingStorage: false,
		error: null,
		showFileModal: false,
		fileContent: null,
		loadingFile: false,
		onRefresh: noop,
		onDomainChange: noop,
		onNavigateToFolder: noop,
		onNavigateUp: noop,
		onNavigateToBreadcrumb: noop,
		onNavigateToRoot: noop,
		onViewFile: noop,
		onCloseFileModal: noop,
		onDismissError: noop
	}}
	{template}
/>
