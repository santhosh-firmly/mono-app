<script>
	/**
	 * Summary Wrapper - Pure composition component for order summary layout
	 *
	 * This component only handles layout composition via snippets.
	 * All content (price, line items, promocode, resume) is provided by the parent.
	 */

	/**
	 * @typedef {Object} SummaryWrapperProps
	 * @property {import('svelte').Snippet} [price] - The snippet to render the price display (SummaryPrice)
	 * @property {import('svelte').Snippet} [lineItems] - The snippet to render line items
	 * @property {import('svelte').Snippet} [promocode] - The snippet to render the promocode (SummaryPromocode)
	 * @property {import('svelte').Snippet} [resume] - The snippet to render the price breakdown (SummaryResume)
	 */

	/**
	 * @type {SummaryWrapperProps}
	 */
	let { price, lineItems, promocode, resume } = $props();
</script>

<div class="flex flex-col gap-y-4 text-start">
	{@render price?.()}
	{@render lineItems?.()}
	{@render promocode?.()}
	{@render resume?.()}
</div>
