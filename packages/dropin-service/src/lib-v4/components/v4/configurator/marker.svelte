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

<div class="flex flex-none items-start {className}">
	<div class="ml-[-2px] flex flex-col items-center">
		<div
			bind:this={markerRef}
			class="h-14 w-px {active ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-slate-800'}"
		/>
		<div
			class="mt-[3px] h-[5px] w-[5px] rounded-full shadow-sm ring-1 {active
				? 'bg-indigo-600 ring-indigo-600'
				: 'bg-white ring-slate-500/[0.15] dark:bg-slate-900 dark:ring-slate-700'}"
		/>
	</div>
	<button
		class="ml-1.5 rounded px-1.5 font-mono text-[0.625rem] leading-6 ring-1 ring-inset dark:ring-0 {active
			? 'dark:highlight-white/10 bg-indigo-50 text-indigo-600 ring-indigo-600 dark:bg-indigo-500 dark:text-white'
			: 'dark:highlight-white/5 bg-slate-100 ring-slate-100 dark:bg-slate-800 dark:text-white/50'}"
		on:click
	>
		{label}
	</button>
</div>
