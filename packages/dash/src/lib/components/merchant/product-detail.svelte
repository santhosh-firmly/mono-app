<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Check from 'lucide-svelte/icons/check';

	let { product, onBack } = $props();

	// Get all images from product and variants
	let allImages = $derived(() => {
		const images = [];

		// Add product-level images
		if (product.images?.length > 0) {
			images.push(...product.images.map((img) => img.url || img));
		}

		// Add variant images
		if (product.variants?.length > 0) {
			for (const variant of product.variants) {
				if (variant.images?.length > 0) {
					images.push(...variant.images.map((img) => img.url || img));
				}
			}
		}

		// Deduplicate
		return [...new Set(images)];
	});

	// Selected image for the main display
	let selectedImageIndex = $state(0);

	let mainImage = $derived(() => {
		const images = allImages();
		if (images.length > 0) {
			return images[selectedImageIndex] || images[0];
		}
		return '/images/placeholder.svg';
	});

	// Get price display
	let priceDisplay = $derived(() => {
		const variant = product.variants?.[0];
		if (variant?.price) {
			const symbol = variant.price.symbol || '$';
			const value = variant.price.value;
			return { price: `${symbol}${value}`, currency: variant.price.currency || 'USD' };
		}
		if (product.price_range) {
			const min = product.price_range.min;
			const max = product.price_range.max;
			if (min === max) {
				return { price: `$${min}`, currency: 'USD' };
			}
			return { price: `$${min} - $${max}`, currency: 'USD' };
		}
		return null;
	});

	// Availability
	let isAvailable = $derived(
		product.has_available_variants ?? product.variants?.[0]?.available ?? false
	);

	// Get stock count from variants
	let stockCount = $derived(() => {
		if (product.variants?.length > 0) {
			const total = product.variants.reduce((sum, v) => {
				return sum + (v.inventory_quantity || 0);
			}, 0);
			return total > 0 ? total : null;
		}
		return null;
	});

	// Variant count
	let variantCount = $derived(product.total_variant_count || product.variants?.length || 0);

	// SKU
	let sku = $derived(product.base_sku || product.variants?.[0]?.sku || null);

	// Product type / category
	let productType = $derived(product.product_type || product.type || null);

	// Tags
	let tags = $derived(product.tags || []);

	// Vendor
	let vendor = $derived(product.vendor || null);
</script>

<div class="space-y-6">
	<Button variant="ghost" onclick={onBack} class="mb-2">
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back to Products
	</Button>

	<Card.Root>
		<Card.Content class="p-6">
			<div class="grid md:grid-cols-2 gap-8">
				<!-- Product Images -->
				<div class="space-y-4">
					<div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
						<img
							src={mainImage()}
							alt={product.title}
							class="w-full h-full object-cover"
							onerror={(e) => (e.target.src = '/images/placeholder.svg')}
						/>
					</div>

					<!-- Thumbnail Gallery -->
					{#if allImages().length > 1}
						<div class="flex gap-2 overflow-x-auto pb-2">
							{#each allImages() as image, index (image)}
								<button
									type="button"
									class={[
										'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
										selectedImageIndex === index
											? 'border-purple-500'
											: 'border-gray-200 hover:border-gray-300'
									]}
									onclick={() => (selectedImageIndex = index)}
								>
									<img
										src={image}
										alt={`${product.title} - Image ${index + 1}`}
										class="w-full h-full object-cover"
										onerror={(e) => (e.target.src = '/images/placeholder.svg')}
									/>
								</button>
							{/each}
						</div>
					{/if}

					<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
						<p class="text-sm text-blue-700">
							<Check class="inline-block h-4 w-4 mr-1" />
							Real-time inventory and pricing integration active
						</p>
					</div>
				</div>

				<!-- Product Info -->
				<div class="space-y-6">
					<div>
						{#if productType}
							<Badge class="mb-2">{productType}</Badge>
						{/if}
						<h1 class="text-3xl font-semibold mb-2">{product.title}</h1>
						{#if sku}
							<p class="text-sm text-gray-500">SKU: {sku}</p>
						{/if}
					</div>

					{#if priceDisplay()}
						<div class="flex items-baseline gap-2">
							<span class="text-3xl font-semibold text-gray-900">
								{priceDisplay().price}
							</span>
							<span class="text-sm text-gray-500">{priceDisplay().currency}</span>
						</div>
					{/if}

					<div class="flex items-center gap-2">
						{#if isAvailable}
							<div class="w-2 h-2 rounded-full bg-green-600"></div>
							<span class="text-green-600">
								In Stock{#if stockCount()}
									({stockCount()} available){/if}
							</span>
						{:else}
							<div class="w-2 h-2 rounded-full bg-red-600"></div>
							<span class="text-red-600">Out of Stock</span>
						{/if}
					</div>

					{#if product.description || product.body_html}
						<div class="border-t border-b border-gray-200 py-4">
							<h3 class="font-medium mb-2">Description</h3>
							{#if product.body_html}
								<div
									class="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none"
								>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- HTML content from product API is trusted -->
									{@html product.body_html}
								</div>
							{:else}
								<p class="text-gray-600 text-sm leading-relaxed">
									{product.description}
								</p>
							{/if}
						</div>
					{/if}

					<!-- Product Details -->
					<div class="space-y-4">
						<h3 class="font-medium">Product Details</h3>
						<dl class="grid grid-cols-2 gap-4 text-sm">
							{#if vendor}
								<div>
									<dt class="text-gray-500">Vendor</dt>
									<dd class="font-medium">{vendor}</dd>
								</div>
							{/if}
							{#if variantCount > 0}
								<div>
									<dt class="text-gray-500">Variants</dt>
									<dd class="font-medium">{variantCount}</dd>
								</div>
							{/if}
							{#if product.handle}
								<div>
									<dt class="text-gray-500">Handle</dt>
									<dd class="font-medium">{product.handle}</dd>
								</div>
							{/if}
							{#if product.created_at}
								<div>
									<dt class="text-gray-500">Created</dt>
									<dd class="font-medium">
										{new Date(product.created_at).toLocaleDateString()}
									</dd>
								</div>
							{/if}
						</dl>
					</div>

					<!-- Tags -->
					{#if tags.length > 0}
						<div>
							<h3 class="font-medium mb-3">Tags</h3>
							<div class="flex flex-wrap gap-2">
								{#each tags as tag (tag)}
									<Badge variant="outline">{tag}</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Variants -->
					{#if product.variants?.length > 1}
						<div class="border-t border-gray-200 pt-4">
							<h3 class="font-medium mb-3">Variants ({product.variants.length})</h3>
							<div class="space-y-2 max-h-48 overflow-y-auto">
								{#each product.variants as variant (variant.sku || variant.title)}
									<div
										class="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
									>
										<div>
											<span class="font-medium"
												>{variant.title || 'Default'}</span
											>
											{#if variant.sku}
												<span class="text-gray-500 ml-2"
													>({variant.sku})</span
												>
											{/if}
										</div>
										<div class="flex items-center gap-4">
											{#if variant.price}
												<span class="font-medium">
													{variant.price.symbol || '$'}{variant.price
														.value}
												</span>
											{/if}
											{#if variant.available}
												<Badge variant="default" class="text-xs"
													>In Stock</Badge
												>
											{:else}
												<Badge variant="secondary" class="text-xs"
													>Out of Stock</Badge
												>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
