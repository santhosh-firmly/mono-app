<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	export let label = '';
	export let className = '';
	export let width = 0;

	let markerRef;
	let markerOffset;

	let active = false;

	onMount(() => {
		markerOffset = markerRef.getBoundingClientRect().x;
	});

	$: {
		active = width >= markerOffset;
	}
</script>

<div class="flex items-start flex-none {className}">
	<div class="flex flex-col items-center ml-[-2px]">
		<div
			bind:this={markerRef}
			class="w-px h-14 {active ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}"
		/>
		<div
			class="mt-[3px] w-[5px] h-[5px] shadow-sm rounded-full ring-1 {active
				? 'bg-indigo-600 ring-indigo-600'
				: 'bg-white ring-slate-500/[0.15] dark:bg-slate-900 dark:ring-slate-700'}"
		/>
	</div>
	<button
		class="ml-1.5 rounded font-mono text-[0.625rem] leading-6 px-1.5 ring-1 ring-inset dark:ring-0 {active
			? 'bg-indigo-50 text-indigo-600 ring-indigo-600 dark:bg-indigo-500 dark:text-white dark:highlight-white/10'
			: 'bg-slate-100 ring-slate-100 dark:bg-slate-800 dark:text-white/50 dark:highlight-white/5'}"
		on:click
	>
		{label}
	</button>
</div>
