<script>
	// @ts-nocheck
	import PaymentTabCreditCard from './payment-tab-credit-card.svelte';
	import PaymentTabCreditCardContent from './payment-tab-credit-card-content.svelte';
	import PaymentTabCreditPaypal from '$lib/components/payments/paypal/payment-tab-paypal.svelte';
	import PaymentTabPaypalContent from '$lib/components/payments/paypal/payment-tab-paypal-content.svelte';

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


	/**
	 * @typedef {Object} PaymentTabsProps
	 * @property {string[]} allowedPaymentMethods - The allowed payment methods
	 * @property {string} cvvConfirmationValue - The value of the CVV confirmation
	 * @property {boolean} isCvvRequired - Whether the CVV is required
	 * @property {string} selectedCardOption - The selected card option
	 * @property {Function} validateCreditCard - The function to validate the credit card
	 * @property {boolean} shouldTryFocusOnPaymentTab - Whether the component should try to focus on the payment tab
	 * @property {boolean} disabled - Whether the component is disabled
	 * @property {boolean} isBillingSameShipping - Whether the billing address is the same as the shipping address
	 * @property {Function} getBillingInfo - Function returned by this component that retrieves the billing info
	 */
	/**
	 * @type {PaymentTabsProps}
	 */
	let { allowedPaymentMethods = ['CreditCard', 'PayPal', 'ShopPay'], cvvConfirmationValue, isCvvRequired, validateCreditCard, shouldTryFocusOnPaymentTab, disabled = false, isBillingSameShipping, getBillingInfo } = $props();

	// export let selectedPaymentMethod;
	// let paymentMethods = [];

	// $: {
	// 	paymentMethods = Object.keys(supportedPaymentMethods).filter((s) =>
	// 		allowedPaymentMethods.includes(s)
	// 	);
	// 	selectedPaymentMethod = selectedPaymentMethod || paymentMethods[0];
	// }

	let paymentMethods = $state(Object.keys(supportedPaymentMethods).filter((s) =>
			allowedPaymentMethods.includes(s)
		));

	let selectedPaymentMethod = $state(paymentMethods[0]);
	let selectedCardOption = $state('');
</script>

<div class="py-2">
	<div class="flex flex-row gap-3 py-2" class:hidden={paymentMethods?.length === 1}>
		{#each paymentMethods as paymentMethod}
			<!-- {#key paymentMethod} -->
				{@const TabComponent = supportedPaymentMethods[paymentMethod].tab}
				<TabComponent
					active={selectedPaymentMethod === paymentMethod}
					{disabled}
					on:click={() => {
						selectedPaymentMethod = paymentMethod;
					}}
				/>
			<!-- {/key} -->
		{/each}
	</div>
	{@render underTabs()}
	{#if supportedPaymentMethods[selectedPaymentMethod]?.content}
		{@const ContentComponent = supportedPaymentMethods[selectedPaymentMethod].content}
		<div class="py-2">
			<ContentComponent
				{disabled}
				{shouldTryFocusOnPaymentTab}
				{isCvvRequired}
				bind:cvvConfirmationValue
				bind:selectedCardOption
				bind:validateCreditCard
				bind:isBillingSameShipping
				bind:getBillingInfo
			/>
		</div>
	{/if}
</div>
