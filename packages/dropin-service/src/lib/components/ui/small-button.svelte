<script>
	/**
	 * @typedef {Object} UiSmallButtonProps
	 * @property {Function} onclick - The onclick of the button
	 * @property {import('svelte').Snippet} children - The content of the button
	 */

	/**
	 * @type {UiSmallButtonProps}
	 */
	let { onclick, children } = $props();
</script>

<button
	{onclick}
	class="cursor-pointer rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
>
	{@render children?.()}
</button>
