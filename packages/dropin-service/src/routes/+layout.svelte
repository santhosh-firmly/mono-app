<script>
	import GlobalErrorHandler from '$lib/components/global-error-handler.svelte';
	let { children } = $props();
</script>

<GlobalErrorHandler>
	{@render children()}
</GlobalErrorHandler>
