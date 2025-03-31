<script>
	// @ts-nocheck
	import { Change } from '$lib-v4/browser/localization.js';
	import Chevron from './chevron.svelte';

	export let header = '';
	export let detail = null;

	export let isChange = false;
	export let onChangeClick = () => {};

	export let isChevron = false;
	export let onChevronClick = () => {};
	export let isChevronOpen = false;
</script>

<div class="mt-3 flex h-10 flex-row px-4">
	<div
		class="flex items-center justify-start text-sm font-semibold {isChange || isChevron
			? 'basis-1/2'
			: ''}"
	>
		{header}
	</div>
	{#if isChange}
		<button
			class="text-high flex basis-1/2 cursor-pointer items-center justify-end text-xs font-medium"
			on:click={onChangeClick}
		>
			{Change}
		</button>
	{:else if isChevron}
		<div class="flex basis-1/2 items-center justify-end">
			<Chevron
				onClick={onChevronClick}
				bind:isOpen={isChevronOpen}
				class="stroke-high cursor-pointer"
			/>
		</div>
	{/if}
</div>
{#if detail}
	<span class="flex py-1 pl-4 text-xs italic">{detail}</span>
{/if}
