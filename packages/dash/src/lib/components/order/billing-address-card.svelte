<script>
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import * as Card from '$lib/components/ui/card/index.js';

	let { address = {}, title = 'Billing Address' } = $props();
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="flex items-center gap-2 text-base">
			<CreditCard class="h-4 w-4" />
			{title}
		</Card.Title>
	</Card.Header>
	<Card.Content>
		<address class="space-y-1 text-sm not-italic">
			{#if address.name}
				<p class="font-medium">{address.name}</p>
			{/if}
			{#if address.address_line_1}
				<p>{address.address_line_1}</p>
			{/if}
			{#if address.address_line_2}
				<p>{address.address_line_2}</p>
			{/if}
			{#if address.city || address.state_or_province || address.postal_code}
				<p>
					{address.city}{address.city && address.state_or_province ? ',' : ''}
					{address.state_or_province}
					{address.postal_code}
				</p>
			{/if}
			{#if address.country}
				<p>{address.country}</p>
			{/if}
		</address>
	</Card.Content>
</Card.Root>
