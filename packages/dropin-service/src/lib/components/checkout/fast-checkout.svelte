<script>
	import * as m from '$lib/paraglide/messages';

	/**
	 * Fast checkout buttons component - displays express payment options
	 *
	 * @typedef {Object} FastButtonsProps
	 * @property {boolean} [isLoading] - Whether the buttons are in a loading/disabled state
	 * @property {(method: string) => void} [onclick] - Callback when a payment method is clicked
	 * @property {Array<'paypal'>} [use] - Array of payment methods to display
	 * @property {HTMLElement|null} [paypalButtonContainer] - Bindable ref for PayPal SDK button container
	 * @property {import('svelte').Snippet} [paypalButton] - Custom PayPal button snippet for Storybook
	 */

	/**
	 * @type {FastButtonsProps}
	 */
	let { use = ['paypal'], paypalButtonContainer = $bindable(null), paypalButton } = $props();
</script>

<div class="flex flex-col gap-4">
	{#if use.includes('paypal')}
		{#if paypalButton}
			{@render paypalButton()}
		{:else}
			<div bind:this={paypalButtonContainer} class="paypal-fast-checkout-container"></div>
		{/if}
	{/if}

	<div class="separator text-muted flex items-center text-center text-sm">
		{m.pay_another_way()}
	</div>
</div>

<style>
	.separator::before,
	.separator::after {
		content: '';
		flex: 1;
		border-bottom: 1px solid #ddd;
	}
	.separator::before {
		margin-right: 1rem;
	}
	.separator::after {
		margin-left: 1rem;
	}
</style>
