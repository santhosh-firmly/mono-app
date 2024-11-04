<script>
	// @ts-nocheck
	import { Change } from '$lib/browser/localization.js';
	import Chevron from './chevron.svelte';

	export let header = '';
	export let detail = null;

	export let isChange = false;
	export let onChangeClick = () => {};

	export let isChevron = false;
	export let onChevronClick = () => {};
	export let isChevronOpen = false;
</script>

<div class="flex flex-row h-10 mt-3 px-4">
	<div
		class="flex text-sm font-semibold justify-start items-center {isChange || isChevron
			? 'basis-1/2'
			: ''}"
	>
		{header}
	</div>
	{#if isChange}
		<button
			class="flex basis-1/2 text-xs font-medium justify-end items-center text-high cursor-pointer"
			on:click={onChangeClick}
		>
			{Change}
		</button>
	{:else if isChevron}
		<div class="flex basis-1/2 justify-end items-center">
			<Chevron
				onClick={onChevronClick}
				bind:isOpen={isChevronOpen}
				class="stroke-high cursor-pointer"
			/>
		</div>
	{/if}
</div>
{#if detail}
	<span class="flex pl-4 py-1 text-xs italic">{detail}</span>
{/if}
