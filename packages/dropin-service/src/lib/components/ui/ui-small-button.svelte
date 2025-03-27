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
	class="cursor-pointer rounded-xl border border-gray-200 bg-white px-2 py-1 text-xs font-bold shadow transition-colors hover:bg-gray-100"
>
	{@render children?.()}
</button>
