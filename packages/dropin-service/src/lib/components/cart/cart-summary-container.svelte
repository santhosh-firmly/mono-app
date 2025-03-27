<script>
	import { toCurrency } from '$lib/states/ui-config.svelte';
	import UiQuantitySelector from '$lib/components/ui/ui-quantity-selector.svelte';
	import UiImage from '$lib/components/ui/ui-image.svelte';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} ContainerItem
	 * @property {string} image - The image of the item
	 * @property {string} title - The title of the item
	 * @property {string} description - The description of the item
	 * @property {number} price - The price of the item
	 * @property {number} quantity - The quantity of the item
	 */

	/**
	 * @typedef {Object} CartSummaryContainerProps
	 * @property {Array<Item>} items - The list of items
	 * @property {import('svelte').Snippets} promocode - The snippet to render the promocode
	 * @property {import('svelte').Snippets} resume - The snippet to render the resume
	 * @property {Function} onQuantityChange - The function to call when the quantity of an item is changed
	 * @property {boolean} isUpdating - Whether the cart is being updated
	 * @property {boolean} hiddenLineItems - Whether the line items are hidden
	 */

	/**
	 * @type {CartSummaryContainerProps}
	 */
	let { items, promocode, resume, onQuantityChange, isUpdating, hiddenLineItems } = $props();
</script>

<div class="flex flex-col gap-y-4 text-start">
	{#if !hiddenLineItems}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8" transition:slide>
			{#each items as item, index (index)}
				<div class="flex gap-x-4">
					<UiImage src={item.image} alt={item.title} title={item.title} />
					<span class="flex flex-1 flex-col gap-y-4">
						<span>
							<p class="text-text text-sm font-bold">{item.title}</p>
							{#if item.description}
								<p class="text-muted text-xs">{item.description}</p>
							{/if}
						</span>
						<UiQuantitySelector
							delay={500}
							quantity={item.quantity}
							onChange={(qty) => onQuantityChange({ ...item, quantity: qty })}
							disabled={isUpdating}
						/>
					</span>
					<p class="text-text text-sm font-semibold">{toCurrency(item.price)}</p>
				</div>
			{/each}
		</div>
	{/if}
	{@render promocode?.()}
	{@render resume?.()}
</div>
