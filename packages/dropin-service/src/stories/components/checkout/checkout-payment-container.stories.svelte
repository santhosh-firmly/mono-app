<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import CheckoutPaymentContainer from '$lib/components/checkout/checkout-payment-container.svelte';
	import CheckoutPaymentPaypal from '$lib/components/checkout/checkout-payment-paypal.svelte';
	import CheckoutPaymentForm from '$lib/components/checkout/checkout-payment-form.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Payment/Container',
		component: CheckoutPaymentContainer,
		parameters: {
			layout: 'centered'
		},
		args: {
			useBillingAsShipping: false
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[380px]">
		<CheckoutPaymentContainer {...args}>
			{#snippet card()}
				<CheckoutPaymentForm />
			{/snippet}ˇ
			{#snippet paypal()}
				<CheckoutPaymentPaypal />
			{/snippet}
		</CheckoutPaymentContainer>
	</div>
{/snippet}

<Story name="Default" children={template} />
