<script>
	// @ts-nocheck
	import { symModalKey } from '$lib/browser/storage.js';
	import { wizardReset } from '$lib/browser/wizard.js';
	import { getContext } from 'svelte';

	/**
	 * @type {any}
	 */
	export let title;
	export let logo = null;

	const modal = getContext(symModalKey);

	function onClickHandler(event) {
		wizardReset();
		modal.close(event);
	}

	// This function is primarily to handle the issue on the Safari Browser.
	// Chrome supports the ill-formed the srcset, whereas Safari doesn't support the ill-formed the srcset or if the quotes are present.
	function getProcessedSrcset(srcset) {
		const splitbycomma = srcset.split(',');
		const arr = [];
		for (const iterator of splitbycomma) {
			const splitbyspace = iterator.trim().split(' ');
			if (splitbyspace.length == 2) {
				arr.push(`'${splitbyspace[0]}' ${splitbyspace[1]}`);
			}
		}
		const ret = arr.join(', ');
		return ret;
	}

	let logoStyle = null;
	let customLogoBG = null;
	if (logo) {
		const ls = [];
		if (logo.src) {
			ls.push("background-image: url('" + logo.src + "')");
		}
		if (logo.srcset) {
			ls.push('background-image: image-set(' + getProcessedSrcset(logo.srcset) + ')');
		}

		if (logo.width && logo.height) {
			ls.push(`width:${logo.width};height:${logo.height}`);
		}

		if (logo.logoBGColor) {
			customLogoBG = logo.logoBGColor;
		}

		if (ls.length > 0) {
			logoStyle = ls.join(';');
		}
	}
</script>

<div
	id="header"
	class="relative flex h-12 {!customLogoBG ? 'bg-fuchsia-100' : ''} shadow-lg"
	style:background-color={customLogoBG ? customLogoBG : ''}
>
	{#if logoStyle != null}
		<div class="flex grow justify-center items-center h-12">
			<div
				class="w-full h-full bg-contain bg-center bg-no-repeat bg-origin-content aspect-square py-0.5"
				style={logoStyle}
			/>
		</div>
	{:else}
		<h2 class="flex grow text-sm font-bold justify-center items-center h-12">{title}</h2>
	{/if}

	<div class="absolute right-0 top-2">
		<button class="hover:text-gray-900 text-gray-500" on:click={onClickHandler}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				width="32"
				height="32"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
</div>
