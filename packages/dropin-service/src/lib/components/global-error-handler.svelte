<script>
	import { onMount } from 'svelte';
	import { trackError } from '$lib-v4/browser/telemetry';

	let { children } = $props();

	onMount(() => {
		window.onunhandledrejection = (event) => {
			trackError(event.reason);
		};
	});
</script>

<svelte:boundary onerror={trackError}>{@render children()}</svelte:boundary>
