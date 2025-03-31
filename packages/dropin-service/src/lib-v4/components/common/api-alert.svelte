<script>
	// @ts-nocheck
	import { slide } from 'svelte/transition';
	import { Close, ErrorDefault, ErrorTransferCart } from '$lib-v4/browser/localization.js';
	import { sApiError } from '$lib-v4/browser/api-manager.js';

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
		class="text-errort bg-error border-errorb relative flex flex-col justify-start gap-1 border-l-4 px-2 py-2 text-xs"
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
