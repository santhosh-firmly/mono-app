<script>
	import Icon from '$lib/components/ui/icons/icon.svelte';
	import UiIconPaypal from '$lib/components/ui/icons/icon-paypal.svelte';
	import * as m from '$lib/paraglide/messages';

	/**
	 * @typedef {Object} CheckoutPaymentPaypalProps
	 * @property {boolean} [connected] - Whether PayPal is connected/authorized
	 * @property {HTMLElement|null} [buttonContainer] - Bindable ref for PayPal SDK button container
	 * @property {import('svelte').Snippet} [paypalButton] - Custom PayPal button snippet for Storybook
	 */

	/**
	 * @type {CheckoutPaymentPaypalProps}
	 */
	let { connected = false, buttonContainer = $bindable(null), paypalButton } = $props();
</script>

<div class="flex flex-col gap-6 rounded-lg border border-gray-300 p-6">
	<div class="text-muted flex flex-col gap-2 border-b border-gray-200 pb-2">
		<UiIconPaypal class="w-14" />
		<h3 class="text-xs">{m.paypal_selected()}</h3>
	</div>
	{#if connected}
		<div class="flex w-full flex-row items-center justify-between">
			<span class="text-sm">{m.paypal_connected()}</span>
		</div>
	{:else}
		<span class="flex items-center gap-4">
			<Icon icon="mdi:open-in-new" class="text-muted size-6 shrink-0" />
			<p class="text-muted text-xs">
				{m.paypal_redirect()}
			</p>
		</span>
		{#if paypalButton}
			{@render paypalButton()}
		{:else}
			<div bind:this={buttonContainer} class="paypal-payment-container"></div>
		{/if}
	{/if}
</div>
