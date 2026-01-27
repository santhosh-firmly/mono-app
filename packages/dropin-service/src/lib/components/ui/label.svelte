<script>
	/**
	 * @typedef {Object} UiLabelProps
	 * @property {string} label - The label of the label
	 * @property {import('svelte').Snippet} children - The content of the label
	 * @property {string} errorMessage - The error message of the label
	 */

	/**
	 * @type {UiLabelProps}
	 */
	let { label, children, errorMessage } = $props();
</script>

<div class="flex flex-col gap-1.5">
	<span class="text-sm font-medium text-gray-700">{label}</span>
	{@render children?.()}
	{#if errorMessage}
		<span class="text-danger text-xs">{errorMessage}</span>
	{/if}
</div>
