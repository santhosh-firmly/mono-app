<script>
	import { onMount } from 'svelte';
	import { telemetryDropinError } from '$lib-v4/browser/api-firmly.js';

	let { children } = $props();

	onMount(() => {
		window.onunhandledrejection = (event) => {
			telemetryDropinError(event.reason);
		};
	});
</script>

<svelte:boundary onerror={telemetryDropinError}>{@render children()}</svelte:boundary>
