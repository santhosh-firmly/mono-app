<script>
	import { toCurrency } from '$lib/states/ui-config.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CartResumeProps
	 * @property {number} itemsQuantity - The quantity of items in the cart
	 * @property {number} totalPrice - The total price of the cart
	 * @property {boolean} isCalculating - Whether the total price is being calculated
	 * @property {string} [class] - The class to apply to the container
	 */

	/**
	 * @type {CartResumeProps}
	 */
	let { itemsQuantity, totalPrice, isCalculating, class: className } = $props();
</script>

<span class="flex flex-col items-center gap-y-2 text-center {className}">
	<p class=" text-muted capitalize">
		{m.order_total()} ({itemsQuantity >= 1
			? m.item({ qty: itemsQuantity })
			: m.items({ qty: itemsQuantity })})
	</p>
	{#if isCalculating}
		<div class="bg-border h-10 w-full max-w-36 animate-pulse rounded-md"></div>
	{:else}
		<p class="text-text text-4xl font-semibold">{toCurrency(totalPrice)}</p>
	{/if}
</span>
