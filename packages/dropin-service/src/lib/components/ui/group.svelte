<script>
	/**
	 * @typedef {Object} UiGroupProps
	 * @property {import('svelte').Snippet} children - The content of the group
	 * @property {boolean} horizontal - Whether the group is horizontal
	 * @property {string} class - Additional CSS classes
	 */

	/**
	 * @type {UiGroupProps}
	 */
	let { children, horizontal = false, class: className = '' } = $props();
</script>

<div class={['input-group', { horizontal }, className]}>
	{@render children?.()}
</div>

<style lang="postcss">
	@reference '../../../app.css';

	.input-group:not(.horizontal) {
		@apply grid grid-cols-1 flex-col gap-y-px rounded-lg border border-gray-300 bg-gray-300 p-0;
	}

	.input-group.horizontal {
		@apply grid grid-cols-2 gap-x-px bg-gray-300;
	}

	.input-group :global(> *) {
		@apply rounded-none border-none;
	}

	.input-group :global(> :not(.horizontal)) {
		@apply bg-white;
	}

	.input-group :global(.input-container) {
		border-radius: 0 !important;
		border: none !important;
		min-height: 2.75rem !important;
	}

	/* First child rounding - top corners */
	.input-group:not(.horizontal) :global(> .input-container:first-child),
	.input-group:not(.horizontal) :global(> *:first-child:not(.input-container) .input-container),
	.input-group:not(.horizontal)
		:global(> .input-group.horizontal:first-child .input-container:first-child) {
		border-top-left-radius: calc(0.5rem - 1px) !important;
	}

	.input-group:not(.horizontal) :global(> .input-container:first-child),
	.input-group:not(.horizontal) :global(> *:first-child:not(.input-container) .input-container),
	.input-group:not(.horizontal)
		:global(> .input-group.horizontal:first-child .input-container:last-child) {
		border-top-right-radius: calc(0.5rem - 1px) !important;
	}

	/* Last child rounding - bottom corners */
	.input-group:not(.horizontal) :global(> .input-container:last-child),
	.input-group:not(.horizontal)
		:global(> *:last-child:not(.input-container):not(.input-group) .input-container),
	.input-group:not(.horizontal)
		:global(> .input-group.horizontal:last-child .input-container:first-child) {
		border-bottom-left-radius: calc(0.5rem - 1px) !important;
	}

	.input-group:not(.horizontal) :global(> .input-container:last-child),
	.input-group:not(.horizontal)
		:global(> *:last-child:not(.input-container):not(.input-group) .input-container),
	.input-group:not(.horizontal)
		:global(> .input-group.horizontal:last-child .input-container:last-child) {
		border-bottom-right-radius: calc(0.5rem - 1px) !important;
	}

	/* Generic first/last child rounding for non-input-container elements */
	.input-group:not(.horizontal) :global(> *:first-child:not(.input-container):not(.input-group)) {
		border-top-left-radius: calc(0.5rem - 1px) !important;
		border-top-right-radius: calc(0.5rem - 1px) !important;
	}

	.input-group:not(.horizontal) :global(> *:last-child:not(.input-container):not(.input-group)) {
		border-bottom-left-radius: calc(0.5rem - 1px) !important;
		border-bottom-right-radius: calc(0.5rem - 1px) !important;
	}

	/* Single child gets all corners rounded */
	.input-group:not(.horizontal)
		:global(> *:first-child:last-child:not(.input-container):not(.input-group)) {
		border-radius: calc(0.5rem - 1px) !important;
	}
</style>
