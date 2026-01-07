<script>
	import Package from 'lucide-svelte/icons/package';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import { getProductImage } from '$lib/order-utils.js';
	import { SvelteSet } from 'svelte/reactivity';

	let { items = [], title = 'Order Items' } = $props();

	let imageErrors = new SvelteSet();

	function handleImageError(index) {
		imageErrors.add(index);
		imageErrors = new SvelteSet(imageErrors);
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2">
			<Package class="h-5 w-5" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<div class="space-y-4">
			{#each items as item, index (index)}
				<div class="flex gap-4 rounded-lg border bg-card p-4">
					<!-- Product image -->
					{#if getProductImage(item) && !imageErrors.has(index)}
						<div class="flex-shrink-0">
							<img
								src={getProductImage(item)}
								alt={item.description || item.name || 'Product'}
								class="h-20 w-20 rounded-md border object-cover"
								onerror={() => handleImageError(index)}
							/>
						</div>
					{:else}
						<div
							class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md border bg-muted"
						>
							<Package class="h-8 w-8 text-muted-foreground" />
						</div>
					{/if}

					<!-- Product details -->
					<div class="min-w-0 flex-1">
						<h4 class="truncate text-sm font-medium">
							{item.description || item.name || 'Item'}
						</h4>
						{#if item.sku}
							<p class="mt-1 text-xs text-muted-foreground">
								SKU: {item.sku}
							</p>
						{/if}
						{#if item.variant || item.options}
							<p class="mt-1 text-xs text-muted-foreground">
								{item.variant || item.options}
							</p>
						{/if}
						<div class="mt-2 flex items-center justify-between">
							<span class="text-sm text-muted-foreground">
								Qty: {item.quantity}
							</span>
							<div class="text-right">
								<p class="text-sm font-medium">
									{formatCurrency(item.line_price?.value || item.line_price || 0)}
								</p>
								{#if item.unit_price}
									<p class="text-xs text-muted-foreground">
										{formatCurrency(
											item.unit_price?.value || item.unit_price || 0
										)} each
									</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</Card.Content>
</Card.Root>
