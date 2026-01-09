<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import ProductCard from './product-card.svelte';

	const { Story } = defineMeta({
		title: 'Merchant/Catalog/Product Card',
		component: ProductCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			onclick: fn()
		}
	});

	const inStockProduct = {
		title: 'Trail Master Backpack',
		handle: 'trail-master-backpack',
		has_available_variants: true,
		total_variant_count: 3,
		images: [{ url: 'https://picsum.photos/seed/backpack/400/400' }],
		variants: [
			{
				title: 'Small',
				available: true,
				price: { value: 89.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const outOfStockProduct = {
		title: 'Limited Edition Hiking Boots',
		handle: 'limited-hiking-boots',
		has_available_variants: false,
		total_variant_count: 2,
		images: [{ url: 'https://picsum.photos/seed/boots/400/400' }],
		variants: [
			{
				title: 'Size 10',
				available: false,
				price: { value: 199.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const priceRangeProduct = {
		title: 'Camping Tent Collection',
		handle: 'camping-tent-collection',
		has_available_variants: true,
		total_variant_count: 5,
		images: [{ url: 'https://picsum.photos/seed/tent/400/400' }],
		price_range: { min: 149.99, max: 399.99 }
	};

	const noImageProduct = {
		title: 'Mystery Outdoor Gear',
		handle: 'mystery-outdoor-gear',
		has_available_variants: true,
		total_variant_count: 1,
		variants: [
			{
				title: 'Default',
				available: true,
				price: { value: 49.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const singleVariantProduct = {
		title: 'Water Bottle',
		handle: 'water-bottle-32oz',
		has_available_variants: true,
		total_variant_count: 1,
		images: [{ url: 'https://picsum.photos/seed/bottle/400/400' }],
		variants: [
			{
				title: 'Default',
				available: true,
				price: { value: 24.99, currency: 'USD', symbol: '$' }
			}
		]
	};

	const euroProduct = {
		title: 'Handmade Italian Leather Wallet',
		handle: 'handmade-italian-leather-wallet',
		has_available_variants: true,
		total_variant_count: 1,
		images: [{ url: 'https://picsum.photos/seed/wallet/400/400' }],
		variants: [
			{
				title: 'Default',
				available: true,
				price: { value: 79.0, currency: 'EUR', symbol: '€' }
			}
		]
	};

	const longTitleProduct = {
		title: 'Ultra Premium Organic Fair Trade Single Origin Colombian Coffee Beans - Dark Roast - 1kg Bag',
		handle: 'ultra-premium-organic-fair-trade-coffee',
		has_available_variants: true,
		total_variant_count: 1,
		images: [{ url: 'https://picsum.photos/seed/coffee/400/400' }],
		variants: [
			{
				title: 'Default',
				available: true,
				price: { value: 34.99, currency: 'USD', symbol: '$' }
			}
		]
	};
</script>

{#snippet template(args)}
	<div class="w-64">
		<ProductCard {...args} />
	</div>
{/snippet}

<Story name="In Stock" args={{ product: inStockProduct }} {template} />

<Story name="Out of Stock" args={{ product: outOfStockProduct }} {template} />

<Story name="Price Range" args={{ product: priceRangeProduct }} {template} />

<Story name="No Image" args={{ product: noImageProduct }} {template} />

<Story name="Single Variant" args={{ product: singleVariantProduct }} {template} />

<Story name="Euro Currency" args={{ product: euroProduct }} {template} />

<Story name="Long Title" args={{ product: longTitleProduct }} {template} />

<Story name="Grid Layout">
	{#snippet template(args)}
		<div class="grid grid-cols-3 gap-4 w-[800px]">
			<ProductCard product={inStockProduct} onclick={args.onclick} />
			<ProductCard product={outOfStockProduct} onclick={args.onclick} />
			<ProductCard product={priceRangeProduct} onclick={args.onclick} />
			<ProductCard product={noImageProduct} onclick={args.onclick} />
			<ProductCard product={singleVariantProduct} onclick={args.onclick} />
			<ProductCard product={euroProduct} onclick={args.onclick} />
		</div>
	{/snippet}
</Story>
