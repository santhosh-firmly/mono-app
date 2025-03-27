<script>
	import Icon from '@iconify/svelte';
	import IconCcBrand from '$lib/components/icon/icon-cc-brand.svelte';
	import UiGroup from '$lib/components/ui/ui-group.svelte';
	import UiRadio from '$lib/components/ui/ui-radio.svelte';

	/**
	 * @typedef {Object} CheckoutPaymentCardListProps
	 * @property {Array<Object>} cards - The list of cards to display
	 * @property {boolean} disabled - Whether the cards are disabled
	 * @property {Function} onAddNewCard - The function to call when the user wants to add a new card
	 * @property {Function} onSelect - The function to call when the user selects a card
	 * @property {Object} selectedCard - The selected card
	 */

	/**
	 * @type {CheckoutPaymentCardListProps}
	 */
	let { cards = [], disabled, onAddNewCard, onSelect, selectedCard } = $props();

	function isSelected(card) {
		return JSON.stringify(selectedCard) === JSON.stringify(card);
	}
</script>

<UiGroup>
	{#each cards as card, index (index)}
		<div class="p-4">
			<UiRadio
				id={index}
				name="shipping-address"
				{disabled}
				onSelect={() => onSelect(card)}
				isSelected={isSelected(card)}
			>
				<div class="ml-2 flex w-full items-center gap-3 first:text-2xl">
					<IconCcBrand first4={card.first4} />
					<p class="text-sm font-bold">{card.brand} *** {card.last4}</p>
				</div>
			</UiRadio>
		</div>
	{/each}

	<button
		{disabled}
		onclick={onAddNewCard}
		class="flex cursor-pointer items-center justify-center gap-2 p-4 text-sm font-bold {disabled
			? 'text-muted cursor-not-allowed'
			: ''}"
	>
		<Icon icon="mdi:plus" />
		Add new card
	</button>
</UiGroup>
