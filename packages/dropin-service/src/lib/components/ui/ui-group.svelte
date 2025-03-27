<script>
	/**
	 * @typedef {Object} UiGroupProps
	 * @property {import('svelte').Snippet} children - The content of the group
	 * @property {boolean} horizontal - Whether the group is horizontal
	 */

	/**
	 * @type {UiGroupProps}
	 */
	let { children, horizontal = false } = $props();
</script>

<div class="input-group" class:horizontal>
	{@render children?.()}
</div>

<style lang="postcss">
	@reference '../../../app.css';

	/* Base container styles */
	.input-group:not(.horizontal) {
		@apply bg-border grid grid-cols-1 flex-col gap-y-[1px] rounded-lg p-[1px];
	}

	.input-group.horizontal {
		@apply grid grid-cols-2 gap-x-[1px];
	}

	/* Common input styles */
	.input-group :global(> *) {
		@apply rounded-none border-none;
	}

	.input-group :global(> * > .input-container) {
		@apply rounded-none border-none;
	}

	.input-group :global(> :not(.horizontal)) {
		@apply bg-white;
	}

	/* Vertical mode - first and last inputs get rounded corners */
	.input-group:not(.horizontal) :global(> *:first-child) {
		@apply rounded-tl-lg rounded-tr-lg;
	}

	.input-group:not(.horizontal) :global(> *:last-child) {
		@apply rounded-br-lg rounded-bl-lg;
	}

	/* Special case for nested input groups */
	.input-group :global(> :last-child:is(.input-group) *:first-child) {
		@apply rounded-bl-lg;
	}

	.input-group :global(> :last-child:is(.input-group) *:last-child) {
		@apply rounded-br-lg;
	}
</style>
