<script>
	import '../app.css';
	import { theme } from '$lib/stores/theme.svelte.js';
	import { onMount, onDestroy } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	let { data, children } = $props();

	onMount(() => {
		// Initialize theme with saved preference
		theme.initialize(data.preferences?.theme);
	});

	onDestroy(() => {
		theme.destroy();
	});
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- inline script to prevent theme flash on page load -->
	{@html '<script>(function(){const s=localStorage.getItem("firmly-theme-preference");const p=s==="light"||s==="dark"||s==="system"?s:"system";const d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")})();</script>'}
</svelte:head>

<Tooltip.Provider>
	{@render children()}
</Tooltip.Provider>
