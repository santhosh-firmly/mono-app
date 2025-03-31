<script>
	// @ts-nocheck

	import { Next, PlaceOrder, Return } from '$lib-v4/browser/localization.js';
	import {
		sIsNavBottomVisible,
		sIsNavPlaceOrder,
		sNavBackHandler,
		sNavNextHandler
	} from '$lib-v4/browser/storage.js';

	import { wizardBack, wizardNext } from '$lib-v4/browser/wizard.js';
	import Button from './button.svelte';
	import ChevronLeftIcon from './svg/chevron-left-icon.svelte';
	import PlaceOrderIcon from './svg/place-order-icon.svelte';

	export let backHandler = (event) => {
		if ($sNavBackHandler) {
			$sNavBackHandler(event);
		} else {
			wizardBack();
		}
	};

	export let nextHandler = (event) => {
		if ($sNavNextHandler) {
			$sNavNextHandler(event);
		} else {
			wizardNext();
		}
	};
</script>

{#if $sIsNavBottomVisible}
	<div class="mt-5 mb-5 flex flex-row px-4">
		<button
			class="text-high flex basis-1/3 cursor-pointer items-center justify-start text-xs"
			on:click={backHandler}
		>
			<ChevronLeftIcon />
			{Return}
		</button>
		<div class="flex basis-2/3 justify-end">
			{#if $sIsNavPlaceOrder}
				<Button on:click={nextHandler}><PlaceOrderIcon /> {PlaceOrder}</Button>
			{:else}
				<Button on:click={nextHandler}>{Next}</Button>
			{/if}
		</div>
	</div>
{/if}
