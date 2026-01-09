<script>
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { product, onclick = null } = $props();

	// Get image - first try product images, then first variant's images
	let imageUrl = $derived(() => {
		if (product.images?.length > 0) {
			return product.images[0].url;
		}
		if (product.variants?.[0]?.images?.length > 0) {
			return product.variants[0].images[0].url;
		}
		return '/images/placeholder.svg';
	});

	// Get price - price is now an object with value, currency, symbol
	let priceDisplay = $derived(() => {
		const variant = product.variants?.[0];
		if (variant?.price) {
			const symbol = variant.price.symbol || '$';
			const value = variant.price.value;
			return `${symbol}${value}`;
		}
		if (product.price_range) {
			const min = product.price_range.min;
			const max = product.price_range.max;
			if (min === max) {
				return `$${min}`;
			}
			return `$${min} - $${max}`;
		}
		return null;
	});

	// Availability - use has_available_variants or check first variant
	let isAvailable = $derived(
		product.has_available_variants ?? product.variants?.[0]?.available ?? false
	);

	// Variant count
	let variantCount = $derived(product.total_variant_count || product.variants?.length || 0);
</script>

<button
	type="button"
	class="group relative overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg hover:border-muted-foreground/50 transition-all duration-200 text-left w-full"
	{onclick}
>
	<div class="aspect-square overflow-hidden bg-muted">
		<img
			src={imageUrl()}
			alt={product.title}
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
			loading="lazy"
		/>
	</div>
	<div class="p-4 space-y-2">
		<div class="flex items-center justify-between gap-2">
			<Badge variant={isAvailable ? 'default' : 'secondary'} class="text-xs">
				{isAvailable ? 'In Stock' : 'Out of Stock'}
			</Badge>
			{#if variantCount > 1}
				<span class="text-xs text-muted-foreground">{variantCount} variants</span>
			{/if}
		</div>
		<h3
			class="font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors"
		>
			{product.title}
		</h3>
		{#if priceDisplay()}
			<p class="text-foreground font-semibold">
				{priceDisplay()}
			</p>
		{/if}
		{#if product.handle}
			<p class="text-xs text-muted-foreground truncate">
				{product.handle}
			</p>
		{/if}
	</div>
</button>
