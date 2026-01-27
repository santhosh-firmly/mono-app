<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SummaryCollapsible from './summary-collapsible.svelte';
	import SummaryLineItem from './summary-line-item.svelte';
	import SummaryResume from './summary-resume.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Summary/Collapsible',
		component: SummaryCollapsible,
		parameters: {
			layout: 'centered'
		}
	});

	const mockLineItems = [
		{
			image: 'https://picsum.photos/seed/product1/200',
			title: 'Premium Wireless Headphones',
			description: 'Black / Large',
			price: 299.99,
			quantity: 1
		},
		{
			image: 'https://picsum.photos/seed/product2/200',
			title: 'Leather Wallet',
			description: 'Brown',
			price: 79.99,
			quantity: 2
		}
	];
</script>

{#snippet template(args)}
	{#snippet collapsibleContent()}
		<div class="rounded-lg bg-gray-100 p-4">
			<p class="text-sm">Order items would be shown here</p>
		</div>
	{/snippet}
	<div class="w-80">
		<SummaryCollapsible {...args} {collapsibleContent} />
	</div>
{/snippet}

{#snippet withLineItemsTemplate(args)}
	{#snippet collapsibleContent()}
		<div class="flex flex-col gap-4">
			{#each mockLineItems as item (item.title)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
					hideQuantity
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet fixedContent()}
		<SummaryResume
			subtotal={459.97}
			shipping={{ price: 0, description: 'Free Shipping' }}
			tax={36.8}
			total={496.77}
		/>
	{/snippet}
	<div class="w-96">
		<SummaryCollapsible {...args} {collapsibleContent} {fixedContent} />
	</div>
{/snippet}

<Story name="Default" {template} />
<Story name="With Line Items" template={withLineItemsTemplate} />
