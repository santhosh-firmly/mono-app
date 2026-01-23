<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import PaymentCvvConfirmation from './payment-cvv-confirmation.svelte';

	const mockVisaCard = {
		id: 1,
		brand: 'Visa',
		first4: '4111',
		last4: '1234'
	};

	const mockMastercardCard = {
		id: 2,
		brand: 'Mastercard',
		first4: '5111',
		last4: '5678'
	};

	const mockAmexCard = {
		id: 3,
		brand: 'American Express',
		first4: '3782',
		last4: '0005'
	};

	const { Story } = defineMeta({
		title: 'Checkout/Payment/CVV Confirmation',
		component: PaymentCvvConfirmation,
		parameters: {
			layout: 'centered'
		},
		args: {
			card: mockVisaCard,
			value: '',
			error: '',
			loading: false,
			onCvvChange: fn(),
			onSubmit: fn(),
			onCancel: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-80 p-4">
		<PaymentCvvConfirmation {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="With Value" args={{ value: '123' }} {template} />

<Story name="With Error" args={{ value: '12', error: 'Invalid CVV' }} {template} />

<Story name="Loading" args={{ value: '123', loading: true }} {template} />

<Story name="Mastercard" args={{ card: mockMastercardCard }} {template} />

<Story name="American Express" args={{ card: mockAmexCard }} {template} />
