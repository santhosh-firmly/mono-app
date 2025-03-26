<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import CheckoutPaymentCard from '$lib/components/checkout/checkout-payment-form.svelte';
	import CheckoutShippingAddressForm from '$lib/components/checkout/checkout-shipping-address-form.svelte';
	const { Story } = defineMeta({
		title: 'Components/Checkout/Payment/Form',
		component: CheckoutPaymentCard,
		parameters: {
			layout: 'centered'
		},
		args: {
			number: '',
			expiration: '',
			verificationCode: '',
			onFullfilled: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="@container w-[500px] p-4">
		<CheckoutPaymentCard {...args}>
			{#snippet billingAddressForm()}
				<CheckoutShippingAddressForm />
			{/snippet}
		</CheckoutPaymentCard>
	</div>
{/snippet}

<Story name="Empty Form" children={template} />

<Story
	name="With Valid Data"
	args={{ number: '4111111111111111', expiration: '1224', verificationCode: '123' }}
	children={template}
/>
