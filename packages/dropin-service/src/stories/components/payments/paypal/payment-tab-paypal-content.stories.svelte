<script module>
	// @ts-nocheck

	import PayPalContent from '$lib/components/payments/paypal/payment-tab-paypal-content.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story, Template } = defineMeta({
		title: 'Checkout V4/Payments/PayPal/PayPal Content',
		component: PayPalContent,
		tags: ['autodocs'],
		parameters: {
			fullscreen: true
		}
	});
</script>


{#snippet template(args)}
	<PayPalContent
		clientId="AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr"
		merchantId="kumar@harrysholding.com"
		{...args}
	/>
{/snippet}

<Story name="Default" children={template} />
<Story
	name="Connected to account"
	args={{
        email: 'john_smith@company.com'
	}}
    children={template}
/>
<Story
	name="Connect with no email"
	args={{
		connected: true
	}}
    children={template}
/>
<Story
	name="Loading PayPal SDK"
	args={{
		clientId: 'invalid',
		merchantId: 'invalid'
	}}
    children={template}
/>
