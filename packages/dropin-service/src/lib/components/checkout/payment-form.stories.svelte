<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import PaymentForm from './payment-form.svelte';
	import ShippingAddressForm from './shipping-address-form.svelte';
	import { useCheckoutForm } from '$lib/composables/forms.svelte.js';

	const { Story } = defineMeta({
		title: 'Checkout/Payment/Form',
		component: PaymentForm,
		parameters: {
			layout: 'centered'
		},
		args: {
			number: '',
			expiration: '',
			verificationCode: '',
			useBillingAsShipping: true,
			onFullfilled: fn()
		}
	});

	const mockBillingAddress = {
		first_name: 'John',
		last_name: 'Smith',
		phone: '2065550123',
		address1: '456 Billing Ave',
		address2: 'Suite 100',
		city: 'New York',
		state_or_province: 'NY',
		postal_code: '10001'
	};
</script>

<script>
	function createEmptyBillingForm() {
		return useCheckoutForm({});
	}

	function createFilledBillingForm() {
		return useCheckoutForm(mockBillingAddress);
	}
</script>

{#snippet template(args)}
	<div class="w-100 p-4">
		<PaymentForm {...args} />
	</div>
{/snippet}

{#snippet billingTemplate(args)}
	{@const billingForm = createEmptyBillingForm()}
	<div class="w-100 p-4">
		<PaymentForm {...args} useBillingAsShipping={false}>
			{#snippet billingAddressForm()}
				<div class="mt-4">
					<ShippingAddressForm
						useToBilling={true}
						form={billingForm}
						forceManualMode={true}
						onSelectAddressCompletion={fn()}
						onInputAddressCompletion={fn()}
					/>
				</div>
			{/snippet}
		</PaymentForm>
	</div>
{/snippet}

{#snippet filledBillingTemplate(args)}
	{@const billingForm = createFilledBillingForm()}
	<div class="w-100 p-4">
		<PaymentForm {...args} useBillingAsShipping={false}>
			{#snippet billingAddressForm()}
				<div class="mt-4">
					<ShippingAddressForm
						useToBilling={true}
						form={billingForm}
						forceManualMode={true}
						onSelectAddressCompletion={fn()}
						onInputAddressCompletion={fn()}
					/>
				</div>
			{/snippet}
		</PaymentForm>
	</div>
{/snippet}

<Story name="Empty" {template} />

<Story
	name="Filled"
	args={{
		number: '4111111111111111',
		expiration: '1225',
		verificationCode: '123'
	}}
	{template}
/>

<Story
	name="Visa Card"
	args={{
		number: '4111111111111111'
	}}
	{template}
/>

<Story
	name="Mastercard"
	args={{
		number: '5555555555554444'
	}}
	{template}
/>

<Story
	name="American Express"
	args={{
		number: '378282246310005'
	}}
	{template}
/>

<Story name="With Billing Address" template={billingTemplate} />

<Story
	name="Filled With Billing Address"
	args={{
		number: '4111111111111111',
		expiration: '1225',
		verificationCode: '123'
	}}
	template={filledBillingTemplate}
/>

<!-- Error States -->
<Story
	name="Invalid Card Number"
	args={{
		number: '1234567890123456',
		expiration: '',
		verificationCode: ''
	}}
	{template}
/>

<Story
	name="Expired Card"
	args={{
		number: '4111111111111111',
		expiration: '0120',
		verificationCode: ''
	}}
	{template}
/>

<Story
	name="Invalid CVC"
	args={{
		number: '4111111111111111',
		expiration: '1225',
		verificationCode: '12'
	}}
	{template}
/>

<Story
	name="All Fields Invalid"
	args={{
		number: '1234',
		expiration: '0120',
		verificationCode: '1'
	}}
	{template}
/>
