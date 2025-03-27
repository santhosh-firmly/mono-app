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

<div class="flex flex-col gap-1 text-sm">
	{label}
	{@render children?.()}
	<span class="text-danger">{errorMessage}</span>
</div>
