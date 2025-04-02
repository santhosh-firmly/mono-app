<script>
	// @ts-nocheck

	import PayPalContent from './payment-tab-paypal-content.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import '../theme.css';
</script>

<Meta
	title="Checkout V4/Payment/PayPal Content"
	component={PayPalContent}
	tags={['autodocs']}
	parameters={{
		fullscreen: true
	}}
/>

<Template let:args>
	<PayPalContent
		clientId="AfUEYT7nO4BwZQERn9Vym5TbHAG08ptiKa9gm8OARBYgoqiAJIjllRjeIMI4g294KAH1JdTnkzubt1fr"
		merchantId="kumar@harrysholding.com"
		{...args}
	/>
</Template>

<Story name="Default" />
<Story
	name="Connected to account"
	args={{
		email: 'john_smith@company.com',
		connected: true
	}}
/>
<Story
	name="Connect with no email"
	args={{
		connected: true
	}}
/>
<Story
	name="Loading PayPal SDK"
	args={{
		clientId: 'invalid',
		merchantId: 'invalid'
	}}
/>
