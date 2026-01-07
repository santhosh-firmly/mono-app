<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import CustomerInfoCard from './customer-info-card.svelte';

	const shippingInfo = orderData.order.order_info.shipping_info;

	const { Story } = defineMeta({
		title: 'Orders/Customer Info Card',
		component: CustomerInfoCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			email: shippingInfo.email,
			phone: shippingInfo.phone,
			maskValues: false,
			title: 'Customer Information'
		},
		argTypes: {
			email: { control: 'text', description: 'Customer email address' },
			phone: { control: 'text', description: 'Customer phone number' },
			maskValues: {
				control: 'boolean',
				description: 'Whether to mask sensitive values using displayFromHash'
			},
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm">
		<CustomerInfoCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="Masked Values" args={{ maskValues: true }} {template} />

<Story name="Missing Phone" args={{ phone: '' }} {template} />

<Story name="Missing Email" args={{ email: '' }} {template} />
