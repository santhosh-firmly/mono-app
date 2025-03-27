<script module>
	import CartResume from '$lib/components/cart/cart-resume.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Components/Cart/Resume',
		component: CartResume,
		parameters: {
			layout: 'fullscreen'
		}
	});
</script>

<Story name="Default">
	<CartResume itemsQuantity={1} totalPrice={100} />
</Story>

<Story name="Calculating">
	<CartResume itemsQuantity={1} totalPrice={100} isCalculating />
</Story>
