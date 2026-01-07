<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { expect, fn, screen, userEvent } from '@storybook/test';
	import ProductCatalog from './product-catalog.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Catalog/Product Catalog',
		component: ProductCatalog,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			onSearch: fn(),
			onLoadMore: fn(),
			onRetry: fn()
		}
	});

	// Generate sample products
	const sampleProducts = [
		{
			id: '1',
			title: 'Classic Cotton T-Shirt',
			handle: 'classic-cotton-t-shirt',
			images: [{ url: 'https://picsum.photos/seed/product1/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '29.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 1
		},
		{
			id: '2',
			title: 'Premium Running Shoes',
			handle: 'premium-running-shoes',
			images: [{ url: 'https://picsum.photos/seed/product2/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '149.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 3
		},
		{
			id: '3',
			title: 'Limited Edition Hoodie',
			handle: 'limited-edition-hoodie',
			images: [{ url: 'https://picsum.photos/seed/product3/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '89.99', currency: 'USD', symbol: '$' },
					available: false
				}
			],
			has_available_variants: false,
			total_variant_count: 1
		},
		{
			id: '4',
			title: 'Wireless Headphones',
			handle: 'wireless-headphones',
			images: [{ url: 'https://picsum.photos/seed/product4/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '199.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 2
		},
		{
			id: '5',
			title: 'Leather Wallet',
			handle: 'leather-wallet',
			images: [{ url: 'https://picsum.photos/seed/product5/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '59.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 1
		},
		{
			id: '6',
			title: 'Smart Watch',
			handle: 'smart-watch',
			images: [{ url: 'https://picsum.photos/seed/product6/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '349.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 4
		},
		{
			id: '7',
			title: 'Backpack',
			handle: 'backpack',
			images: [{ url: 'https://picsum.photos/seed/product7/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '79.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 2
		},
		{
			id: '8',
			title: 'Sunglasses',
			handle: 'sunglasses',
			images: [{ url: 'https://picsum.photos/seed/product8/400/400' }],
			variants: [
				{
					id: 'v1',
					price: { value: '129.99', currency: 'USD', symbol: '$' },
					available: true
				}
			],
			has_available_variants: true,
			total_variant_count: 3
		}
	];
</script>

{#snippet template(args)}
	<ProductCatalog {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		products: sampleProducts,
		total: 48,
		hasMore: true
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		products: [],
		loading: true,
		total: 0
	}}
	{template}
/>

<Story
	name="Error"
	args={{
		products: [],
		error: 'Failed to fetch products. Please check your connection and try again.',
		total: 0
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		products: [],
		total: 0
	}}
	{template}
/>

<Story
	name="No Search Results"
	args={{
		products: [],
		total: 0,
		title: 'Product Catalog',
		description: 'Browse and manage products available for sale.'
	}}
	{template}
/>

<Story
	name="Loading More"
	args={{
		products: sampleProducts,
		total: 48,
		hasMore: true,
		loadingMore: true
	}}
	{template}
/>

<Story
	name="All Loaded"
	args={{
		products: sampleProducts,
		total: 8,
		hasMore: false
	}}
	{template}
/>

<Story
	name="Custom Title"
	args={{
		products: sampleProducts.slice(0, 4),
		total: 4,
		hasMore: false,
		title: 'Featured Products',
		description: 'Hand-picked products from our collection.'
	}}
	{template}
/>

<Story
	name="Search Products"
	args={{
		products: sampleProducts,
		total: 48,
		hasMore: true
	}}
	{template}
	play={async ({ args }) => {
		// Find and interact with search input
		const searchInput = await screen.findByPlaceholderText('Search products...');

		// Type a search query
		await userEvent.type(searchInput, 'shoes');

		// Wait for debounce
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Check that onSearch was called
		await expect(args.onSearch).toHaveBeenCalledWith('shoes');
	}}
/>

<Story
	name="Clear Search"
	args={{
		products: sampleProducts,
		total: 48,
		hasMore: true
	}}
	{template}
	play={async ({ args }) => {
		// Find and interact with search input
		const searchInput = await screen.findByPlaceholderText('Search products...');

		// Type a search query
		await userEvent.type(searchInput, 'test');

		// Wait for debounce
		await new Promise((resolve) => setTimeout(resolve, 400));

		// Find and click clear button
		const clearButton = screen.getByRole('button', { name: '' });
		await userEvent.click(clearButton);

		// Check that onSearch was called with empty string
		await expect(args.onSearch).toHaveBeenCalledWith('');
	}}
/>

<Story
	name="Load More Products"
	args={{
		products: sampleProducts,
		total: 48,
		hasMore: true
	}}
	{template}
	play={async ({ args }) => {
		// Find and click Load More button
		const loadMoreBtn = await screen.findByRole('button', { name: /load more/i });
		await userEvent.click(loadMoreBtn);

		// Check that onLoadMore was called
		await expect(args.onLoadMore).toHaveBeenCalled();
	}}
/>

<Story
	name="Retry After Error"
	args={{
		products: [],
		error: 'Failed to fetch products.',
		total: 0
	}}
	{template}
	play={async ({ args }) => {
		// Find and click Try Again button
		const retryBtn = await screen.findByRole('button', { name: /try again/i });
		await userEvent.click(retryBtn);

		// Check that onRetry was called
		await expect(args.onRetry).toHaveBeenCalled();
	}}
/>
