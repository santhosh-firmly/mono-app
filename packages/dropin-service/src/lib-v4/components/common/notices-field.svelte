<script>
	// @ts-nocheck
	import { Close, itemsRemovedInfo } from '$lib-v4/browser/localization.js';
	import { slide } from 'svelte/transition';
	import { sCart } from '$lib-v4/browser/api-manager.js';

	export let header = '';
	export let detail = '';

	let outerDiv;
	let canBeShown = false;

	function onCloseClick() {
		canBeShown = false;
	}

	$: {
		if ($sCart?.notice?.includes('CART_ITEMS_REMOVED')) {
			canBeShown = true;
			detail = itemsRemovedInfo.detail;
			header = itemsRemovedInfo.header;
		} else {
			canBeShown = false;
		}
	}
</script>

{#if canBeShown}
	<div
		bind:this={outerDiv}
		class="relative flex flex-col justify-start gap-1 border-l-4 border-blue-900 bg-blue-100 px-2 py-2 text-xs text-blue-900"
		transition:slide
	>
		<div class="font-semibold">{header}</div>
		<div>{detail}</div>
		<div class="absolute top-1 right-1">
			<button class="text-errorb cursor-pointer hover:text-gray-900" on:click={onCloseClick}>
				{Close}
			</button>
		</div>
	</div>
{/if}
