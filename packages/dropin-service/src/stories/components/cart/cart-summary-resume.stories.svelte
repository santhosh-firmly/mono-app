<script module>
	import CartSummaryResume from '$lib/components/cart/cart-summary-resume.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/Cart/Summary/Resume',
		component: CartSummaryResume,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			total: 100,
			subtotal: 100,
			shipping: 10,
			tax: 10,
			isCalculating: false,
			hiddenTotal: false
		}
	});
</script>

<Story name="Default" />
<Story name="Calculating" args={{ isCalculating: true }} />
<Story name="Hidden Total" args={{ hiddenTotal: true }} />
