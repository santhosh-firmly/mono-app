<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import CheckoutShippingAddress from '$lib/components/checkout/checkout-shipping-address-form.svelte';
	import { useCheckoutForm } from '$lib/states/forms.svelte';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Shipping/Address Form',
		component: CheckoutShippingAddress,
		parameters: {
			layout: 'centered'
		},
		args: {
			selectedAddress: null,
			isManualMode: false,
			useToBilling: false,
			onFullFilled: fn()
		}
	});

	const mockAddress = {
		first_name: 'John',
		last_name: 'Smith',
		phone: '2065550123',
		address1: '123 Main Street',
		address2: 'Apt 4B',
		city: 'Seattle',
		state_or_province: 'WA',
		state_name: 'Washington',
		country: 'United States',
		postal_code: '98101',
		email: 'john.smith@example.com'
	};
</script>

{#snippet template(args)}
	<div class="w-[380px] p-4">
		<CheckoutShippingAddress form={useCheckoutForm(mockAddress)} {...args} />
	</div>
{/snippet}

<Story name="Empty Form" children={template} />

<Story name="Use As Billing" args={{ useToBilling: true }} children={template} />

<Story
	name="Filled Form"
	args={{ selectedAddress: mockAddress, isManualMode: true }}
	children={template}
/>
