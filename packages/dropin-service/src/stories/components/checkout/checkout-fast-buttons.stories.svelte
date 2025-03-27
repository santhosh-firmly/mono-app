<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { fn } from '@storybook/test';

	import CheckoutFastButtons from '$lib/components/checkout/checkout-fast-buttons.svelte';

	const { Story } = defineMeta({
		title: 'Components/Checkout/Fast Buttons',
		component: CheckoutFastButtons,
		parameters: {
			layout: 'centered'
		},
		args: {
			isLoading: false,
			onclick: fn(),
			use: ['shoppay', 'paypal']
		}
	});
</script>

{#snippet template(args)}
	<div class="w-[380px] max-w-md p-4">
		<CheckoutFastButtons isLoading={args.isLoading} onclick={args.onclick} use={args.use} />
	</div>
{/snippet}

<Story name="Default" children={template} />

<Story
	name="Loading"
	children={template}
	args={{
		isLoading: true
	}}
/>

<Story
	name="Shop Pay Only"
	children={template}
	args={{
		use: ['shoppay']
	}}
/>

<Story
	name="PayPal Only"
	children={template}
	args={{
		use: ['paypal']
	}}
/>
