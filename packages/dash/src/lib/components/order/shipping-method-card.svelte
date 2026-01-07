<script>
	import Truck from 'lucide-svelte/icons/truck';
	import * as Card from '$lib/components/ui/card/index.js';
	import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';

	let {
		description = 'Standard Shipping',
		estimatedDelivery = '',
		trackingNumber = '',
		title = 'Shipping Method'
	} = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2 text-base">
			<Truck class="h-4 w-4" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content class="space-y-2">
		<p class="text-sm font-medium">
			{description}
		</p>
		{#if estimatedDelivery}
			<p class="text-sm text-muted-foreground">
				Estimated delivery: {estimatedDelivery}
			</p>
		{/if}
		{#if trackingNumber}
			<div class="flex items-center gap-2">
				<span class="text-sm text-muted-foreground">Tracking:</span>
				<span class="font-mono text-sm">
					{trackingNumber}
				</span>
				<CopyToClipboard value={trackingNumber} />
			</div>
		{/if}
	</Card.Content>
</Card.Root>
