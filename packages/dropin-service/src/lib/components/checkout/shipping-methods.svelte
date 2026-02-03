<script>
	import UiLabel from '$lib/components/ui/label.svelte';
	import UiRadio from '$lib/components/ui/radio.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';
	import UiAlert from '$lib/components/ui/alert.svelte';
	import * as m from '$lib/paraglide/messages';
	import { toCurrency } from '$lib/utils/currency.js';

	function formatShippingPrice(price) {
		if (price?.value === 0) return m.free();
		return toCurrency(price?.value);
	}

	/**
	 * @typedef {Object} ShippingMethod
	 * @property {string} sku - The SKU of the shipping method
	 * @property {string} description - The description of the shipping method
	 * @property {number} price - The price of the shipping method
	 */

	/**
	 * @typedef {Object} CheckoutShippingMethodsProps
	 * @property {string} selectedShippingMethod - The selected shipping method
	 * @property {Function} onSelect - The function to call when a shipping method is selected
	 * @property {Array<ShippingMethod>} shippingMethods - The list of shipping methods
	 * @property {boolean} isLoading - Whether the shipping methods are loading
	 * @property {boolean} isUpdating - Whether the shipping methods are updating
	 * @property {string} error - Error message from backend
	 */

	/**
	 * @type {CheckoutShippingMethodsProps}
	 */
	let {
		selectedShippingMethod = $bindable(''),
		onSelect,
		shippingMethods = [],
		isLoading = false,
		isUpdating = false,
		error = ''
	} = $props();
	let isWaiting = $derived(shippingMethods.length === 0 && !isLoading);

	function handleSelect(shippingMethod) {
		onSelect(shippingMethod);
	}
</script>

<UiLabel label={m.shipping_method()} errorMessage={error}>
	{#if isLoading}
		<UiGroup>
			{#each [0, 1] as item (item)}
				<div class="flex min-h-10 items-center px-3 py-2.5">
					<div class="flex w-full items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="size-4 animate-pulse rounded-full bg-gray-300"></div>
							<div class="h-4 w-48 animate-pulse rounded-lg bg-gray-300"></div>
						</div>
						<div class="h-4 w-16 animate-pulse rounded-lg bg-gray-300"></div>
					</div>
				</div>
			{/each}
		</UiGroup>
	{:else if isWaiting}
		<UiAlert>{m.complete_shipping_message()}</UiAlert>
	{:else}
		<UiGroup>
			{#each shippingMethods as method (method.sku)}
				<UiRadio
					id={method.sku}
					name={method.description}
					isSelected={selectedShippingMethod === method.sku ||
						selectedShippingMethod?.sku === method.sku}
					onSelect={() => handleSelect(method.sku)}
					class="min-h-10 px-2.5 py-2"
					disabled={isUpdating}
				>
					<span
						class="flex min-h-8.75 w-full items-center justify-between text-sm font-bold"
					>
						<span>
							<p>{method.description}</p>
							{#if method.estimated_delivery}
								<p class="text-muted text-xs">{method.estimated_delivery}</p>
							{/if}
						</span>
						<p>{formatShippingPrice(method.price)}</p>
					</span>
				</UiRadio>
			{/each}
		</UiGroup>
	{/if}
</UiLabel>

<style>
	:global(input[type='radio']:checked) {
		background-image: none;
	}
</style>
