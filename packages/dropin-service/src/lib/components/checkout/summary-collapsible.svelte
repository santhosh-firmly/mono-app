<script>
	import { slide } from 'svelte/transition';
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} SummaryCollapsibleProps
	 * @property {import('svelte').Snippet} collapsibleContent - Content that animates when toggling
	 * @property {boolean} [expanded] - Whether the collapsible content is expanded
	 * @property {string} [class] - Additional CSS classes
	 */

	/**
	 * @type {SummaryCollapsibleProps}
	 */
	let { collapsibleContent, expanded = $bindable(false), class: className } = $props();
</script>

<div class={['flex flex-col gap-2', className]}>
	<button
		class="flex cursor-pointer items-center justify-between"
		onclick={() => (expanded = !expanded)}
	>
		<p class="text-md py-4 font-semibold">{m.order_summary()}</p>
		<div class="flex items-center gap-2 text-xs">
			{expanded ? m.hide() : m.show()}
			<Icon
				icon="mdi:chevron-down"
				class={['text-md transition-transform duration-400', expanded && 'rotate-180']}
			/>
		</div>
	</button>

	{#if expanded}
		<div transition:slide={{ duration: 300 }}>
			{@render collapsibleContent?.()}
		</div>
	{/if}
</div>
