<script>
	import UiLabel from '$lib/components/ui/ui-label.svelte';
	import UiRadio from '$lib/components/ui/ui-radio.svelte';
	import UiGroup from '$lib/components/ui/ui-group.svelte';
	import UiAlert from '$lib/components/ui/ui-alert.svelte';
	import * as m from '$lib/paraglide/messages';
	import { toCurrency } from '$lib/states/ui-config.svelte';

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
	 */

	/**
	 * @type {CheckoutShippingMethodsProps}
	 */
	let {
		selectedShippingMethod = $bindable(''),
		onSelect,
		shippingMethods = [],
		isLoading = false,
		isUpdating = false
	} = $props();
	let isWaiting = $derived(shippingMethods.length === 0 && !isLoading);

	function handleSelect(shippingMethod) {
		onSelect(shippingMethod);
	}
</script>

<UiLabel label="Shipping Method">
	{#if isLoading}
		<UiGroup>
			{#each Array(2)}
				<div class="px-3 py-2.5">
					<div class="flex w-full items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="h-4 w-4 animate-pulse rounded-full bg-gray-200"></div>
							<div class="h-4 w-48 animate-pulse rounded-lg bg-gray-200"></div>
						</div>
						<div class="h-4 w-12 animate-pulse rounded-lg bg-gray-200"></div>
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
					isSelected={selectedShippingMethod.sku === method.sku}
					onSelect={() => handleSelect(method)}
					class="px-3 py-2.5"
					disabled={isUpdating}
				>
					<span class="flex w-full items-center justify-between text-sm font-bold">
						<p>{method.description}</p>
						<p>{toCurrency(method.price.value)}</p>
					</span>
				</UiRadio>
			{/each}
		</UiGroup>
	{/if}
</UiLabel>

<style scoped>
	:global(input[type='radio']:checked) {
		background-image: none;
	}
</style>
