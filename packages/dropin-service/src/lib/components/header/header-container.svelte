<script>
	import Icon from '@iconify/svelte';
	import { fly, slide } from 'svelte/transition';
	import { toCurrency } from '$lib/states/ui-config.svelte';
	import * as m from '$lib/paraglide/messages';
	import { clickOutside } from '$lib/directives/click-outside';

	/**
	 * @typedef {Object} HeaderContainerProps
	 * @property {number} itemsQuantity - The quantity of items in the cart
	 * @property {number} totalPrice - The total price of the cart
	 * @property {import('svelte').Snippet} summary - The summary component
	 * @property {import('svelte').Snippet} backButton - The back button component
	 * @property {string} className - The class name of the header container
	 */

	/**
	 * @type {HeaderContainerProps}
	 */
	let { itemsQuantity, totalPrice, summary, backButton, class: className } = $props();

	let isSummaryOpened = $state(false);
	let isSummaryVisible = $derived(isSummaryOpened && summary);

	function toggleSummaryVisibility() {
		isSummaryOpened = !isSummaryOpened;
	}

	function handleBackgroundClick(event) {
		if (event.target.id === 'background') {
			toggleSummaryVisibility();
		}
	}
</script>

<header
	class="bg-background flex h-[40px] items-center justify-between p-4 shadow {className}"
	class:border-b-0={isSummaryVisible}
	use:clickOutside={{ callback: toggleSummaryVisibility, active: isSummaryVisible }}
>
	{@render backButton?.()}
	<button
		onclick={toggleSummaryVisibility}
		class="text-muted flex w-1/2 cursor-pointer justify-end gap-x-1.5"
	>
		<p class="text-xs lowercase">
			{#if isSummaryOpened}
				{m.close()}
			{:else}
				{toCurrency(totalPrice)} ({itemsQuantity > 1
					? m.items({ qty: itemsQuantity })
					: m.item({ qty: itemsQuantity })})
			{/if}
		</p>
		<Icon
			icon="mdi:chevron-up"
			class="{!isSummaryVisible
				? 'rotate-180'
				: ''} text-md transition-transform duration-400"
		/>
	</button>

	{#if isSummaryVisible}
		<button
			id="background"
			class="absolute top-[40px] right-0 left-0 z-10 flex h-full w-full cursor-pointer items-center justify-center bg-black/30 backdrop-blur-sm"
			transition:fly
			onclick={handleBackgroundClick}
		>
			<div
				class="bg-background min-h-40 w-full cursor-default self-start p-4"
				transition:slide
			>
				{@render summary?.()}
			</div>
		</button>
	{/if}
</header>
