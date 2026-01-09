<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import Package from 'lucide-svelte/icons/package';

	let { topProducts = [] } = $props();

	let hasData = $derived(topProducts?.length > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Top Performing Products</Card.Title>
		<Card.Description>Best sellers across all destinations</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<div class="space-y-4">
				{#each topProducts as product, index (product.name)}
					<div
						class="flex items-center justify-between p-4 border border-border rounded-lg"
					>
						<div class="flex items-center gap-4">
							<div
								class="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium"
							>
								{index + 1}
							</div>
							<div>
								<p class="font-medium text-foreground">{product.name}</p>
								<p class="text-sm text-muted-foreground">
									{product.quantity} units sold across {product.orders} orders
								</p>
							</div>
						</div>
						<div class="text-right">
							<p class="font-medium text-foreground">
								{formatCurrency(product.revenue)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center text-muted-foreground">
				<Package class="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
				<p>No product data available yet</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
