<script>
	import { onMount } from 'svelte';
	import { trackError } from '$lib/services/telemetry.js';

	/**
	 * Wraps application content with error boundary and unhandled rejection tracking.
	 * Captures errors via Svelte's boundary and forwards them to telemetry.
	 * @typedef {Object} GlobalErrorHandlerProps
	 * @property {import('svelte').Snippet} children - Child content to wrap
	 */

	/** @type {GlobalErrorHandlerProps} */
	let { children } = $props();

	function handleError(error) {
		console.error('[GlobalErrorHandler]', error);
		trackError(error);
	}

	onMount(() => {
		window.onunhandledrejection = (event) => {
			console.error('[UnhandledRejection]', event.reason);
			trackError(event.reason);
		};
	});
</script>

<svelte:boundary onerror={handleError}>{@render children()}</svelte:boundary>
