<script>
	// @ts-nocheck
	import PaymentTabCreditCard from './payment-tab-credit-card.svelte';
	import PaymentTabCreditCardContent from './payment-tab-credit-card-content.svelte';
	import PaymentTabCreditPaypal from './payment-tab-paypal.svelte';
	import PaymentTabPaypalContent from './payment-tab-paypal-content.svelte';

	const supportedPaymentMethods = {
		CreditCard: {
			tab: PaymentTabCreditCard,
			content: PaymentTabCreditCardContent
		},
		PayPal: {
			tab: PaymentTabCreditPaypal,
			content: PaymentTabPaypalContent
		}
		// ShopPay: {
		// 	// TODO: Add content for ShopPay
		// 	tab: PaymentTabCreditShoppay,
		// 	content: PaymentTabCreditCardContent,
		// }
	};

	export let allowedPaymentMethods = ['CreditCard', 'PayPal', 'ShopPay'];

	let paymentMethods = [];
	export let selectedPaymentMethod;
	export let selectedCardOption;
	export let validateCreditCard;

	export let shouldTryFocusOnPaymentTab;
	export let disabled = false;

	export let isBillingSameShipping;

	/**
	 * Function returned by this component that retrieves the billing info
	 */
	export let getBillingInfo;

	$: {
		paymentMethods = Object.keys(supportedPaymentMethods).filter((s) =>
			allowedPaymentMethods.includes(s)
		);
		selectedPaymentMethod = selectedPaymentMethod || paymentMethods[0];
	}
</script>

<div class="py-2">
	<div class="flex flex-row gap-3 py-2" class:hidden={paymentMethods?.length === 1}>
		{#each paymentMethods as paymentMethod}
			<svelte:component
				this={supportedPaymentMethods[paymentMethod].tab}
				active={selectedPaymentMethod === paymentMethod}
				{disabled}
				on:click={() => {
					selectedPaymentMethod = paymentMethod;
				}}
			/>
		{/each}
	</div>
	<slot name="under-tabs" />
	{#if supportedPaymentMethods[selectedPaymentMethod]?.content}
		<div class="py-2">
			<svelte:component
				this={supportedPaymentMethods[selectedPaymentMethod]?.content}
				{disabled}
				{shouldTryFocusOnPaymentTab}
				bind:selectedCardOption
				bind:validateCreditCard
				bind:isBillingSameShipping
				bind:getBillingInfo
				{...$$restProps}
			/>
		</div>
	{/if}
</div>
