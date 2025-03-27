<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import CheckoutContainer from '$lib/components/checkout/checkout-container.svelte';
	import CheckoutShippingList from '$lib/components/checkout/checkout-shipping-list.svelte';
	import CheckoutShippingAddress from '$lib/components/checkout/checkout-shipping-address-form.svelte';
	import CheckoutShippingMethods from '$lib/components/checkout/checkout-shipping-methods.svelte';
	import CheckoutPaymentCard from '$lib/components/checkout/checkout-payment-form.svelte';
	import CheckoutPaymentCardList from '$lib/components/checkout/checkout-payment-card-list.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Container',
		component: CheckoutContainer,
		parameters: {
			layout: 'centered'
		},
		args: {
			addresses: [],
			selectedAddress: {},
			shippingMethods: [],
			selectedShippingMethod: {},
			cards: [],
			selectedCard: {}
		}
	});

	const mockAddresses = [
		{
			id: 1,
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
		},
		{
			id: 2,
			first_name: 'Sarah',
			last_name: 'Johnson',
			phone: '5035551234',
			address1: '456 Park Avenue',
			city: 'Portland',
			state_or_province: 'OR',
			state_name: 'Oregon',
			country: 'United States',
			postal_code: '97201',
			email: 'sarah.j@example.com'
		}
	];

	const mockCards = [
		{
			id: 1,
			brand: 'Visa',
			first4: '4111',
			last4: '1111'
		},
		{
			id: 2,
			brand: 'Mastercard',
			first4: '5555',
			last4: '4444'
		}
	];

	const mockShippingMethods = [
		{
			sku: 'standard',
			name: 'Standard Shipping',
			description: '3-5 business days',
			price: 5.99
		},
		{
			sku: 'express',
			name: 'Express Shipping',
			description: '1-2 business days',
			price: 12.99
		}
	];
</script>

{#snippet template(args)}
	<div class="w-full max-w-md">
		<CheckoutContainer
			addresses={args.addresses}
			selectedAddress={args.selectedAddress}
			shippingMethods={args.shippingMethods}
			selectedShippingMethod={args.selectedShippingMethod}
			cards={args.cards}
			selectedCard={args.selectedCard}
		>
			{#snippet addressList()}
				<CheckoutShippingList
					addresses={args.addresses}
					selectedAddress={args.selectedAddress}
					onSelect={fn()}
					onAddNewAddress={fn()}
				/>
			{/snippet}
			{#snippet addressForm()}
				<CheckoutShippingAddress selectedAddress={args.selectedAddress} />
			{/snippet}
			{#snippet methodsList()}
				<CheckoutShippingMethods
					shippingMethods={args.shippingMethods}
					selectedShippingMethod={args.selectedShippingMethod}
					onSelect={fn()}
				/>
			{/snippet}
			{#snippet cardsList()}
				<CheckoutPaymentCardList
					cards={args.cards}
					selectedCard={args.selectedCard}
					onSelect={fn()}
					onAddNewCard={fn()}
				/>
			{/snippet}
			{#snippet paymentForm()}
				<CheckoutPaymentCard />
			{/snippet}
		</CheckoutContainer>
	</div>
{/snippet}

<Story name="Empty" children={template} />

<Story
	name="With Addresses"
	children={template}
	args={{
		addresses: mockAddresses
	}}
/>

<Story
	name="With Shipping Methods"
	children={template}
	args={{
		shippingMethods: mockShippingMethods
	}}
/>

<Story
	name="With Payment Cards"
	children={template}
	args={{
		cards: mockCards
	}}
/>

<Story
	name="Complete"
	children={template}
	args={{
		addresses: mockAddresses,
		selectedAddress: mockAddresses[0],
		shippingMethods: mockShippingMethods,
		selectedShippingMethod: mockShippingMethods[0],
		cards: mockCards,
		selectedCard: mockCards[0]
	}}
/>
