<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let collapsed = false;
	export let shortText: string;
	export let longText: string;
	export let checked: boolean = false;

	function handleToggle() {
		collapsed = !collapsed;
	}
</script>

<div class="flex flex-row gap-2 justify-start items-start text-xs text-secondary w-full">
	<label class="flex flex-row items-start">
		<input
			class="rounded m-1"
			type="checkbox"
			{checked}
			on:change={(...args) => dispatch('change', ...args)}
		/>
		<div class="flex flex-col m-1">
			<span class="text-primary">{shortText}</span>
			{#if !collapsed}
				<span class="text-secondary">{longText}</span>
			{/if}
		</div>
	</label>
	<div class="grow" />
	<button on:click={handleToggle} class="self-right p-[5px]">
		<svg
			class="w-3 h-3 text-blue-500 hover:ring-blue-200 dark:bg-blue-400 dark:hover:ring-blue-600 arrow {!collapsed
				? 'down'
				: ''}"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 10 6"
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m1 1 4 4 4-4"
			/>
		</svg>
	</button>
</div>

<style>
	.arrow {
		transition: all 0.3s ease;
	}

	.down {
		transform: rotateZ(-180deg);
	}
</style>
