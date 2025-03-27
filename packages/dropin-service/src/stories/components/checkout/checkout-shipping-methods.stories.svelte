<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';
	import cart from '../assets/cart.json';

	import CheckoutShippingMethods from '$lib/components/checkout/checkout-shipping-methods.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Shipping/Methods',
		component: CheckoutShippingMethods,
		parameters: {
			layout: 'centered'
		},
		args: {
			selectedShippingMethod: '',
			onSelect: fn(),
			shippingMethods: [],
			isLoading: false,
			isUpdating: false
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<CheckoutShippingMethods {...args} />
	</div>
{/snippet}

<Story name="Loading" children={template} args={{ isLoading: true }} />

<Story name="No Methods" children={template} />

<Story
	name="Available Methods"
	children={template}
	args={{
		shippingMethods: cart.shipping_method_options,
		selectedShippingMethod: cart.shipping_method
	}}
/>

<Story
	name="Updating Selection"
	children={template}
	args={{
		shippingMethods: cart.shipping_method_options,
		selectedShippingMethod: cart.shipping_method,
		isUpdating: true
	}}
/>
