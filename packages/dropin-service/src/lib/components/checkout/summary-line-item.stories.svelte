<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import SummaryLineItem from './summary-line-item.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Summary/Line Item',
		component: SummaryLineItem,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		args: {
			image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
			title: 'Classic White T-Shirt',
			description: 'Size: M, Color: White',
			price: 29.99,
			quantity: 2,
			onQuantityChange: fn(),
			onUndo: fn(),
			disabled: false,
			pendingRemoval: false,
			isUndoing: false,
			error: ''
		},
		argTypes: {
			image: { control: 'text' },
			title: { control: 'text' },
			description: { control: 'text' },
			price: { control: 'number' },
			quantity: { control: 'number' },
			disabled: { control: 'boolean' },
			pendingRemoval: { control: 'boolean' },
			isUndoing: { control: 'boolean' },
			hideQuantity: { control: 'boolean' },
			error: { control: 'text' }
		}
	});
</script>

{#snippet template(args)}
	<div class="w-96">
		<SummaryLineItem {...args} />
	</div>
{/snippet}

<Story name="Default" {template} />

<Story name="Without Description" args={{ description: '' }} {template} />

<Story name="High Quantity" args={{ quantity: 10, price: 299.9 }} {template} />

<Story name="Disabled" args={{ disabled: true }} {template} />

<Story
	name="With Error"
	args={{ error: 'The amount of the required item is not available in stock.' }}
	{template}
/>

<Story
	name="Pending Removal"
	args={{
		pendingRemoval: true,
		title: 'Classic White T-Shirt'
	}}
	{template}
/>

<Story
	name="Pending Removal (Undoing)"
	args={{
		pendingRemoval: true,
		isUndoing: true,
		title: 'Classic White T-Shirt'
	}}
	{template}
/>

<Story name="Hidden Quantity" args={{ hideQuantity: true }} {template} />

{#snippet readOnlyTemplate(args)}
	<div class="w-96">
		<SummaryLineItem
			image={args.image}
			title={args.title}
			description={args.description}
			price={args.price}
			quantity={args.quantity}
		/>
	</div>
{/snippet}

<Story name="Read Only" template={readOnlyTemplate} />

{#snippet multipleItemsTemplate(args)}
	<div class="flex w-96 flex-col gap-4">
		<SummaryLineItem
			image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop"
			title="Classic White T-Shirt"
			description="Size: M"
			price={29.99}
			quantity={1}
			onQuantityChange={args.onQuantityChange}
		/>
		<SummaryLineItem
			image="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&h=200&fit=crop"
			title="Blue Denim Jacket"
			description="Size: L"
			price={89.99}
			quantity={1}
			pendingRemoval={true}
			onUndo={args.onUndo}
		/>
		<SummaryLineItem
			image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"
			title="Running Sneakers"
			description="Size: 10"
			price={129.99}
			quantity={2}
			onQuantityChange={args.onQuantityChange}
		/>
	</div>
{/snippet}

<Story name="Multiple Items (with Pending Removal)" template={multipleItemsTemplate} />

{#snippet multipleItemsWithErrorTemplate(args)}
	<div class="flex w-96 flex-col gap-4">
		<SummaryLineItem
			image="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop"
			title="Classic White T-Shirt"
			description="Size: M"
			price={29.99}
			quantity={1}
			onQuantityChange={args.onQuantityChange}
		/>
		<SummaryLineItem
			image="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=200&h=200&fit=crop"
			title="Blue Denim Jacket"
			description="Size: L"
			price={89.99}
			quantity={0}
			onQuantityChange={args.onQuantityChange}
			error="The amount of the required item is not available in stock."
		/>
		<SummaryLineItem
			image="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"
			title="Running Sneakers"
			description="Size: 10"
			price={129.99}
			quantity={2}
			onQuantityChange={args.onQuantityChange}
		/>
	</div>
{/snippet}

<Story name="Multiple Items (with Error)" template={multipleItemsWithErrorTemplate} />
