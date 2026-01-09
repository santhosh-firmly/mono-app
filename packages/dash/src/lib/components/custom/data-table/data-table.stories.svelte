<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DataTable from './data-table.svelte';

	const { Story } = defineMeta({
		title: 'Dev Tools/Data Table',
		component: DataTable,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<DataTable {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		data: [
			{
				store_id: 'example-store.com',
				display_name: 'Example Store',
				is_disabled: false,
				platform_id: 'shopify',
				psp: 'stripe'
			},
			{
				store_id: 'another-shop.com',
				display_name: 'Another Shop',
				is_disabled: false,
				platform_id: 'woocommerce',
				psp: 'paypal'
			},
			{
				store_id: 'test-merchant.com',
				display_name: 'Test Merchant',
				is_disabled: true,
				platform_id: 'shopify',
				psp: 'stripe'
			}
		],
		columnFilters: [
			{ id: 'platform_id', options: ['shopify', 'woocommerce', 'bigcommerce'] },
			{ id: 'psp', options: ['stripe', 'paypal', 'adyen'] }
		]
	}}
	{template}
/>

<Story
	name="Many Merchants"
	args={{
		data: [
			{
				store_id: 'store-1.com',
				display_name: 'Store One',
				is_disabled: false,
				platform_id: 'shopify',
				psp: 'stripe'
			},
			{
				store_id: 'store-2.com',
				display_name: 'Store Two',
				is_disabled: false,
				platform_id: 'woocommerce',
				psp: 'paypal'
			},
			{
				store_id: 'store-3.com',
				display_name: 'Store Three',
				is_disabled: true,
				platform_id: 'shopify',
				psp: 'adyen'
			},
			{
				store_id: 'store-4.com',
				display_name: 'Store Four',
				is_disabled: false,
				platform_id: 'bigcommerce',
				psp: 'stripe'
			},
			{
				store_id: 'store-5.com',
				display_name: 'Store Five',
				is_disabled: false,
				platform_id: 'shopify',
				psp: 'stripe'
			},
			{
				store_id: 'store-6.com',
				display_name: 'Store Six',
				is_disabled: true,
				platform_id: 'woocommerce',
				psp: 'paypal'
			},
			{
				store_id: 'store-7.com',
				display_name: 'Store Seven',
				is_disabled: false,
				platform_id: 'shopify',
				psp: 'stripe'
			},
			{
				store_id: 'store-8.com',
				display_name: 'Store Eight',
				is_disabled: false,
				platform_id: 'bigcommerce',
				psp: 'adyen'
			}
		],
		columnFilters: [
			{ id: 'platform_id', options: ['shopify', 'woocommerce', 'bigcommerce'] },
			{ id: 'psp', options: ['stripe', 'paypal', 'adyen'] }
		]
	}}
	{template}
/>

<Story
	name="Empty State"
	args={{
		data: [],
		columnFilters: [
			{ id: 'platform_id', options: ['shopify', 'woocommerce'] },
			{ id: 'psp', options: ['stripe', 'paypal'] }
		]
	}}
	{template}
/>
