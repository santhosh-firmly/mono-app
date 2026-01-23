<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import * as m from '$lib/paraglide/messages';
	import { fly } from 'svelte/transition';

	/**
	 * @typedef {'card' | 'paypal'} PaymentMethod
	 */

	/**
	 * @typedef {Object} PaymentOptionSwitchProps
	 * @property {import('svelte').Snippet} card - The card payment form snippet
	 * @property {import('svelte').Snippet} paypalOption - The PayPal payment form snippet
	 * @property {PaymentMethod} [selectedMethod='card'] - The currently selected payment method
	 * @property {(method: PaymentMethod) => void} [onMethodChange] - Callback when payment method changes
	 * @property {boolean} [showPaypal=true] - Whether to show PayPal option
	 */

	/** @type {PaymentOptionSwitchProps} */
	let {
		card,
		paypalOption,
		selectedMethod = 'card',
		onMethodChange = () => {},
		showPaypal = true
	} = $props();

	let containerHeight = $state(0);
	let enableTransition = $state(false);

	let slideDirection = $derived(selectedMethod === 'paypal' ? 1 : -1);

	function updateHeight(node) {
		containerHeight = node.offsetHeight;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerHeight = entry.contentRect.height;
			}
		});
		observer.observe(node);

		requestAnimationFrame(() => {
			enableTransition = true;
		});

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}
</script>

{#snippet Option({ icon, label, method, selected = false })}
	<button
		onclick={() => onMethodChange(method)}
		class="flex min-w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors duration-200
		{selected
			? 'border-primary bg-primary/5'
			: 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}"
	>
		<Icon {icon} class="text-base" />
		<p class="font-medium {selected ? 'text-gray-900' : 'text-gray-600'}">{label}</p>
	</button>
{/snippet}

<div class="flex flex-col gap-1">
	<div class="flex flex-col gap-6">
		<div class="flex gap-2">
			{@render Option({
				icon: 'mdi:credit-card',
				label: m.card(),
				method: 'card',
				selected: selectedMethod === 'card'
			})}
			{#if showPaypal}
				{@render Option({
					icon: 'logos:paypal',
					label: 'PayPal',
					method: 'paypal',
					selected: selectedMethod === 'paypal'
				})}
			{/if}
		</div>

		<div
			class={[
				'relative -mx-4 overflow-x-clip px-4',
				enableTransition && 'transition-[height] duration-300 ease-out'
			]}
			style="height: {containerHeight}px;"
		>
			{#key selectedMethod}
				<div
					in:fly={{ x: slideDirection * 100, duration: 250, delay: 250 }}
					out:fly={{ x: slideDirection * -100, duration: 250 }}
					class="absolute w-[calc(100%-2rem)]"
					use:updateHeight
				>
					{#if selectedMethod === 'card'}
						{@render card?.()}
					{:else if selectedMethod === 'paypal'}
						{@render paypalOption?.()}
					{/if}
				</div>
			{/key}
		</div>
	</div>
</div>
