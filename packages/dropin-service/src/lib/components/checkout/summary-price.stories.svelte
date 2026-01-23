<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import SummaryPrice from './summary-price.svelte';

	const { Story } = defineMeta({
		title: 'Checkout/Summary/Price',
		component: SummaryPrice,
		parameters: {
			layout: 'centered'
		},
		args: {
			itemsQuantity: 3,
			totalPrice: 99.99,
			isInitialLoading: false
		},
		argTypes: {
			itemsQuantity: {
				control: 'number',
				description: 'Number of items in cart'
			},
			totalPrice: {
				control: 'number',
				description: 'Total price of cart'
			},
			isInitialLoading: {
				control: 'boolean',
				description: 'Whether this is the first cart loading (shows skeleton)'
			}
		}
	});
</script>

<script>
	let priceChangeValue = $state(99.99);

	function addToPrice(amount) {
		priceChangeValue = Math.max(0, priceChangeValue + amount);
	}

	function setRandomPrice() {
		priceChangeValue = Math.round(Math.random() * 500 * 100) / 100;
	}
</script>

{#snippet template(args)}
	<div class="w-64">
		<SummaryPrice {...args} />
	</div>
{/snippet}

{#snippet priceChangeTemplate(args)}
	<div class="flex w-64 flex-col gap-4">
		<SummaryPrice {...args} totalPrice={priceChangeValue} />
		<p class="text-center text-xs text-gray-500">Click buttons to see counting animation</p>
		<div class="flex flex-wrap justify-center gap-2">
			<button
				class="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
				onclick={() => addToPrice(-25)}
			>
				-$25
			</button>
			<button
				class="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200"
				onclick={() => addToPrice(-10)}
			>
				-$10
			</button>
			<button
				class="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
				onclick={() => addToPrice(10)}
			>
				+$10
			</button>
			<button
				class="rounded bg-green-100 px-3 py-1 text-sm text-green-700 hover:bg-green-200"
				onclick={() => addToPrice(25)}
			>
				+$25
			</button>
		</div>
		<button
			class="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
			onclick={setRandomPrice}
		>
			Random Price
		</button>
	</div>
{/snippet}

<!-- Default -->
<Story name="Default" {template} />

<!-- Single Item -->
<Story name="Single Item" args={{ itemsQuantity: 1, totalPrice: 29.99 }} {template} />

<!-- Initial Loading -->
<Story
	name="Initial Loading"
	args={{ itemsQuantity: 2, totalPrice: 59.99, isInitialLoading: true }}
	{template}
/>

<!-- Counting Animation Effect -->
<Story name="Counting Animation" args={{ itemsQuantity: 3 }} template={priceChangeTemplate} />
