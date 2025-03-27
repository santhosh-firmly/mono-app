<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	import CheckoutFooter from '$lib/components/checkout/checkout-footer.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Footer',
		component: CheckoutFooter,
		parameters: {
			layout: 'centered'
		},
		args: {
			totalPrice: 49.99,
			disabled: false
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<CheckoutFooter totalPrice={args.totalPrice} disabled={args.disabled} />
	</div>
{/snippet}

<Story name="Default" children={template} />

<Story
	name="Large Amount"
	children={template}
	args={{
		totalPrice: 1299.99
	}}
/>

<Story
	name="Free"
	children={template}
	args={{
		totalPrice: 0
	}}
/>

<Story
	name="Disabled"
	children={template}
	args={{
		disabled: true
	}}
/>
