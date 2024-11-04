<script>
	// @ts-nocheck
	import { getPrice } from '$lib/browser/cart-helper.js';
	import { sCart } from '$lib/browser/api-manager.js';
	import { OrderSummary } from '$lib/browser/localization.js';
	import Chevron from '../common/chevron.svelte';
	import CartProducts from './cart-products.svelte';
	import { slide } from 'svelte/transition';
	import { expoOut } from 'svelte/easing';
	import { symModalKey } from '$lib/browser/storage.js';
	import { getContext } from 'svelte';
	import { wizardReset } from '$lib/browser/wizard.js';

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

<div class="flex flex-row bg-header items-center text-xs py-2 px-4 bg-gray-100">
	<button class="text-high font-medium cursor-pointer" on:click={onClickHandler}>
		{OrderSummary(lineItemsCount)}
	</button>
	<Chevron {onClick} bind:isOpen class="stroke-high cursor-pointer" />
	<div class="grow font-semibold text-end">{getPrice($sCart.total)}</div>
</div>

{#if isOpen === true}
	<div transition:slide={{ delay: 10, duration: 200, easing: expoOut, axis: 'y' }}>
		<CartProducts />
	</div>
{/if}
