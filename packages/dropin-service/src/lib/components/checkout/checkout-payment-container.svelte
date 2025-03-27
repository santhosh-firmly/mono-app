<script>
	import Icon from '@iconify/svelte';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} CheckoutPaymentContainerProps
	 * @property {import('svelte').Snippet} card - The card component
	 * @property {import('svelte').Snippet} paypal - The paypal component
	 */

	/**
	 * @type {CheckoutPaymentContainerProps}
	 */
	let { card, paypal } = $props();
	let selectedPaymentMethod = $state('card');
</script>

{#snippet Option({ icon, label, method, selected = false })}
	<button
		onclick={() => (selectedPaymentMethod = method)}
		class="flex w-[5rem] cursor-pointer flex-col items-start justify-start gap-1 rounded-lg border px-3 py-2 text-xs
		{selected
			? 'border-primary'
			: 'border-gray-400 opacity-50 transition-all hover:border-gray-500 hover:opacity-100 hover:shadow-md'}"
	>
		<Icon {icon} class="text-sm" />
		<p>{label}</p>
	</button>
{/snippet}

<div class="flex flex-col gap-1">
	<div class="flex flex-col gap-6">
		<div class="flex gap-2">
			{@render Option({
				icon: 'mdi:credit-card',
				label: 'Card',
				method: 'card',
				selected: selectedPaymentMethod === 'card'
			})}
			{@render Option({
				icon: 'logos:paypal',
				label: 'PayPal',
				method: 'paypal',
				selected: selectedPaymentMethod === 'paypal'
			})}
		</div>

		{#if selectedPaymentMethod === 'card'}
			{@render card?.()}
		{:else}
			<div in:slide out:slide={{ duration: 200 }}>
				{@render paypal?.()}
			</div>
		{/if}
	</div>
</div>
