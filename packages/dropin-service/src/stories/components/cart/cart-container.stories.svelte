<script module>
	import CartContainer from '$lib/components/cart/cart-container.svelte';
	import CartResume from '$lib/components/cart/cart-resume.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import cart from '../../assets/cart.json';

	const { Story } = defineMeta({
		title: 'Components/Cart/Container',
		component: CartContainer,
		parameters: {
			layout: 'fullscreen'
		},
		args: {
			images: cart?.line_items?.map((item) => item.image?.url)
		}
	});
</script>

<Story name="Default">
	<CartContainer images={cart?.line_items?.map((item) => item.image?.url)}>
		<CartResume itemsQuantity={cart?.line_items?.length} totalPrice={cart?.total?.value} />
	</CartContainer>
</Story>
