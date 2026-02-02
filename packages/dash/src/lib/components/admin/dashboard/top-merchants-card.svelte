<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { BarChart } from '$lib/components/charts/index.js';
	import Store from 'lucide-svelte/icons/store';

	let { topMerchants = [] } = $props();

	let hasData = $derived(topMerchants?.length > 0);

	// Transform data for BarChart (expects name, orders, revenue)
	let chartData = $derived(
		topMerchants.map((m) => ({
			name: m.displayName,
			orders: m.orders,
			revenue: m.revenue
		}))
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Top Merchants</Card.Title>
		<Card.Description>Best performing merchants by revenue this month</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<BarChart data={chartData} />
		{:else}
			<div class="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
				<Store class="mb-4 h-12 w-12 text-muted-foreground/50" />
				<p>No merchant data available</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
