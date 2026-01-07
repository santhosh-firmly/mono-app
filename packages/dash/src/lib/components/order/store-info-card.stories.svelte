<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import orderData from '$lib/assets/order-data.json';
	import StoreInfoCard from './store-info-card.svelte';

	const { Story } = defineMeta({
		title: 'Orders/Store Info Card',
		component: StoreInfoCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		args: {
			domain: orderData.order.shop_id,
			displayName: orderData.order.display_name,
			showFavicon: true,
			title: 'Store Information'
		},
		argTypes: {
			domain: { control: 'text', description: 'Store domain' },
			displayName: { control: 'text', description: 'Store display name' },
			showFavicon: { control: 'boolean', description: 'Whether to show the favicon' },
			title: { control: 'text', description: 'Card title' }
		}
	});
</script>

{#snippet template(args)}
	<div class="max-w-sm">
		<StoreInfoCard {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Without Favicon"
	args={{
		showFavicon: false
	}}
	{template}
/>

<Story
	name="Different Store"
	args={{
		domain: 'another-store.com',
		displayName: 'Another Store'
	}}
	{template}
/>

<Story
	name="No Display Name"
	args={{
		domain: 'store-domain.com',
		displayName: ''
	}}
	{template}
/>
