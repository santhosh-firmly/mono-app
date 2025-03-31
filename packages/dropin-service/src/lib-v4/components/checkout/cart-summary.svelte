<script>
	// @ts-nocheck
	import { getPrice } from '$lib-v4/browser/cart-helper.js';
	import { sCart } from '$lib-v4/browser/api-manager.js';
	import { OrderSummary } from '$lib-v4/browser/localization.js';
	import Chevron from '../common/chevron.svelte';
	import CartProducts from './cart-products.svelte';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { symModalKey } from '$lib-v4/browser/storage.js';
	import { getContext } from 'svelte';
	import { wizardReset } from '$lib-v4/browser/wizard.js';

	let isOpen = false;

	let lineItemsCount = 0;
	const modal = getContext(symModalKey);

	$: {
		if ($sCart?.line_items) {
			lineItemsCount = $sCart.line_items.length;
		}

		if (lineItemsCount === 0) {
			wizardReset();
			modal.close();
		}
	}
	function onClick(value) {
		isOpen = value;
	}

	function onClickHandler() {
		isOpen = !isOpen;
	}
</script>

<div class="bg-header flex flex-row items-center bg-gray-100 px-4 py-2 text-xs">
	<button
		class="text-high cursor-pointer font-medium"
		on:click={onClickHandler}
		data-testid="order-summary-toggle"
	>
		{OrderSummary(lineItemsCount)}
	</button>
	<Chevron {onClick} bind:isOpen class="stroke-high cursor-pointer" />
	<div class="grow text-end font-semibold" data-testid="cart-total">{getPrice($sCart.total)}</div>
</div>

{#if isOpen === true}
	<div
		transition:slide={{ delay: 10, duration: 200, easing: expoOut, axis: 'y' }}
		data-testid="cart-products-container"
	>
		<CartProducts />
	</div>
{/if}
