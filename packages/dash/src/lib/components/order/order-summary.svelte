<script>
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { formatCurrency } from '$lib/currency.js';

	let { subtotal = 0, discount = 0, shipping = 0, tax = 0, total = 0 } = $props();
</script>

<div class="space-y-2">
	<div class="flex justify-between text-sm">
		<span class="text-muted-foreground">Subtotal</span>
		<span>{formatCurrency(subtotal)}</span>
	</div>
	{#if discount > 0}
		<div class="flex justify-between text-sm">
			<span class="text-muted-foreground">Discount</span>
			<span class="text-green-600">
				-{formatCurrency(discount)}
			</span>
		</div>
	{/if}
	<div class="flex justify-between text-sm">
		<span class="text-muted-foreground">Shipping</span>
		<span>{formatCurrency(shipping)}</span>
	</div>
	<div class="flex justify-between text-sm">
		<span class="text-muted-foreground">Tax</span>
		<span>{formatCurrency(tax)}</span>
	</div>
	<Separator class="my-2" />
	<div class="flex justify-between font-semibold">
		<span>Total</span>
		<span>{formatCurrency(total)}</span>
	</div>
</div>
