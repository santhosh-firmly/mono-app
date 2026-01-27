<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProductDetailsDomainPage from './product-details-domain-page.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Pages/ProductDetailsDomainPage',
		component: ProductDetailsDomainPage,
		tags: ['autodocs'],
		parameters: {
			layout: 'fullscreen'
		},
		argTypes: {
			loading: { control: 'boolean' },
			syncing: { control: 'boolean' },
			triggering: { control: 'boolean' },
			migrating: { control: 'boolean' },
			savingConfig: { control: 'boolean' }
		}
	});

	const mockStats = {
		stats: {
			total: 1500,
			active: {
				success: 1200,
				pending: 200,
				failed: 80,
				permanently_failed: 20
			}
		}
	};

	const mockConfig = {
		config: {
			batchSize: 5,
			delayBetweenBatchesMs: 4000,
			freshnessThresholdHours: 48,
			maxRetryAttempts: 3
		}
	};

	const mockVariantStats = {
		total_variants: 4500,
		available_count: 3800,
		out_of_stock_count: 700,
		min_price: 9.99,
		max_price: 299.99,
		avg_price: 59.99,
		price_history_records: 12500
	};

	const mockPriceChanges = {
		changes: [
			{
				id: 1,
				variant_sku: 'SKU-001',
				title: 'Premium Wireless Headphones',
				new_price: 149.99,
				new_msrp: 199.99,
				recorded_at: new Date().toISOString()
			},
			{
				id: 2,
				variant_sku: 'SKU-002',
				title: 'Bluetooth Speaker System',
				new_price: 79.99,
				new_msrp: null,
				recorded_at: new Date(Date.now() - 3600000).toISOString()
			},
			{
				id: 3,
				variant_sku: 'SKU-003',
				title: 'Smart Watch Pro',
				new_price: 249.99,
				new_msrp: 299.99,
				recorded_at: new Date(Date.now() - 7200000).toISOString()
			}
		]
	};

	const mockAvailabilityChanges = {
		changes: [
			{
				id: 1,
				variant_sku: 'SKU-004',
				title: 'Gaming Mouse RGB',
				available: true,
				recorded_at: new Date().toISOString()
			},
			{
				id: 2,
				variant_sku: 'SKU-005',
				title: 'Mechanical Keyboard',
				available: false,
				recorded_at: new Date(Date.now() - 1800000).toISOString()
			}
		]
	};

	const mockProducts = {
		products: [
			{
				handle: 'premium-headphones',
				pdp_url: 'https://example.com/products/premium-headphones',
				status: 'success',
				attempts: 1,
				updated_at: new Date().toISOString()
			},
			{
				handle: 'bluetooth-speaker',
				pdp_url: 'https://example.com/products/bluetooth-speaker',
				status: 'pending',
				attempts: 0,
				updated_at: new Date(Date.now() - 3600000).toISOString()
			},
			{
				handle: 'smart-watch',
				pdp_url: 'https://example.com/products/smart-watch',
				status: 'failed',
				attempts: 3,
				updated_at: new Date(Date.now() - 7200000).toISOString()
			},
			{
				handle: 'gaming-mouse',
				pdp_url: 'https://example.com/products/gaming-mouse',
				status: 'permanently_failed',
				attempts: 5,
				updated_at: new Date(Date.now() - 86400000).toISOString()
			}
		],
		pagination: {
			page: 1,
			size: 20,
			total: 1500,
			totalPages: 75
		}
	};

	const noop = () => {};
</script>

{#snippet template(args)}
	<ProductDetailsDomainPage {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		domain: 'example.com',
		countryCode: 'US',
		stats: mockStats,
		config: mockConfig,
		variantStats: mockVariantStats,
		priceChanges: mockPriceChanges,
		availabilityChanges: mockAvailabilityChanges,
		products: mockProducts,
		loading: false,
		error: null,
		onRefresh: noop,
		onSync: noop,
		onTriggerWorkflow: noop,
		onMigrate: noop,
		onSaveConfig: noop,
		onFilterChange: noop,
		onPageChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Edit Mode"
	args={{
		domain: 'example.com',
		countryCode: 'US',
		stats: mockStats,
		config: mockConfig,
		variantStats: mockVariantStats,
		priceChanges: mockPriceChanges,
		availabilityChanges: mockAvailabilityChanges,
		products: mockProducts,
		loading: false,
		error: null,
		onRefresh: noop,
		onSync: noop,
		onTriggerWorkflow: noop,
		onMigrate: noop,
		onSaveConfig: noop,
		onFilterChange: noop,
		onPageChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="With Products"
	args={{
		domain: 'shop.example.com',
		countryCode: 'GB',
		stats: {
			stats: {
				total: 5000,
				active: {
					success: 4500,
					pending: 300,
					failed: 150,
					permanently_failed: 50
				}
			}
		},
		config: mockConfig,
		variantStats: {
			total_variants: 15000,
			available_count: 12000,
			out_of_stock_count: 3000,
			min_price: 4.99,
			max_price: 999.99,
			avg_price: 89.99,
			price_history_records: 45000
		},
		priceChanges: mockPriceChanges,
		availabilityChanges: mockAvailabilityChanges,
		products: {
			products: mockProducts.products.concat([
				{
					handle: 'keyboard-pro',
					pdp_url: 'https://shop.example.com/products/keyboard-pro',
					status: 'success',
					attempts: 1,
					updated_at: new Date().toISOString()
				},
				{
					handle: 'monitor-4k',
					pdp_url: 'https://shop.example.com/products/monitor-4k',
					status: 'success',
					attempts: 2,
					updated_at: new Date(Date.now() - 1800000).toISOString()
				}
			]),
			pagination: {
				page: 1,
				size: 20,
				total: 5000,
				totalPages: 250
			}
		},
		loading: false,
		error: null,
		onRefresh: noop,
		onSync: noop,
		onTriggerWorkflow: noop,
		onMigrate: noop,
		onSaveConfig: noop,
		onFilterChange: noop,
		onPageChange: noop,
		onDismissError: noop
	}}
	{template}
/>

<Story
	name="Loading"
	args={{
		domain: 'example.com',
		countryCode: 'US',
		stats: null,
		config: null,
		variantStats: null,
		priceChanges: null,
		availabilityChanges: null,
		products: null,
		loading: true,
		error: null,
		onRefresh: noop,
		onSync: noop,
		onTriggerWorkflow: noop,
		onMigrate: noop,
		onSaveConfig: noop,
		onFilterChange: noop,
		onPageChange: noop,
		onDismissError: noop
	}}
	{template}
/>
