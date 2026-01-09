<script>
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatCurrency } from '$lib/currency.js';

	let { cardType = '', lastFour = '', amount = 0, title = 'Payment Information' } = $props();

	let hasPaymentInfo = $derived(cardType || lastFour);
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2 text-base">
			<CreditCard class="h-4 w-4" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if hasPaymentInfo}
			<div class="space-y-2">
				<div class="flex items-center gap-2">
					<Badge variant="secondary" class="text-xs">
						{cardType || 'Card'}
					</Badge>
					{#if lastFour}
						<span class="font-mono text-sm">
							•••• {lastFour}
						</span>
					{/if}
				</div>
				{#if amount > 0}
					<p class="text-sm text-muted-foreground">
						Amount: {formatCurrency(amount)}
					</p>
				{/if}
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">No payment information available</p>
		{/if}
	</Card.Content>
</Card.Root>
