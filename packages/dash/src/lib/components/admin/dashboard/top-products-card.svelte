<script>
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import Package from 'lucide-svelte/icons/package';
	import ShoppingBag from 'lucide-svelte/icons/shopping-bag';
	import Layers from 'lucide-svelte/icons/layers';

	let { topProducts = [] } = $props();

	let hasData = $derived(topProducts?.length > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Top Products</Card.Title>
		<Card.Description>Best selling products across all merchants</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<div class="space-y-4">
				{#each topProducts as product, index (product.name)}
					<div
						class="flex items-center justify-between gap-4 p-4 border border-border rounded-lg"
					>
						<div class="flex items-center gap-3 min-w-0">
							<span class="text-xs text-muted-foreground font-medium shrink-0">
								#{index + 1}
							</span>
							<Avatar.Root class="h-10 w-10 rounded-lg shrink-0">
								{#if product.image}
									<Avatar.Image src={product.image} alt={product.name} />
								{/if}
								<Avatar.Fallback class="rounded-lg">
									<Package class="h-4 w-4 text-muted-foreground" />
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="min-w-0">
								<p class="font-medium text-foreground truncate">{product.name}</p>
								<div class="flex flex-wrap gap-1.5 mt-1">
									<Badge variant="outline" class="gap-1 text-xs px-1.5 py-0">
										<Package class="h-3 w-3" />
										{product.quantity} units
									</Badge>
									<Badge variant="outline" class="gap-1 text-xs px-1.5 py-0">
										<ShoppingBag class="h-3 w-3" />
										{product.orders} orders
									</Badge>
									<Badge variant="secondary" class="gap-1 text-xs px-1.5 py-0">
										<Layers class="h-3 w-3" />
										{(product.quantity / product.orders).toFixed(1)}x
									</Badge>
								</div>
							</div>
						</div>
						<div class="text-right shrink-0">
							<p class="font-semibold text-foreground">
								{formatCurrency(product.revenue)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center text-muted-foreground">
				<Package class="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
				<p>No product data available</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
