<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import BillingAddressCard from './billing-address-card.svelte';

	const { Story } = defineMeta({
		title: 'Orders/Billing Address Card',
		component: BillingAddressCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			address: orderData.order.order_info.billing_info,
			title: 'Billing Address'
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
		<BillingAddressCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Different from Shipping"
	args={{
		address: {
			name: 'ACME Corp',
			address_line_1: '100 Business Park Drive',
			address_line_2: 'Suite 500',
			city: 'Chicago',
			state_or_province: 'IL',
			postal_code: '60601',
			country: 'United States'
		}
	}}
	{template}
/>
