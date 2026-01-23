<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SummaryResume from './summary-resume.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Summary/Resume',
		component: SummaryResume,
		parameters: {
			layout: 'centered'
		},
		args: {
			total: 109.97,
			subtotal: 99.97,
			shipping: { price: 0, description: '' },
			tax: 10.0,
			isCalculating: false,
			isInitialLoading: false,
			hiddenTotal: false
		},
		argTypes: {
			total: {
				control: 'number',
				description: 'Total price'
			},
			subtotal: {
				control: 'number',
				description: 'Subtotal price'
			},
			shipping: {
				control: 'object',
				description: 'Shipping info (price and description)'
			},
			tax: {
				control: 'number',
				description: 'Tax amount'
			},
			isCalculating: {
				control: 'boolean',
				description:
					'Whether shipping/tax are calculating (shows skeleton only for shipping and tax)'
			},
			isInitialLoading: {
				control: 'boolean',
				description:
					'Whether this is the first cart loading (shows skeleton for all values)'
			},
			hiddenTotal: {
				control: 'boolean',
				description: 'Whether to hide total'
			}
		}
	});
</script>

<script>
	let subtotalValue = $state(99.97);
	let totalValue = $state(109.97);

	function adjustPrices(amount) {
		subtotalValue = Math.max(0, subtotalValue + amount);
		totalValue = Math.max(0, totalValue + amount);
	}

	function setRandomPrices() {
		const newSubtotal = Math.round(Math.random() * 300 * 100) / 100;
		const newTax = Math.round(newSubtotal * 0.1 * 100) / 100;
		subtotalValue = newSubtotal;
		totalValue = newSubtotal + newTax;
	}
</script>

{#snippet template(args)}
	<div class="w-72">
		<SummaryResume {...args} />
	</div>
{/snippet}

{#snippet priceChangeTemplate(args)}
	<div class="flex w-72 flex-col gap-4">
		<SummaryResume {...args} subtotal={subtotalValue} total={totalValue} />
		<p class="text-center text-xs text-gray-500">Click buttons to see counting animation</p>
		<div class="flex flex-wrap justify-center gap-2">
			<button
				class="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
				onclick={() => adjustPrices(-25)}
			>
				-$25
			</button>
			<button
				class="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
				onclick={() => adjustPrices(-10)}
			>
				-$10
			</button>
			<button
				class="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
				onclick={() => adjustPrices(10)}
			>
				+$10
			</button>
			<button
				class="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
				onclick={() => adjustPrices(25)}
			>
				+$25
			</button>
		</div>
		<button
			class="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
			onclick={setRandomPrices}
		>
			Random Prices
		</button>
	</div>
{/snippet}

<!-- Default -->
<Story name="Default" {template} />

<!-- With Free Shipping -->
<Story
	name="With Free Shipping"
	args={{ shipping: { price: 0, description: 'Standard Delivery' } }}
	{template}
/>

<!-- With Paid Shipping -->
<Story
	name="With Paid Shipping"
	args={{ total: 119.97, shipping: { price: 10.0, description: 'Express Delivery' } }}
	{template}
/>

<!-- Calculating (shipping/tax only) -->
<Story name="Calculating" args={{ isCalculating: true }} {template} />

<!-- Initial Loading (all values) -->
<Story name="Initial Loading" args={{ isInitialLoading: true }} {template} />

<!-- Hidden Total -->
<Story name="Hidden Total" args={{ hiddenTotal: true }} {template} />

<!-- Counting Animation Effect -->
<Story
	name="Counting Animation"
	args={{ shipping: { price: 10.0, description: 'Standard Delivery' }, tax: 10.0 }}
	template={priceChangeTemplate}
/>
