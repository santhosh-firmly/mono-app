<script>
	/**
	 * @typedef {Object} UiAlertProps
	 * @property {import('svelte').Snippet} children - The content of the alert
	 */

	/**
	 * @type {UiAlertProps}
	 */
	let { children } = $props();
</script>

<div class="rounded-lg bg-gray-100 p-2 text-gray-500">
	<p class="text-sm">
		{@render children?.()}
	</p>
</div>

<style scoped lang="postcss">
	@reference '../../../app.css';

	p :global(b) {
		@apply text-gray-600;
	}
</style>
