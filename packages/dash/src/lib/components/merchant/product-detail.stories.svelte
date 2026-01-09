<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import ProductDetail from './product-detail.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Catalog/Product Detail',
		component: ProductDetail,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			onBack: fn()
		}
	});

	const fullProduct = {
		title: 'Trail Master Backpack Pro',
		handle: 'trail-master-backpack-pro',
		base_sku: 'TMP-001',
		vendor: 'OutdoorGear Co.',
		product_type: 'Backpack',
		has_available_variants: true,
		total_variant_count: 3,
		created_at: '2024-01-15T10:00:00Z',
		description:
			'The Trail Master Backpack Pro is designed for serious outdoor enthusiasts. Features include waterproof material, ergonomic design, and multiple compartments for organization.',
		tags: ['hiking', 'waterproof', 'outdoor', 'bestseller'],
		images: [
			{ url: 'https://picsum.photos/seed/backpack1/600/600' },
			{ url: 'https://picsum.photos/seed/backpack2/600/600' },
			{ url: 'https://picsum.photos/seed/backpack3/600/600' }
		],
		variants: [
			{
				title: 'Small - Black',
				sku: 'TMP-001-S-BLK',
				available: true,
				inventory_quantity: 25,
				price: { value: 89.99, currency: 'USD', symbol: '$' }
			},
			{
				title: 'Medium - Black',
				sku: 'TMP-001-M-BLK',
				available: true,
				inventory_quantity: 42,
				price: { value: 99.99, currency: 'USD', symbol: '$' }
			},
			{
				title: 'Large - Black',
				sku: 'TMP-001-L-BLK',
				available: false,
				inventory_quantity: 0,
				price: { value: 109.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const simpleProduct = {
		title: 'Water Bottle 32oz',
		handle: 'water-bottle-32oz',
		has_available_variants: true,
		vendor: 'HydraGear',
		images: [{ url: 'https://picsum.photos/seed/bottle/600/600' }],
		variants: [
			{
				title: 'Default',
				available: true,
				inventory_quantity: 100,
				price: { value: 24.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const outOfStockProduct = {
		title: 'Limited Edition Hiking Boots',
		handle: 'limited-hiking-boots',
		base_sku: 'LHB-001',
		vendor: 'TrailFootwear',
		product_type: 'Footwear',
		has_available_variants: false,
		description:
			'These limited edition hiking boots are currently sold out. Sign up for notifications!',
		images: [{ url: 'https://picsum.photos/seed/boots/600/600' }],
		variants: [
			{
				title: 'Size 10',
				sku: 'LHB-001-10',
				available: false,
				inventory_quantity: 0,
				price: { value: 199.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const htmlDescriptionProduct = {
		title: 'Camping Tent Deluxe',
		handle: 'camping-tent-deluxe',
		vendor: 'CampMaster',
		product_type: 'Tent',
		has_available_variants: true,
		body_html:
			'<p><strong>Premium 4-Season Tent</strong></p><ul><li>Waterproof rating: 10,000mm</li><li>Sleeps 4 people comfortably</li><li>Easy setup in under 5 minutes</li></ul><p>Perfect for all your camping adventures!</p>',
		tags: ['camping', '4-season', 'family'],
		images: [{ url: 'https://picsum.photos/seed/tent/600/600' }],
		variants: [
			{
				title: 'Default',
				available: true,
				inventory_quantity: 15,
				price: { value: 349.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const noImageProduct = {
		title: 'Mystery Box',
		handle: 'mystery-box',
		has_available_variants: true,
		description: 'A surprise collection of outdoor gear!',
		variants: [
			{
				title: 'Default',
				available: true,
				price: { value: 99.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const priceRangeProduct = {
		title: 'Custom Jewelry Set',
		handle: 'custom-jewelry-set',
		product_type: 'Jewelry',
		vendor: 'Elegant Gems',
		description: 'Build your own jewelry set with our customizable options.',
		images: [{ url: 'https://picsum.photos/seed/jewelry/600/600' }],
		price_range: { min: 49.99, max: 199.99 },
		has_available_variants: true,
		total_variant_count: 8,
		tags: ['jewelry', 'custom', 'gift'],
		created_at: '2024-02-14T12:00:00Z'
	};
</script>

{#snippet template(args)}
	<div class="max-w-4xl mx-auto">
		<ProductDetail {...args} />
	</div>
{/snippet}

<Story name="Full Product" args={{ product: fullProduct }} {template} />

<Story name="Simple Product" args={{ product: simpleProduct }} {template} />

<Story name="Out of Stock" args={{ product: outOfStockProduct }} {template} />

<Story name="HTML Description" args={{ product: htmlDescriptionProduct }} {template} />

<Story name="No Image" args={{ product: noImageProduct }} {template} />

<Story name="Price Range" args={{ product: priceRangeProduct }} {template} />
