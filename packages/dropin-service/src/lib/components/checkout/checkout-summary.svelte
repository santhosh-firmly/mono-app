<script>
	import Icon from '@iconify/svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CheckoutSummaryProps
	 * @property {Function} summary - The function to render the summary
	 * @property {import('svelte').Snippet} hiddenLineItems - Whether the line items are hidden
	 * @property {string} className - The class name of the summary
	 */

	/**
	 * @type {CheckoutSummaryProps}
	 */
	let { summary, hiddenLineItems = $bindable(true), class: className } = $props();
</script>

<div class="flex flex-col gap-2 {className}">
	<button
		class="flex cursor-pointer items-center justify-between"
		onclick={() => (hiddenLineItems = !hiddenLineItems)}
	>
		<p class="text-md py-4 font-semibold">{m.order_summary()}</p>
		<div class="flex items-center gap-2 text-xs">
			{hiddenLineItems ? 'Show' : 'Hide'}
			<Icon
				icon="mdi:chevron-down"
				class="{!hiddenLineItems ? 'rotate-180' : ''} text-md transition-transform duration-400"
			/>
		</div>
	</button>

	{@render summary(hiddenLineItems)}
</div>
