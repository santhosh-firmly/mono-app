<script>
	import * as m from '$lib/paraglide/messages';
	import { toCurrency } from '$lib/utils/currency.js';
	import { useAnimatedValue } from '$lib/composables/animated-value.svelte.js';

	/**
	 * @typedef {Object} SummaryResumeProps
	 * @property {number} total - The total price
	 * @property {number} subtotal - The subtotal price
	 * @property {number} shipping - The shipping price
	 * @property {number} tax - The tax price
	 * @property {boolean} isCalculating - Whether shipping/tax are being calculated
	 * @property {boolean} hiddenTotal - Whether the total price is hidden
	 */

	/**
	 * @type {SummaryResumeProps}
	 */
	let {
		total = 0,
		subtotal = 0,
		shipping = 0,
		tax = 0,
		isCalculating = false,
		hiddenTotal = false
	} = $props();

	const animatedSubtotal = useAnimatedValue(() => subtotal);
	const animatedTotal = useAnimatedValue(() => total);
</script>

{#snippet skeleton()}
	<div class="bg-border h-4 w-12 animate-pulse rounded-md"></div>
{/snippet}

{#snippet shippingValue()}
	{#if shipping?.price === undefined || shipping?.price === null}
		{m.enter_shipping_address()}
	{:else if shipping.price === 0}
		{m.free()}
	{:else}
		{toCurrency(shipping.price)}
	{/if}
{/snippet}

<div class="flex flex-col gap-y-4">
	<div class="border-b-border flex flex-col gap-y-4 border-b pb-4 text-start">
		<span class="flex items-center justify-between">
			<p class="text-text text-sm font-semibold">{m.subtotal()}</p>
			<p class="text-text text-sm font-semibold">
				{toCurrency(animatedSubtotal.value)}
			</p>
		</span>
		<span class="text-muted flex items-center justify-between">
			<span class="">
				<p class="text-sm">{m.shipping()}</p>
				{#if shipping?.description}<p class="text-xs">{shipping.description}</p>{/if}
			</span>
			{#if isCalculating}
				{@render skeleton()}
			{:else}
				<p class="text-sm">{@render shippingValue()}</p>
			{/if}
		</span>
		<span class="text-muted flex items-center justify-between">
			<p class="text-sm">{m.tax()}</p>
			{#if isCalculating}
				{@render skeleton()}
			{:else}
				<p class="text-sm">
					{shipping?.price !== undefined && shipping?.price !== null
						? toCurrency(tax)
						: m.enter_shipping_address()}
				</p>
			{/if}
		</span>
	</div>

	{#if !hiddenTotal}
		<span class="text-text flex items-center justify-between">
			<p class="text-sm font-semibold">{m.total_due_today()}</p>
			<p class="text-sm font-semibold">{toCurrency(animatedTotal.value)}</p>
		</span>
	{/if}
</div>
