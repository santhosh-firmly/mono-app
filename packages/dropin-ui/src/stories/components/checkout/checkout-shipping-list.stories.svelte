<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import CheckoutShippingList from '$lib/components/checkout/checkout-shipping-list.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Shipping/List',
		component: CheckoutShippingList,
		parameters: {
			layout: 'centered'
		},
		args: {
			addresses: [],
			disabled: false,
			onAddNewAddress: fn(),
			onSelect: fn(),
			selectedAddress: null
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
			address2: '',
			city: 'Portland',
			state_or_province: 'OR',
			state_name: 'Oregon',
			country: 'United States',
			postal_code: '97201',
			email: 'sarah.j@example.com'
		},
		{
			id: 3,
			first_name: 'Michael',
			last_name: 'Brown',
			phone: '4155559876',
			address1: '789 Ocean Drive',
			address2: 'Suite 300',
			city: 'San Francisco',
			state_or_province: 'CA',
			state_name: 'California',
			country: 'United States',
			postal_code: '94105',
			email: 'm.brown@example.com'
		}
	];
</script>

{#snippet template(args)}
	<div class="w-full max-w-md p-4">
		<CheckoutShippingList {...args} />
	</div>
{/snippet}

<Story name="Empty List" children={template} />

<Story
	name="With Addresses"
	children={template}
	args={{
		addresses: mockAddresses
	}}
/>

<Story
	name="With Selected Address"
	children={template}
	args={{
		addresses: mockAddresses,
		selectedAddress: mockAddresses[1]
	}}
/>

<Story
	name="Disabled"
	children={template}
	args={{
		addresses: mockAddresses,
		selectedAddress: mockAddresses[0],
		disabled: true
	}}
/>
