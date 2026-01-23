<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import LineItem from './line-item.svelte';

	const mockItem = {
		id: 'item-1',
		name: 'Blackberry Peach Hydration Multiplier',
		description: 'Blackberry Peach / 10 Pack',
		imageUrl: 'https://cdn.shopify.com/s/files/1/1338/1013/files/placeholder.jpg',
		quantity: 1,
		price: { value: 24.99, symbol: '$' },
		linePrice: { value: 24.99, symbol: '$', formatted: '$24.99' }
	};

	const { Story } = defineMeta({
		title: 'Work in Progress/Line Item',
		component: LineItem,
		parameters: {
			layout: 'centered'
		},
		args: {
			...mockItem,
			isLoading: false,
			isRemoving: false,
			minQuantity: 1,
			maxQuantity: 99,
			onQuantityChange: fn(),
			onRemove: fn()
		}
	});
</script>

{#snippet template(args)}
	<div class="w-96">
		<LineItem {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story
	name="Multiple Quantity"
	args={{
		quantity: 3,
		linePrice: { value: 74.97, symbol: '$', formatted: '$74.97' }
	}}
	{template}
/>

<Story name="Loading (Updating)" args={{ isLoading: true }} {template} />

<Story name="Removing" args={{ isRemoving: true }} {template} />

<Story name="Without Image" args={{ imageUrl: '' }} {template} />

<Story
	name="Long Name"
	args={{ name: 'Super Long Product Name That Should Truncate Properly When Too Long' }}
	{template}
/>

<Story name="Min Quantity Reached" args={{ quantity: 1, minQuantity: 1 }} {template} />

<Story name="Max Quantity Reached" args={{ quantity: 10, maxQuantity: 10 }} {template} />

<Story name="Multiple Items">
	{#snippet template(args)}
		<div class="flex w-96 flex-col gap-3">
			<LineItem {...args} />
			<LineItem
				{...args}
				id="item-2"
				name="Lemon Lime Hydration Multiplier"
				description="Lemon Lime / 16 Pack"
				quantity={2}
				price={{ value: 19.99, symbol: '$' }}
				linePrice={{ value: 39.98, symbol: '$', formatted: '$39.98' }}
			/>
			<LineItem
				{...args}
				id="item-3"
				name="Strawberry Hydration Multiplier"
				description="Strawberry / 6 Pack"
				quantity={1}
				price={{ value: 14.99, symbol: '$' }}
				linePrice={{ value: 14.99, symbol: '$', formatted: '$14.99' }}
			/>
		</div>
	{/snippet}
</Story>
