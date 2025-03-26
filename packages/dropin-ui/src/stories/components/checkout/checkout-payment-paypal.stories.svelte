<script module>
	import CheckoutPaymentPaypal from '$lib/components/checkout/checkout-payment-paypal.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Payment/Paypal',
		component: CheckoutPaymentPaypal,
		args: {
			onclick: fn()
		}
	});
</script>

{#snippet template(args)}
	<CheckoutPaymentPaypal {...args} />
{/snippet}

<Story name="Default" children={template} />
