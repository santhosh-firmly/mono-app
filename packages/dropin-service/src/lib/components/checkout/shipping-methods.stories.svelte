<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import ShippingMethods from './shipping-methods.svelte';

	const mockShippingMethods = [
		{
			sku: 'standard',
			name: 'Standard Shipping',
			description: '3-5 business days',
			price: { value: 5.99, formatted: '$5.99' }
		},
		{
			sku: 'express',
			name: 'Express Shipping',
			description: '1-2 business days',
			price: { value: 12.99, formatted: '$12.99' }
		}
	];

	const { Story } = defineMeta({
		title: 'Checkout/Shipping/Methods',
		component: ShippingMethods,
		parameters: {
			layout: 'centered'
		},
		args: {
			selectedShippingMethod: '',
			onSelect: fn(),
			shippingMethods: [],
			isLoading: false,
			isUpdating: false,
			error: ''
		}
	});
</script>

{#snippet template(args)}
	<div class="w-95 p-4">
		<ShippingMethods {...args} />
	</div>
{/snippet}

<Story name="Loading" args={{ isLoading: true }} {template} />

<Story name="No Methods" {template} />

<Story
	name="Available Methods"
	args={{
		shippingMethods: mockShippingMethods,
		selectedShippingMethod: 'standard'
	}}
	{template}
/>

<Story
	name="Updating"
	args={{
		shippingMethods: mockShippingMethods,
		selectedShippingMethod: 'standard',
		isUpdating: true
	}}
	{template}
/>

<Story
	name="With Error"
	args={{
		shippingMethods: mockShippingMethods,
		selectedShippingMethod: 'standard',
		error: 'Selected shipping method is no longer available for your address.'
	}}
	{template}
/>

<Story
	name="No Methods With Error"
	args={{
		shippingMethods: [],
		error: 'Unable to calculate shipping for this address.'
	}}
	{template}
/>
