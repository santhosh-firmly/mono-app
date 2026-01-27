<script>
	import IconCcBrand from '$lib/components/ui/icons/icon-cc-brand.svelte';
	import IconC2p from '$lib/components/ui/icons/icon-c2p.svelte';
	import IconMastercard from '$lib/components/ui/icons/icon-mastercard.svelte';
	import IconVisa from '$lib/components/ui/icons/icon-visa.svelte';
	import IconAmex from '$lib/components/ui/icons/icon-amex.svelte';
	import IconDiscover from '$lib/components/ui/icons/icon-discover.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';
	import UiRadio from '$lib/components/ui/radio.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CheckoutPaymentCardListProps
	 * @property {Array<Object>} cards - The list of cards to display
	 * @property {boolean} disabled - Whether the cards are disabled
	 * @property {Function} onAddNewCard - The function to call when the user wants to add a new card
	 * @property {Function} onSelect - The function to call when the user selects a card
	 * @property {Object} selectedCard - The selected card
	 * @property {Function} onNotYourCards - Callback when user clicks "Not your cards?"
	 */

	/**
	 * @type {CheckoutPaymentCardListProps}
	 */
	let {
		cards = [],
		disabled,
		onAddNewCard,
		onSelect,
		selectedCard,
		onNotYourCards = () => {}
	} = $props();

	let hasC2PCards = $derived(cards.some((c) => c.wallet === 'c2p'));

	function isSelected(card) {
		return JSON.stringify(selectedCard) === JSON.stringify(card);
	}

	function handleSelectCard(card) {
		onSelect(card);
	}

	function handleSelectNewCard() {
		onAddNewCard();
	}
</script>

<UiGroup>
	<!-- Click to Pay Logo Header -->
	{#if hasC2PCards}
		<div
			class="flex w-full flex-row items-center justify-between gap-3 rounded-t-lg border-b border-gray-200 px-4 py-3"
			data-testid="c2p-header"
		>
			<div class="flex items-center gap-2">
				<IconC2p width={32} height={17} />
				<span class="text-sm font-medium text-gray-800">
					{m.c2p_credit_debit()}
				</span>
			</div>
			<div class="flex items-center gap-0.5">
				<IconMastercard width={24} height={15} />
				<IconVisa width={24} height={15} />
				<IconAmex width={24} height={15} />
				<IconDiscover width={24} height={15} />
			</div>
		</div>
	{/if}

	<!-- Saved Cards List -->
	{#each cards as card, index (index)}
		<div class="border-b border-gray-100 px-4 py-3">
			<UiRadio
				id={`card-${index}`}
				name="saved-card"
				{disabled}
				onSelect={() => handleSelectCard(card)}
				isSelected={isSelected(card)}
			>
				<div class="ml-2 flex w-full items-center gap-3">
					<IconCcBrand first4={card.first4} art={card.art} />
					<p class="text-sm">{card.brand} *** {card.last4}</p>
				</div>
			</UiRadio>
		</div>
	{/each}

	<!-- Add New Card Button -->
	<div class="px-4 py-3">
		<button
			type="button"
			{disabled}
			onclick={handleSelectNewCard}
			class="text-sm text-gray-600 hover:underline {disabled
				? 'cursor-not-allowed opacity-50'
				: 'cursor-pointer'}"
		>
			{m.c2p_add_new_card()}
		</button>
	</div>
</UiGroup>

<!-- Not your cards? button (only for C2P cards) - outside the Group like v4 -->
{#if hasC2PCards}
	<div class="flex items-center justify-end">
		<button
			{disabled}
			onclick={onNotYourCards}
			class="cursor-pointer rounded-full p-3 text-xs font-bold text-gray-500 underline {disabled
				? 'cursor-not-allowed opacity-50'
				: 'hover:text-gray-700'}"
			data-testid="not-your-cards-button"
		>
			{m.c2p_not_your_cards()}
		</button>
	</div>
{/if}
