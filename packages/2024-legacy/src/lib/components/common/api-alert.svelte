<script>
	// @ts-nocheck
	import { slide } from 'svelte/transition';
	import { Close, ErrorDefault, ErrorTransferCart } from '$lib/browser/localization.js';
	import { sApiError } from '$lib/browser/api-manager.js';

	export let header = '';
	export let detail = '';

	let outerDiv;
	function onCloseClick() {
		sApiError.set(null);
	}
	let canBeShown = false;
	$: {
		if ($sApiError && $sApiError.code) {
			canBeShown = true;
			detail = $sApiError.description;
			switch ($sApiError.error) {
				case 'CartNotFound':
					header = ErrorTransferCart.header;
					break;
				default:
					header = ErrorDefault.header;
					break;
			}
		} else {
			canBeShown = false;
		}
	}
</script>

{#if canBeShown}
	<div
		bind:this={outerDiv}
		class="relative flex flex-col justify-start gap-1 text-xs text-errort bg-error py-2 px-2 border-l-4 border-errorb"
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
