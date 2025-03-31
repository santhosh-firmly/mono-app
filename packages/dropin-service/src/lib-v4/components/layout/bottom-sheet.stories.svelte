<script lang="js">
	// @ts-nocheck

	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import BottomSheet from './bottom-sheet.svelte';
	import { userEvent, within } from '@storybook/testing-library';
	import { writable } from 'svelte/store';
	import FlowSinglePage from '../v4/flow-single-page.svelte';

	import '$lib-v4/components/v4/theme.scss';

	const cartData = {
		display_name: 'Young Rebelz',
		cart_status: 'active',
		platform_id: 'shopify',
		shop_id: 'youngrebelz.com',
		shop_properties: {
			paypal: {
				clientId:
					'AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr',
				merchantId: 'kumar@harrysholding.com'
			}
		},
		cart_id: '7f43d396-e3f7-4efb-8be3-dfc357cd0a4c',
		urls: {},
		line_items: [
			{
				line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4790',
				sku: '29227235868724',
				base_sku: '3796148518964',
				quantity: 2,
				msrp: {
					currency: 'USD',
					value: 6.5
				},
				price: {
					currency: 'USD',
					value: 6.5
				},
				line_price: {
					currency: 'USD',
					value: 13
				},
				requires_shipping: true,
				image: {
					url: 'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_large.jpg?v=1565574386',
					large:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_large.jpg?v=1565574386',
					grande:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_grande.jpg?v=1565574386',
					medium:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_medium.jpg?v=1565574386',
					compact:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_compact.jpg?v=1565574386',
					small:
						'http://cdn.shopify.com/s/files/1/0065/5812/2036/products/Tank-Top-Women-White-Front_small.jpg?v=1565574386'
				},
				platform_line_item_id: '310b03b0be9f37edb3ae55631fdb8c0a',
				description: 'Plant 5 : Do not order'
			}
		],
		sub_total: {
			currency: 'USD',
			value: 13
		},
		cart_discount: {
			currency: 'USD',
			value: 0
		},
		shipping_total: {
			currency: 'USD',
			value: 0
		},
		tax: {
			currency: 'USD',
			value: 0
		},
		total: {
			currency: 'USD',
			value: 13
		},
		payment_method_options: [
			{
				type: 'CreditCard',
				wallet: 'user'
			},
			{
				type: 'PayPal',
				wallet: 'paypal'
			},
			{
				type: 'ShopPay',
				wallet: 'shoppay'
			}
		]
	};

	const cart = writable(cartData);
</script>

<Meta
	title="Components/Layout/Bottom Sheet"
	component={BottomSheet}
	parameters={{
		layout: 'fullscreen'
	}}
/>

<Template let:args>
	<div class="h-screen w-full bg-gray-100 p-4">
		<BottomSheet {...args} class="p-4">
			<button slot="trigger" class="rounded bg-blue-500 px-4 py-2 text-white">Open Sheet</button>

			<button slot="close" class="absolute top-4 right-4"> ✕ </button>

			<h2 slot="title">Bottom Sheet Title</h2>

			<p slot="description">
				This is a responsive bottom sheet component that renders as a dialog on desktop and a drawer
				on mobile viewports.
			</p>

			<div class="py-4">
				<p>Main content goes here</p>
				<p>It can contain any elements</p>
			</div>

			<div slot="footer" class="flex justify-end gap-2">
				<button class="rounded bg-gray-200 px-4 py-2">Cancel</button>
				<button class="rounded bg-blue-500 px-4 py-2 text-white">Confirm</button>
			</div>
		</BottomSheet>
	</div>
</Template>

<Story
	name="Default"
	args={{
		open: false
	}}
/>

<Story
	name="Initially Open"
	args={{
		open: true
	}}
/>

<Story
	name="With Change Handler"
	args={{
		open: false,
		onOpenChange: (isOpen) => {
			console.log('Sheet open state:', isOpen);
		}
	}}
	play={async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);

		await step('Click trigger to open', async () => {
			const trigger = canvas.getByText('Open Sheet');
			await userEvent.click(trigger);
		});
	}}
/>

<Story
	name="Mobile View"
	parameters={{
		viewport: {
			defaultViewport: 'mobile2'
		}
	}}
	args={{
		open: true
	}}
/>

<Story
	name="With the checkout"
	parameters={{
		viewport: {
			defaultViewport: 'mobile2'
		}
	}}
>
	<div class="adoreme-dark h-full w-full bg-gray-100 p-4">
		<BottomSheet
			snapPoints={['100px', 1]}
			open={true}
			onOpenChange={(...args) => {
				console.log('open state changed', args);
			}}
		>
			<div slot="trigger">
				<button class="rounded bg-blue-500 px-4 py-2 text-white">Start Checkout</button>
			</div>
			<div class="mx-auto flex w-full max-w-md flex-col">
				<FlowSinglePage {cart} />
			</div>
		</BottomSheet>
	</div>
</Story>
