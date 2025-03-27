<script module>
	import CartSummaryPromoCode from '$lib/components/cart/cart-summary-promocode.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	const { Story } = defineMeta({
		title: 'Components/Cart/Summary/PromoCode',
		component: CartSummaryPromoCode,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			promocodes: [],
			isRemovingAll: false,
			isSubmitting: false,
			onSubmit: fn(),
			onRemoveAll: fn(),
			promocode: ''
		}
	});
</script>

<Story name="Default" />
<Story name="Submitting" args={{ isSubmitting: true, promocode: 'REVIEW2024' }} />
<Story name="With Promocodes" args={{ promocodes: ['BLACKFRIDAY2024'] }} />
<Story name="Removing All" args={{ isRemovingAll: true, promocodes: ['BLACKFRIDAY2024'] }} />
