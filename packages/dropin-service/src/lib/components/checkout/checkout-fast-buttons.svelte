<script>
	import * as m from '$lib/paraglide/messages';
	import UiIconPaypal from '$lib/components/icon/icon-paypal.svelte';
	import UiButton from '$lib/components/ui/ui-button.svelte';
	import UiIconShoppay from '$lib/components/icon/icon-shoppay.svelte';

	/**
	 * @typedef {Object} CheckoutFastButtonsProps
	 * @property {boolean} isLoading
	 * @property {Function} onclick
	 * @property {Array<string>} use
	 */

	/**
	 * @type {CheckoutFastButtonsProps}
	 */
	let { isLoading = false, onclick = () => {}, use = ['shoppay', 'paypal'] } = $props();
</script>

<div class="flex flex-col gap-4">
	{#if use.includes('shoppay')}
		<UiButton color="#5b31f4" disabled={isLoading} onclick={() => onclick('shoppay')}>
			<UiIconShoppay class="h-6 w-20 fill-white" />
		</UiButton>
	{/if}

	{#if use.includes('paypal')}
		<UiButton color="#ffc439" disabled={isLoading} onclick={() => onclick('paypal')}>
			<UiIconPaypal />
		</UiButton>
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
