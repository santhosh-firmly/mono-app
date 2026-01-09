<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { BarChart } from '$lib/components/charts/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import Store from 'lucide-svelte/icons/store';

	let { destinationChart = [] } = $props();

	let hasData = $derived(destinationChart?.length > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Performance by Destination</Card.Title>
		<Card.Description>Revenue and order metrics for each platform</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<BarChart data={destinationChart} />

			<div class="mt-6 space-y-3">
				{#each destinationChart as dest (dest.name)}
					<div
						class="flex items-center justify-between p-3 border border-border rounded-lg"
					>
						<div class="flex items-center gap-3">
							<div
								class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary"
							>
								{dest.name.slice(0, 2).toUpperCase()}
							</div>
							<div>
								<p class="font-medium text-foreground">{dest.name}</p>
								<p class="text-sm text-muted-foreground">{dest.orders} orders</p>
							</div>
						</div>
						<div class="text-right">
							<p class="font-medium text-foreground">
								{formatCurrency(dest.revenue)}
							</p>
							<p class="text-sm text-muted-foreground">
								{formatCurrency(dest.aov)} AOV
							</p>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="py-12 text-center text-muted-foreground">
				<Store class="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
				<p>No destination data available yet</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
