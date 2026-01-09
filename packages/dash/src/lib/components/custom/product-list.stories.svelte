<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProductList from './product-list.svelte';

	const { Story } = defineMeta({
		title: 'Dev Tools/Product List',
		component: ProductList,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		}
	});
</script>

{#snippet template(args)}
	<ProductList {...args} />
{/snippet}

<Story
	name="Default"
	args={{
		products: [
			{
				base_sku: 'SKU-001',
				title: 'Wireless Bluetooth Headphones',
				handle: 'wireless-headphones',
				images: [{ url: '/images/placeholder.svg' }],
				variants: [{ price: '79.99', available: true }]
			},
			{
				base_sku: 'SKU-002',
				title: 'USB-C Charging Cable',
				handle: 'usb-c-cable',
				images: [{ url: '/images/placeholder.svg' }],
				variants: [
					{ price: '14.99', available: true },
					{ price: '19.99', available: true }
				]
			},
			{
				base_sku: 'SKU-003',
				title: 'Laptop Stand - Aluminum',
				handle: 'laptop-stand',
				images: [{ url: '/images/placeholder.svg' }],
				variants: [{ price: '49.99', available: false }]
			}
		],
		total: 3
	}}
	{template}
/>

<Story
	name="With More Products"
	args={{
		products: [
			{
				base_sku: 'SKU-001',
				title: 'Product One',
				handle: 'product-one',
				variants: [{ price: '29.99', available: true }]
			},
			{
				base_sku: 'SKU-002',
				title: 'Product Two',
				handle: 'product-two',
				variants: [{ price: '39.99', available: true }]
			},
			{
				base_sku: 'SKU-003',
				title: 'Product Three',
				handle: 'product-three',
				variants: [{ price: '49.99', available: false }]
			}
		],
		total: 25
	}}
	{template}
/>

<Story
	name="Empty List"
	args={{
		products: [],
		total: 0
	}}
	{template}
/>

<Story
	name="Single Product"
	args={{
		products: [
			{
				base_sku: 'SINGLE-001',
				title: 'Premium Widget Pro',
				handle: 'premium-widget-pro',
				images: [{ url: '/images/placeholder.svg' }],
				variants: [
					{ price: '99.99', available: true },
					{ price: '109.99', available: true },
					{ price: '119.99', available: true },
					{ price: '129.99', available: false }
				]
			}
		],
		total: 1
	}}
	{template}
/>
