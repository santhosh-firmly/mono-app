<script>
	// @ts-nocheck
	import PaymentTabCreditCard from './payment-tab-credit-card.svelte';
	import PaymentTabCreditCardContent from './payment-tab-credit-card-content.svelte';
	import PaymentTabCreditPaypal from './payment-tab-paypal.svelte';
	import PaymentTabPaypalContent from './payment-tab-paypal-content.svelte';

	// Payment method constants
	const PAYMENT_METHODS = {
		CREDIT_CARD: 'CreditCard',
		PAYPAL: 'PayPal',
		SHOP_PAY: 'ShopPay'
	};

	const supportedPaymentMethods = {
		[PAYMENT_METHODS.CREDIT_CARD]: {
			tab: PaymentTabCreditCard,
			content: PaymentTabCreditCardContent
		},
		[PAYMENT_METHODS.PAYPAL]: {
			tab: PaymentTabCreditPaypal,
			content: PaymentTabPaypalContent
		}
		// [PAYMENT_METHODS.SHOP_PAY]: {
		// 	// TODO: Add content for ShopPay
		// 	tab: PaymentTabCreditShoppay,
		// 	content: PaymentTabCreditCardContent,
		// }
	};

	export let allowedPaymentMethods = [
		PAYMENT_METHODS.CREDIT_CARD,
		PAYMENT_METHODS.PAYPAL,
		PAYMENT_METHODS.SHOP_PAY
	];

	let paymentMethods = [];

	export let selectedPaymentMethod;
	export let selectedCardOption;
	export let validateCreditCard;
	export let paypalPayerId;
	export let onPaypalHandler = () => {};

	export let shouldTryFocusOnPaymentTab;
	export let disabled = false;
	export let paypalConnected = false;

	export let isBillingSameShipping;

	/**
	 * Function returned by this component that retrieves the billing info
	 */
	export let getBillingInfo;

	$: {
		paymentMethods = Object.keys(supportedPaymentMethods).filter((s) =>
			allowedPaymentMethods.includes(s)
		);
		// Don't override PayPal selection if PayPal is connected
		if (!selectedPaymentMethod && !paypalConnected && paymentMethods.length > 0) {
			selectedPaymentMethod = paymentMethods[0];
		}
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
				on:not-your-cards
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
				bind:paypalPayerId
				connected={paypalConnected}
				{onPaypalHandler}
				on:not-your-cards
				{...$$restProps}
			/>
		</div>
	{/if}
</div>
