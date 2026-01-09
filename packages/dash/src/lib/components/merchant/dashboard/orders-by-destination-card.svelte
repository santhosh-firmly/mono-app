<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { PieChart } from '$lib/components/charts/index.js';

	let { destinationChart = [] } = $props();

	let hasData = $derived(destinationChart?.length > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Orders by Destination</Card.Title>
		<Card.Description>Distribution across platforms</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<PieChart data={destinationChart} valueKey="orders" />
		{:else}
			<div class="h-[300px] flex items-center justify-center text-muted-foreground">
				No destination data available
			</div>
		{/if}
	</Card.Content>
</Card.Root>
