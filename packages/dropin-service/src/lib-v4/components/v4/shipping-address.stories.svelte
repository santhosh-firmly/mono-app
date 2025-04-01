<script>
	import ShippingAddress from './shipping-address.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import './theme.css';

	const name = 'John Doe';
	const savedAddresses = [
		{
			first_name: 'testing',
			last_name: 'mock',
			phone: '1234567891',
			address1: '1 microsoft way',
			address2: '',
			city: 'redmond',
			state_or_province: 'wa',
			country: 'us',
			postal_code: '98052',
			email: 'john@doe.com'
		},
		{
			first_name: 'john',
			last_name: 'doe',
			phone: '2222222222',
			address1: 'address test',
			address2: '2',
			city: 'San Francisco',
			state_or_province: 'CA',
			country: 'us',
			postal_code: '11111',
			email: 'john@doe.com'
		},
		{
			first_name: 'mock',
			last_name: 'mocking',
			phone: '+123 (45) 123-456',
			address1: 'my address',
			address2: '',
			city: 'Los Angeles',
			state_or_province: 'CA',
			country: 'us',
			postal_code: '22222',
			email: 'mock@mocking.com'
		}
	];

	const oneAddress = [
		{
			first_name: 'mateus',
			last_name: 'teste',
			phone: '1234567891',
			address1: '1 microsoft way',
			address2: '',
			city: 'redmond',
			state_or_province: 'wa',
			country: 'us',
			postal_code: '98052',
			email: 'mateus@firmly.ai'
		}
	];

	const addressWithoutPhone = [
		{
			first_name: 'Frodo',
			last_name: 'Baggins',
			address1: '1 microsoft way',
			address2: '',
			city: 'redmond',
			state_or_province: 'wa',
			country: 'us',
			postal_code: '98052',
			email: 'frodo@firmly.ai'
		}
	];
</script>

<Meta
	title="Checkout V4/Checkout/Shipping Address"
	component={ShippingAddress}
	tags={['autodocs']}
/>

<Template let:args>
	<ShippingAddress {...args} />
</Template>

<Story name="One saved address" args={{ savedAddresses: oneAddress, headerDisplay: 'email' }} />

<Story name="Multi addresses" args={{ savedAddresses, subheaderName: name }} />

<Story name="Multi addresses header with name" args={{ savedAddresses, headerDisplay: 'name' }} />

<Story name="Multi addresses header with name" args={{ savedAddresses, headerDisplay: 'name' }} />

<Story
	name="Address without phone"
	args={{ savedAddresses: addressWithoutPhone, headerDisplay: 'name' }}
/>

<Story name="No address" />
