<script>
	// @ts-nocheck
	import { Close, itemsRemovedInfo } from '$lib/browser/localization.js';
	import { slide } from 'svelte/transition';
	import { sCart } from '$lib/browser/api-manager.js';

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
		class="relative flex flex-col justify-start gap-1 text-xs text-blue-900 bg-blue-100 py-2 px-2 border-l-4 border-blue-900"
		transition:slide
	>
		<div class="font-semibold">{header}</div>
		<div>{detail}</div>
		<div class="absolute right-1 top-1">
			<button class="hover:text-gray-900 text-errorb cursor-pointer" on:click={onCloseClick}>
				{Close}
			</button>
		</div>
	</div>
{/if}
