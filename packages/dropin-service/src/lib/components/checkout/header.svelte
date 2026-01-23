<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import { fade, fly, slide } from 'svelte/transition';
	import { toCurrency } from '$lib/utils/currency.js';
	import * as m from '$lib/paraglide/messages';
	import { clickOutside } from '$lib/directives/click-outside';
	import { getLuminance } from '$lib/utils/color-utils';

	/**
	 * @typedef {Object} HeaderContainerProps
	 * @property {number} itemsQuantity - The quantity of items in the cart
	 * @property {number} totalPrice - The total price of the cart
	 * @property {import('svelte').Snippet} summary - The summary component
	 * @property {import('svelte').Snippet} backButton - The back button component
	 * @property {string} className - The class name of the header container
	 * @property {boolean} showMiniOverview - Whether to show the mini overview with product image
	 * @property {string} productImage - The first product image URL
	 * @property {Object} colors - Theme colors
	 */

	/**
	 * @type {HeaderContainerProps}
	 */
	let {
		itemsQuantity,
		totalPrice,
		summary,
		backButton,
		class: className,
		showMiniOverview = false,
		productImage = '',
		colors = null
	} = $props();

	let headerStyles = $derived.by(() => {
		if (!colors?.background) return '';
		const isLight = getLuminance(colors.background) > 0.5;
		const textColor = isLight ? '#000000' : '#ffffff';
		const mutedColor = isLight
			? `color-mix(in srgb, ${colors.background} 0%, black 40%)`
			: `color-mix(in srgb, ${colors.background} 0%, white 60%)`;
		const borderColor = isLight
			? `color-mix(in srgb, ${colors.background} 0%, black 10%)`
			: `color-mix(in srgb, ${colors.background} 0%, white 30%)`;
		return `--color-background: ${colors.background}; --color-text: ${textColor}; --color-muted: ${mutedColor}; --color-border: ${borderColor}; --color-primary: ${colors.primary || '#333333'};`;
	});

	let isSummaryOpened = $state(false);
	let isSummaryVisible = $derived(isSummaryOpened && summary);

	export function openSummary() {
		isSummaryOpened = true;
	}

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
	class={[
		'bg-background flex h-12 items-center justify-between px-4 shadow',
		{ 'border-b-0': isSummaryVisible },
		className
	]}
	style={headerStyles}
	use:clickOutside={{ callback: toggleSummaryVisibility, active: isSummaryVisible }}
>
	{@render backButton?.()}
	<button
		onclick={toggleSummaryVisibility}
		class="text-muted flex w-1/2 cursor-pointer items-center justify-end gap-x-1.5"
	>
		{#if showMiniOverview && productImage && !isSummaryOpened}
			<div
				class="relative mr-2 size-7 rounded bg-gray-300 bg-cover shadow"
				style="background-image: url({productImage});"
				transition:fade={{ duration: 150 }}
			>
				<span
					class="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow"
				>
					{itemsQuantity > 0 ? itemsQuantity : '?'}
				</span>
			</div>
		{/if}
		<p class="text-xs lowercase">
			{#if isSummaryOpened}
				{m.close()}
			{:else if !showMiniOverview}
				{toCurrency(totalPrice)} ({itemsQuantity > 1
					? m.items({ qty: itemsQuantity })
					: m.item({ qty: itemsQuantity })})
			{:else}
				{toCurrency(totalPrice)}
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
			class="absolute inset-x-0 top-12 z-10 flex h-[calc(100vh-3rem)] w-full cursor-pointer items-start bg-black/30 backdrop-blur-sm"
			transition:fly
			onclick={handleBackgroundClick}
		>
			<div
				class="bg-background max-h-[calc(100vh-3rem)] min-h-40 w-full cursor-default overflow-y-auto p-4"
				style={headerStyles}
				transition:slide
			>
				{@render summary?.()}
			</div>
		</button>
	{/if}
</header>
