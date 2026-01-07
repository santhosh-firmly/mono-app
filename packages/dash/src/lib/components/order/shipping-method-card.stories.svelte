<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import ShippingMethodCard from './shipping-method-card.svelte';

	const shippingMethod = orderData.order.order_info.shipping_method;

	const { Story } = defineMeta({
		title: 'Orders/Shipping Method Card',
		component: ShippingMethodCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			description: shippingMethod.description,
			estimatedDelivery: shippingMethod.estimated_delivery,
			trackingNumber: shippingMethod.tracking_number,
			title: 'Shipping Method'
		},
		argTypes: {
			description: { control: 'text', description: 'Shipping method name/description' },
			estimatedDelivery: { control: 'text', description: 'Estimated delivery date' },
			trackingNumber: { control: 'text', description: 'Tracking number (optional)' },
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm">
		<ShippingMethodCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Standard Shipping"
	args={{
		description: 'Standard Shipping (5-7 Business Days)',
		estimatedDelivery: 'January 5, 2025',
		trackingNumber: ''
	}}
	{template}
/>

<Story
	name="Without Tracking"
	args={{
		description: 'Economy Shipping',
		estimatedDelivery: 'January 10-15, 2025',
		trackingNumber: ''
	}}
	{template}
/>

<Story
	name="Local Pickup"
	args={{
		description: 'Local Pickup - Store #123',
		estimatedDelivery: 'Ready in 2 hours',
		trackingNumber: ''
	}}
	{template}
/>
