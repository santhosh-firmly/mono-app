<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import ShoppingBag from 'lucide-svelte/icons/shopping-bag';

	let { recentOrders = [] } = $props();

	let hasData = $derived(recentOrders?.length > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Recent Orders</Card.Title>
		<Card.Description>Latest transactions across all destinations</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<div class="space-y-3">
				{#each recentOrders as order (order.id)}
					<div
						class="flex items-center justify-between p-4 border border-border rounded-lg"
					>
						<div>
							<p class="text-sm text-muted-foreground">{order.id}</p>
							<p class="font-medium text-foreground">
								{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
							</p>
							<Badge variant="outline" class="mt-1 text-xs">
								{order.destination}
							</Badge>
						</div>
						<div class="text-right">
							<p class="font-medium text-foreground">
								{formatCurrency(order.amount)}
							</p>
							<p class="text-sm text-muted-foreground">
								{new Date(order.date).toLocaleDateString(undefined, {
									month: 'short',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center text-muted-foreground">
				<ShoppingBag class="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
				<p>No orders yet</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
