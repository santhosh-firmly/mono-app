<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import IconC2p from '$lib/components/ui/icons/icon-c2p.svelte';
	import IconCcBrand from '$lib/components/ui/icons/icon-cc-brand.svelte';
	import UiGroup from '$lib/components/ui/group.svelte';

	/**
	 * @typedef {Object} PaymentCollapsedProps
	 * @property {Object} card - The selected card to display
	 * @property {string} card.brand - Card brand (e.g., "Mastercard", "Visa")
	 * @property {string} card.last4 - Last 4 digits of the card
	 * @property {string} card.first4 - First 4 digits of the card (for icon detection)
	 * @property {string} [card.wallet] - Wallet type (e.g., "c2p" for Click to Pay)
	 * @property {string} [card.art] - Card art image URL from Click to Pay
	 * @property {Function} onchange - Callback when "Change" button is clicked
	 * @property {boolean} [disabled] - Whether the component is disabled
	 * @property {boolean} [grouped] - Whether component is rendered inside a parent UiGroup
	 */

	/** @type {PaymentCollapsedProps} */
	let { card, onchange = () => {}, disabled = false, grouped = false } = $props();

	let isC2PCard = $derived(card?.wallet === 'c2p');
</script>

{#if grouped}
	<!-- When grouped, render without UiGroup wrapper -->
	<div class="flex flex-row items-center justify-between bg-white p-4">
		<div class="flex items-center gap-3">
			{#if isC2PCard}
				<IconC2p width={32} height={17} />
				<div class="mx-1 h-6 w-px bg-gray-300"></div>
			{/if}
			<IconCcBrand first4={card?.first4} art={card?.art} />
			<span class="text-sm">{card?.brand} *** {card?.last4}</span>
		</div>
		<button
			type="button"
			class={[
				'ml-4 flex shrink-0 cursor-pointer items-center justify-center self-start rounded-md border border-gray-300 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700',
				disabled && 'cursor-not-allowed opacity-50'
			]}
			onclick={onchange}
			{disabled}
		>
			<Icon icon="mdi:swap-horizontal" class="text-base" />
		</button>
	</div>
{:else}
	<!-- Default: render with UiGroup wrapper -->
	<UiGroup>
		<div class="flex flex-row items-center justify-between p-4">
			<div class="flex items-center gap-3">
				{#if isC2PCard}
					<IconC2p width={32} height={17} />
					<div class="mx-1 h-6 w-px bg-gray-300"></div>
				{/if}
				<IconCcBrand first4={card?.first4} art={card?.art} />
				<span class="text-sm">{card?.brand} *** {card?.last4}</span>
			</div>
			<button
				type="button"
				class={[
					'ml-4 flex shrink-0 cursor-pointer items-center justify-center self-start rounded-md border border-gray-300 bg-white p-1.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700',
					disabled && 'cursor-not-allowed opacity-50'
				]}
				onclick={onchange}
				{disabled}
			>
				<Icon icon="mdi:swap-horizontal" class="text-base" />
			</button>
		</div>
	</UiGroup>
{/if}
