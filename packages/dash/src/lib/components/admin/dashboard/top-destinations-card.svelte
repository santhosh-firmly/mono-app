<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { PieChart } from '$lib/components/charts/index.js';
	import Globe from 'lucide-svelte/icons/globe';

	let { topDestinations = [] } = $props();

	let hasData = $derived(topDestinations?.length > 0);

	// Transform data for PieChart (expects name and the valueKey property)
	let chartData = $derived(
		topDestinations.map((d) => ({
			name: d.displayName,
			revenue: d.revenue,
			orders: d.orders
		}))
	);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Revenue by Destination</Card.Title>
		<Card.Description>Distribution of revenue across destinations this month</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<PieChart data={chartData} valueKey="revenue" />
		{:else}
			<div class="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
				<Globe class="mb-4 h-12 w-12 text-muted-foreground/50" />
				<p>No destination data available</p>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
