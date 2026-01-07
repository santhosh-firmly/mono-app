<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import OrdersByDestination from './orders-by-destination.svelte';

	const { Story } = defineMeta({
		title: 'Data Display/Cards/Orders By Destination',
		component: OrdersByDestination,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});

	const mockOrdersByDestination = {
		results: [
			{
				app_id: 'app_visa_1234567890',
				total_orders: 245,
				net_sales: 45678.9,
				aov: 186.44
			},
			{
				app_id: 'app_mastercard_0987654321',
				total_orders: 178,
				net_sales: 32100.5,
				aov: 180.34
			},
			{
				app_id: 'app_amex_1122334455',
				total_orders: 89,
				net_sales: 21340.0,
				aov: 239.78
			},
			{
				app_id: 'app_discover_5544332211',
				total_orders: 34,
				net_sales: 5670.0,
				aov: 166.76
			}
		]
	};

	const mockDestinations = {
		results: [
			{
				key: 'app_visa_1234567890',
				info: JSON.stringify({ subject: 'Visa Card' })
			},
			{
				key: 'app_mastercard_0987654321',
				info: JSON.stringify({ subject: 'Mastercard' })
			},
			{
				key: 'app_amex_1122334455',
				info: JSON.stringify({ subject: 'American Express' })
			},
			{
				key: 'app_discover_5544332211',
				info: JSON.stringify({ subject: 'Discover' })
			}
		]
	};
</script>

{#snippet template(args)}
	<div class="max-w-2xl">
		<OrdersByDestination {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		ordersByDestination: mockOrdersByDestination,
		destinations: mockDestinations
	}}
	{template}
/>

<Story
	name="Single Destination"
	args={{
		ordersByDestination: {
			results: [mockOrdersByDestination.results[0]]
		},
		destinations: mockDestinations
	}}
	{template}
/>

<Story
	name="Unknown Destinations"
	args={{
		ordersByDestination: mockOrdersByDestination,
		destinations: { results: [] }
	}}
	{template}
/>

<Story
	name="Empty"
	args={{
		ordersByDestination: { results: [] },
		destinations: { results: [] }
	}}
	{template}
/>
