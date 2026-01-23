<script>
	/**
	 * Shipping - Pure composition component for shipping section layout
	 *
	 * This component only handles layout composition via snippets.
	 * All content (email, address, methods) is provided by the parent.
	 */

	/**
	 * @typedef {Object} ShippingProps
	 * @property {import('svelte').Snippet} [email] - The snippet to render the email section (ShippingEmail)
	 * @property {import('svelte').Snippet} [address] - The snippet to render the address section (ShippingAddress)
	 * @property {import('svelte').Snippet} [methods] - The snippet to render the methods section (ShippingMethods)
	 */

	/**
	 * @type {ShippingProps}
	 */
	let { email, address, methods } = $props();
</script>

<div class="flex flex-col gap-4">
	{@render email?.()}
	{@render address?.()}
	{@render methods?.()}
</div>
