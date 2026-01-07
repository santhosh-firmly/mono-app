<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import ShippingAddressCard from './shipping-address-card.svelte';

	const { Story } = defineMeta({
		title: 'Orders/Shipping Address Card',
		component: ShippingAddressCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			address: orderData.order.order_info.shipping_info,
			title: 'Shipping Address'
		},
		argTypes: {
			address: {
				control: 'object',
				description:
					'Address object with name, address_line_1, address_line_2, city, state_or_province, postal_code, country'
			},
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm">
		<ShippingAddressCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Without Address Line 2"
	args={{
		address: {
			name: 'Jane Doe',
			address_line_1: '456 Oak Avenue',
			city: 'Los Angeles',
			state_or_province: 'CA',
			postal_code: '90001',
			country: 'United States'
		}
	}}
	{template}
/>

<Story
	name="International Address"
	args={{
		address: {
			name: 'Pierre Martin',
			address_line_1: '15 Rue de la Paix',
			address_line_2: 'Apt 3',
			city: 'Paris',
			state_or_province: 'Île-de-France',
			postal_code: '75002',
			country: 'France'
		}
	}}
	{template}
/>

<Story
	name="Minimal Address"
	args={{
		address: {
			address_line_1: '123 Main St',
			city: 'New York',
			state_or_province: 'NY',
			postal_code: '10001'
		}
	}}
	{template}
/>
