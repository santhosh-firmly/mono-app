<script>
	/**
	 * @typedef {Object} FullscreenLayoutProps
	 * @property {import('svelte').Snippet} [children] - Layout content
	 */

	/** @type {FullscreenLayoutProps} */
	let { children } = $props();
</script>

<div class="bg-background fixed inset-0 z-40 flex size-full overflow-scroll">
	{@render children?.()}
</div>
