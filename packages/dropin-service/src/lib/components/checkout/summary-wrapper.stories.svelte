<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import SummaryWrapper from './summary-wrapper.svelte';
	import SummaryLineItem from './summary-line-item.svelte';
	import SummaryPrice from './summary-price.svelte';
	import SummaryPromoCode from './summary-promo-code.svelte';
	import SummaryResume from './summary-resume.svelte';

	const mockItems = [
		{
			image: 'https://via.placeholder.com/80',
			title: 'Product 1',
			description: 'Size: M, Color: Blue',
			price: 29.99,
			quantity: 2
		},
		{
			image: 'https://via.placeholder.com/80',
			title: 'Product 2',
			description: 'Size: L',
			price: 39.99,
			quantity: 1
		}
	];

	const { Story } = defineMeta({
		title: 'Checkout/Summary',
		component: SummaryWrapper,
		parameters: {
			layout: 'centered'
		}
	});

	const onQuantityChange = fn();
</script>

<!-- Default -->
{#snippet defaultTemplate()}
	{#snippet price()}
		<SummaryPrice itemsQuantity={3} totalPrice={99.97} />
	{/snippet}
	{#snippet lineItems()}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8">
			{#each mockItems as item, index (index)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
					onQuantityChange={(qty) => onQuantityChange({ ...item, quantity: qty })}
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={[]} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={99.97}
			subtotal={99.97}
			shipping={{ price: 0, description: '' }}
			tax={0}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {price} {lineItems} {promocode} {resume} />
	</div>
{/snippet}

<Story name="Default" template={defaultTemplate} />

<!-- With Promo Codes -->
{#snippet promoTemplate()}
	{#snippet price()}
		<SummaryPrice itemsQuantity={3} totalPrice={89.97} />
	{/snippet}
	{#snippet lineItems()}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8">
			{#each mockItems as item, index (index)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
					onQuantityChange={(qty) => onQuantityChange({ ...item, quantity: qty })}
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={['SAVE10', 'FREESHIP']} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={89.97}
			subtotal={99.97}
			shipping={{ price: 0, description: 'Free shipping' }}
			tax={0}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {price} {lineItems} {promocode} {resume} />
	</div>
{/snippet}

<Story name="With Promo Codes" template={promoTemplate} />

<!-- Without Line Items -->
{#snippet noLineItemsTemplate()}
	{#snippet price()}
		<SummaryPrice itemsQuantity={3} totalPrice={99.97} />
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={[]} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={99.97}
			subtotal={99.97}
			shipping={{ price: 0, description: '' }}
			tax={0}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {price} {promocode} {resume} />
	</div>
{/snippet}

<Story name="Without Line Items" template={noLineItemsTemplate} />

<!-- Initial Loading (all values show skeleton) -->
{#snippet initialLoadingTemplate()}
	{#snippet price()}
		<SummaryPrice itemsQuantity={3} totalPrice={99.97} isInitialLoading={true} />
	{/snippet}
	{#snippet lineItems()}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8">
			{#each mockItems as item, index (index)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
					onQuantityChange={(qty) => onQuantityChange({ ...item, quantity: qty })}
					disabled={true}
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={[]} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={99.97}
			subtotal={99.97}
			shipping={{ price: 0, description: '' }}
			tax={0}
			isInitialLoading={true}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {price} {lineItems} {promocode} {resume} />
	</div>
{/snippet}

<Story name="Initial Loading" template={initialLoadingTemplate} />

<!-- Updating (price visible, only shipping/tax show skeleton) -->
{#snippet updatingTemplate()}
	{#snippet price()}
		<SummaryPrice itemsQuantity={3} totalPrice={99.97} />
	{/snippet}
	{#snippet lineItems()}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8">
			{#each mockItems as item, index (index)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
					onQuantityChange={(qty) => onQuantityChange({ ...item, quantity: qty })}
					disabled={true}
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={[]} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={99.97}
			subtotal={99.97}
			shipping={{ price: 0, description: '' }}
			tax={0}
			isCalculating={true}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {price} {lineItems} {promocode} {resume} />
	</div>
{/snippet}

<Story name="Updating" template={updatingTemplate} />

<!-- Without Price -->
{#snippet noPriceTemplate()}
	{#snippet lineItems()}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8">
			{#each mockItems as item, index (index)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
					onQuantityChange={(qty) => onQuantityChange({ ...item, quantity: qty })}
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={[]} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={99.97}
			subtotal={99.97}
			shipping={{ price: 0, description: '' }}
			tax={0}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {lineItems} {promocode} {resume} />
	</div>
{/snippet}

<Story name="Without Price" template={noPriceTemplate} />

<!-- Read Only (no quantity change) -->
{#snippet readOnlyTemplate()}
	{#snippet price()}
		<SummaryPrice itemsQuantity={3} totalPrice={99.97} />
	{/snippet}
	{#snippet lineItems()}
		<div class="border-b-border flex flex-col gap-4 border-b pb-8">
			{#each mockItems as item, index (index)}
				<SummaryLineItem
					image={item.image}
					title={item.title}
					description={item.description}
					price={item.price}
					quantity={item.quantity}
				/>
			{/each}
		</div>
	{/snippet}
	{#snippet promocode()}
		<SummaryPromoCode promocodes={[]} />
	{/snippet}
	{#snippet resume()}
		<SummaryResume
			total={99.97}
			subtotal={99.97}
			shipping={{ price: 0, description: '' }}
			tax={0}
		/>
	{/snippet}
	<div class="w-80">
		<SummaryWrapper {price} {lineItems} {promocode} {resume} />
	</div>
{/snippet}

<Story name="Read Only" template={readOnlyTemplate} />
