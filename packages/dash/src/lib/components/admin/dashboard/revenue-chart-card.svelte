<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { AreaChart } from '$lib/components/charts/index.js';

	let { revenueChart } = $props();

	let hasData = $derived(revenueChart?.currentMonth?.length > 0);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Cumulative Revenue</Card.Title>
		<Card.Description
			>Month-to-date revenue accumulation across all filtered data</Card.Description
		>
	</Card.Header>
	<Card.Content>
		{#if hasData}
			<AreaChart
				data={revenueChart.currentMonth}
				comparisonData={revenueChart.previousMonth || []}
				label={revenueChart.currentMonthLabel}
				comparisonLabel={revenueChart.previousMonthLabel}
				color="#8b5cf6"
			/>
		{:else}
			<div class="h-[300px] flex items-center justify-center text-muted-foreground">
				No revenue data available
			</div>
		{/if}
	</Card.Content>
</Card.Root>
