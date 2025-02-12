<script>
	// @ts-nocheck

	/**
	 * @typedef {Object} PaymentTabProps
	 * @property {string} text - The text to display
	 * @property {boolean} active - Whether the tab is active
	 * @property {boolean} disabled - Whether the tab is disabled
	 * @property {Snippet} children - Default content slot snippet
	 */
	/**
	 * @type {PaymentTabProps}
	 */
	let { text, active, disabled, children } = $props();
</script>

<button
	type="button"
	class="w-20 min-w-[80px] py-2 px-3 border rounded-lg bg-fy-surface border-fy-on-surface hover:opacity-100 hover:shadow-lg flex flex-col justify-between"
	class:shadow-lg={active}
	class:opacity-50={!active}
	{disabled}
>
	{@render children?.()}
	<span class="pt-1 leading-none text-left text-xs text-fy-on-surface">{text}</span>
</button>
