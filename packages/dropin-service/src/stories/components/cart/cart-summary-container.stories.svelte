<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import SummaryContainer from '$lib/components/cart/cart-summary-container.svelte';
	import SummaryPromoCode from '$lib/components/cart/cart-summary-promocode.svelte';
	import SummaryResume from '$lib/components/cart/cart-summary-resume.svelte';

	const { Story } = defineMeta({
		title: 'Components/Cart/Summary/Container',
		component: SummaryContainer,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			items: [
				{
					sku: 'EY_BP_14ct',
					image: 'https://cdn.shopify.com/s/files/1/1338/1013/files/EY_BP_14ct_PDP_bf83aa1f-f190-48fe-90ef-8687109775cc_large.jpg?v=1726869385',
					title: 'Blackberry Peach Hydration Multiplier® +Energy',
					description: 'Blackberry Peach / 14PK',
					price: 24.99,
					quantity: 4
				},
				{
					sku: 'LM_GC_30ct',
					image: 'https://cdn.shopify.com/s/files/1/0123/4567/files/LM_GC_30ct_PDP_a7b8c9d0-e1f2-3g4h-5i6j-7k8l9m0n1o2p_large.jpg?v=1726123456',
					title: 'Green Citrus Wellness Booster® +Immunity',
					description: 'Lime Mint / 30PK',
					price: 34.99,
					quantity: 2
				}
			],
			isCalculating: false,
			isSubmitting: false,
			onSubmit: fn(),
			onRemoveAll: fn(),
			onQuantityChange: fn(),
			shipping: {
				price: 0,
				description: 'Free shipping on orders over $50'
			},
			subtotal: 59.98,
			tax: 0,
			total: 59.98
		}
	});
</script>

{#snippet template(args)}
	<div class="p-4">
		<SummaryContainer items={args.items} onQuantityChange={args.onQuantityChange}>
			{#snippet promocode()}
				<SummaryPromoCode
					promocode={args.promocode}
					promocodes={args.promocodes}
					onSubmit={args.onSubmit}
					onRemoveAll={args.onRemoveAll}
					isSubmitting={args.isSubmitting}
					isRemovingAll={args.isRemovingAll}
				/>
			{/snippet}
			{#snippet resume()}
				<SummaryResume
					isCalculating={args.isCalculating}
					shipping={args.shipping}
					subtotal={args.subtotal}
					tax={args.tax}
					total={args.total}
				/>
			{/snippet}
		</SummaryContainer>
	</div>
{/snippet}

<Story name="Loaded" children={template} />
<Story name="Calculating" children={template} args={{ isCalculating: true }} />
<Story
	name="Submitting promo code"
	children={template}
	args={{ isSubmitting: true, promocode: 'WINTER2023' }}
/>
<Story name="Promo code applied" children={template} args={{ promocodes: ['WINTER2023'] }} />
<Story
	name="Removing all promo codes"
	children={template}
	args={{ promocodes: ['WINTER2023'], isRemovingAll: true }}
/>
