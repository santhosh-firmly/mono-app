<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrderHeader from './order-header.svelte';

	const { Story } = defineMeta({
		title: 'Orders/Order Header',
		component: OrderHeader,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			orderNumber: '1042',
			status: 'Completed',
			createdAt: '2024-12-15T14:30:00Z'
		},
		argTypes: {
			orderNumber: { control: 'text', description: 'The order number to display' },
			status: { control: 'text', description: 'Order status badge text' },
			createdAt: {
				control: 'text',
				description: 'ISO date string for when the order was placed'
			},
			dateFormat: {
				control: 'text',
				description: 'date-fns format string for the date display'
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-xl">
		<OrderHeader {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="Pending" args={{ status: 'Pending', orderNumber: '1043' }} {template} />

<Story name="Processing" args={{ status: 'Processing', orderNumber: '1044' }} {template} />

<Story name="Cancelled" args={{ status: 'Cancelled', orderNumber: '1045' }} {template} />
