<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EnrichmentCategoryPage from './enrichment-category-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/EnrichmentCategoryPage',
		component: EnrichmentCategoryPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Mock data
	const mockCategory = {
		category: {
			name: 'Electronics',
			description: 'Electronic devices, gadgets, and accessories',
			product_count: 12500,
			aliases: ['Tech', 'Gadgets', 'Devices', 'Technology']
		},
		totalProducts: 12500,
		domains: [
			{
				domain: 'acme-store.com',
				mappingCount: 45,
				nativeTypes: [
					{ nativeType: 'Electronics', count: 2500 },
					{ nativeType: 'Gadgets', count: 1800 },
					{ nativeType: 'Tech Accessories', count: 950 }
				]
			},
			{
				domain: 'widgets-inc.com',
				mappingCount: 32,
				nativeTypes: [
					{ nativeType: 'Consumer Electronics', count: 3200 },
					{ nativeType: 'Devices', count: 2100 }
				]
			},
			{
				domain: 'tech-emporium.com',
				mappingCount: 28,
				nativeTypes: [
					{ nativeType: 'Technology', count: 1500 },
					{ nativeType: 'Electronic Devices', count: 450 }
				]
			}
		]
	};

	const mockProducts = [
		{
			handle: 'wireless-headphones-pro',
			title: 'Wireless Bluetooth Headphones Pro',
			imageUrl: 'https://picsum.photos/seed/headphones/200/200',
			product_type: 'Electronics',
			enriched_product_type: 'Electronics',
			vendor: 'AudioTech',
			pdp_url: 'https://example.com/headphones'
		},
		{
			handle: 'usb-c-cable-2m',
			title: 'USB-C Charging Cable 2m',
			imageUrl: 'https://picsum.photos/seed/cable/200/200',
			product_type: 'Cables',
			enriched_product_type: 'Electronics',
			vendor: 'ChargePro',
			pdp_url: 'https://example.com/cable'
		},
		{
			handle: 'smartwatch-series-5',
			title: 'SmartWatch Series 5',
			imageUrl: 'https://picsum.photos/seed/watch/200/200',
			product_type: 'Wearables',
			enriched_product_type: 'Electronics',
			vendor: 'TechWear',
			pdp_url: 'https://example.com/smartwatch'
		},
		{
			handle: 'portable-speaker-mini',
			title: 'Portable Bluetooth Speaker Mini',
			imageUrl: null,
			product_type: 'Audio',
			enriched_product_type: 'Electronics',
			vendor: 'SoundMax',
			pdp_url: 'https://example.com/speaker'
		},
		{
			handle: 'tablet-stand-adjustable',
			title: 'Adjustable Tablet Stand',
			imageUrl: 'https://picsum.photos/seed/stand/200/200',
			product_type: 'Accessories',
			enriched_product_type: 'Electronics',
			vendor: 'DeskPro',
			pdp_url: 'https://example.com/stand'
		},
		{
			handle: 'wireless-mouse-ergonomic',
			title: 'Ergonomic Wireless Mouse',
			imageUrl: 'https://picsum.photos/seed/mouse/200/200',
			product_type: 'Computer Accessories',
			enriched_product_type: 'Electronics',
			vendor: 'ErgoTech',
			pdp_url: 'https://example.com/mouse'
		}
	];

	const mockAllCategories = [
		{ name: 'Electronics' },
		{ name: 'Apparel' },
		{ name: 'Footwear' },
		{ name: 'Accessories' },
		{ name: 'Home & Garden' },
		{ name: 'Sports & Outdoors' }
	];

	const defaultArgs = {
		categoryName: 'Electronics',
		category: mockCategory,
		products: mockProducts,
		loading: false,
		loadingProducts: false,
		loadingMore: false,
		error: null,
		allCategories: mockAllCategories,
		totalProducts: 12500,
		hasMore: true,
		selectedDomain: 'acme-store.com',
		onDomainChange: (domain) => console.log('Domain changed:', domain),
		onLoadMore: () => console.log('Load more clicked'),
		onSaveOverride: async (data) => console.log('Save override:', data),
		onDeleteOverride: async (data) => console.log('Delete override:', data),
		onDismissError: () => console.log('Error dismissed'),
		breadcrumbHref: '/admin/catalog/enrichment'
	};
</script>

{#snippet template(args)}
	<EnrichmentCategoryPage {...args} />
{/snippet}

<Story name="Default" args={defaultArgs} {template} />

<Story
	name="With Products"
	args={{
		...defaultArgs,
		products: mockProducts,
		totalProducts: mockProducts.length,
		hasMore: false
	}}
	{template}
/>

<Story
	name="Empty Category"
	args={{
		...defaultArgs,
		category: {
			...mockCategory,
			category: {
				...mockCategory.category,
				product_count: 0
			},
			totalProducts: 0,
			domains: []
		},
		products: [],
		totalProducts: 0,
		hasMore: false,
		selectedDomain: null
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		...defaultArgs,
		loading: true,
		products: []
	}}
	{template}
/>

<Story
	name="Loading Products"
	args={{
		...defaultArgs,
		loadingProducts: true,
		products: []
	}}
	{template}
/>

<Story
	name="No Domain Selected"
	args={{
		...defaultArgs,
		selectedDomain: null,
		products: []
	}}
	{template}
/>
