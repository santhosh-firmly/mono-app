<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import OrderNavigation from './order-navigation.svelte';

	const nav = orderData.navigation;

	const { Story } = defineMeta({
		title: 'Orders/Order Navigation',
		component: OrderNavigation,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			title: 'Order Details',
			subtitle: '',
			currentIndex: nav.currentIndex,
			totalOrders: nav.totalOrders,
			hasPrev: true,
			hasNext: true,
			onBack: () => console.log('Back clicked'),
			onPrev: () => console.log('Previous clicked'),
			onNext: () => console.log('Next clicked')
		},
		argTypes: {
			title: { control: 'text', description: 'Main title' },
			subtitle: {
				control: 'text',
				description: 'Custom subtitle (overrides auto-generated from index)'
			},
			currentIndex: { control: 'number', description: 'Current order index for display' },
			totalOrders: { control: 'number', description: 'Total orders count for display' },
			hasPrev: { control: 'boolean', description: 'Enable previous button' },
			hasNext: { control: 'boolean', description: 'Enable next button' },
			onBack: { action: 'back', description: 'Callback when back button clicked' },
			onPrev: { action: 'prev', description: 'Callback when previous button clicked' },
			onNext: { action: 'next', description: 'Callback when next button clicked' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-2xl rounded-lg border bg-card p-4">
		<OrderNavigation {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="First Order"
	args={{
		currentIndex: 1,
		totalOrders: 100,
		hasPrev: false,
		hasNext: true
	}}
	{template}
/>

<Story
	name="Last Order"
	args={{
		currentIndex: 100,
		totalOrders: 100,
		hasPrev: true,
		hasNext: false
	}}
	{template}
/>

<Story
	name="Single Order"
	args={{
		currentIndex: 1,
		totalOrders: 1,
		hasPrev: false,
		hasNext: false
	}}
	{template}
/>

<Story
	name="Custom Subtitle"
	args={{
		subtitle: 'Order from Example Store',
		currentIndex: 0,
		totalOrders: 0
	}}
	{template}
/>
