<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import PaymentOptionSwitch from './payment-option-switch.svelte';
	import PaymentForm from './payment-form.svelte';
	import PaymentPaypal from './payment-paypal.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Payment/Option Switch',
		component: PaymentOptionSwitch,
		parameters: {
			layout: 'centered'
		},
		args: {
			selectedMethod: 'card',
			showPaypal: true,
			onMethodChange: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-95">
		<PaymentOptionSwitch {...args}>
			{#snippet card()}
				<PaymentForm
					number=""
					expiration=""
					verificationCode=""
					useBillingAsShipping={true}
				/>
			{/snippet}
			{#snippet paypalOption()}
				<PaymentPaypal onclick={fn()} />
			{/snippet}
		</PaymentOptionSwitch>
	</div>
{/snippet}

{#snippet filledCardTemplate(args)}
	<div class="w-95">
		<PaymentOptionSwitch {...args}>
			{#snippet card()}
				<PaymentForm
					number="4111111111111111"
					expiration="1225"
					verificationCode="123"
					useBillingAsShipping={true}
				/>
			{/snippet}
			{#snippet paypalOption()}
				<PaymentPaypal onclick={fn()} />
			{/snippet}
		</PaymentOptionSwitch>
	</div>
{/snippet}

<Story name="Card Selected" {template} />

<Story name="Card Filled" template={filledCardTemplate} />

<Story name="PayPal Selected" args={{ selectedMethod: 'paypal' }} {template} />

<Story name="Card Only" args={{ showPaypal: false }} {template} />
