<script>
	/**
	 * @typedef {Object} UiAlertProps
	 * @property {import('svelte').Snippet} children - The content of the alert
	 * @property {boolean} raw - Whether to render content without the p wrapper
	 */

	/**
	 * @type {UiAlertProps}
	 */
	let { children, raw = false } = $props();
</script>

<div class="rounded-lg bg-gray-100 p-2 text-gray-500">
	{#if raw}
		{@render children?.()}
	{:else}
		<p class="text-sm">
			{@render children?.()}
		</p>
	{/if}
</div>

<style scoped lang="postcss">
	@reference '../../../app.css';

	p :global(b) {
		@apply text-gray-600;
	}
</style>
