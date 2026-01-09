<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';

	let { topMerchants = [], appId } = $props();

	function getInitials(name) {
		if (!name) return '?';
		const parts = name.split(' ');
		if (parts.length >= 2) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return name.substring(0, 2).toUpperCase();
	}

	// Calculate total for percentages
	let totalRevenue = $derived(topMerchants.reduce((sum, m) => sum + (m.revenue || 0), 0));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center justify-between">
			<div>
				<Card.Title>Top Merchants</Card.Title>
				<Card.Description>Best performers this month</Card.Description>
			</div>
			<a
				href={`/destination/${appId}/merchants`}
				class="text-sm text-primary hover:underline flex items-center gap-1"
			>
				View all
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</Card.Header>
	<Card.Content>
		{#if topMerchants.length === 0}
			<div class="py-8 text-center text-muted-foreground">No merchant data available</div>
		{:else}
			<div class="space-y-4">
				{#each topMerchants as merchant (merchant.domain)}
					{@const percentage =
						totalRevenue > 0 ? (merchant.revenue / totalRevenue) * 100 : 0}
					<div class="flex items-center gap-3">
						<Avatar.Root class="h-9 w-9 border border-border">
							<Avatar.Fallback class="bg-primary/10 text-primary text-xs font-medium">
								{getInitials(merchant.displayName)}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between mb-1">
								<span class="text-sm font-medium truncate"
									>{merchant.displayName}</span
								>
								<span class="text-sm font-medium"
									>{formatCurrency(merchant.revenue)}</span
								>
							</div>
							<div class="flex items-center gap-2">
								<div class="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
									<div
										class="h-full bg-primary rounded-full transition-all"
										style="width: {percentage}%"
									></div>
								</div>
								<span class="text-xs text-muted-foreground w-12 text-right">
									{merchant.orders} orders
								</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Card.Content>
</Card.Root>
