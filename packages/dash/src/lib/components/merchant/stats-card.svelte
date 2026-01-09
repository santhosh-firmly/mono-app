<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import TrendingUp from 'lucide-svelte/icons/trending-up';
	import TrendingDown from 'lucide-svelte/icons/trending-down';
	import Minus from 'lucide-svelte/icons/minus';

	let {
		title,
		value,
		change = null,
		changeLabel = 'vs last month',
		icon: Icon,
		iconBgColor = 'bg-primary/10',
		iconColor = 'text-primary'
	} = $props();

	function formatChange(val) {
		if (val === 0) return '0%';
		const sign = val > 0 ? '+' : '';
		return `${sign}${val.toFixed(1)}%`;
	}

	// Determine trend: positive, negative, or neutral
	let trend = $derived(
		change === null || change === undefined
			? null
			: change > 0
				? 'positive'
				: change < 0
					? 'negative'
					: 'neutral'
	);

	let trendColor = $derived(
		trend === 'positive'
			? 'text-green-600 dark:text-green-400'
			: trend === 'negative'
				? 'text-red-600 dark:text-red-400'
				: 'text-muted-foreground'
	);
</script>

<Card.Root>
	<Card.Content class="pt-6">
		<div class="flex items-center justify-between">
			<div>
				<p class="text-sm text-muted-foreground">{title}</p>
				<p class="text-2xl font-semibold mt-1 text-foreground">{value}</p>
				{#if change !== null && change !== undefined}
					<p class={['text-sm mt-1 flex items-center gap-1', trendColor]}>
						{#if trend === 'positive'}
							<TrendingUp class="w-3 h-3" />
						{:else if trend === 'negative'}
							<TrendingDown class="w-3 h-3" />
						{:else}
							<Minus class="w-3 h-3" />
						{/if}
						{formatChange(change)}
						{changeLabel}
					</p>
				{:else}
					<p class="text-sm text-muted-foreground mt-1">{changeLabel}</p>
				{/if}
			</div>
			{#if Icon}
				<div
					class={['w-12 h-12 rounded-full flex items-center justify-center', iconBgColor]}
				>
					<Icon class={['w-6 h-6', iconColor]} />
				</div>
			{/if}
		</div>
	</Card.Content>
</Card.Root>
