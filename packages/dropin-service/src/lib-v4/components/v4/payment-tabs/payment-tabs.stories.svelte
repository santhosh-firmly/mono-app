<script>
	// @ts-nocheck

	import PaymentTabs from './payment-tabs.svelte';
	import { Meta, Story, Template } from '@storybook/addon-svelte-csf';
	import '../theme.scss';
	import { formatCurrency } from '$lib-v4/utils';
	import Checkbox from '../checkbox.svelte';
</script>

<Meta
	title="Checkout V4/Payment/Payment Tabs"
	component={PaymentTabs}
	tags={['autodocs']}
	parameters={{
		fullscreen: true
	}}
/>

<Template let:args>
	<PaymentTabs {...args} />
</Template>

<Story
	name="Single Tab"
	args={{
		allowedPaymentMethods: ['CreditCard']
	}}
/>

<Story
	name="Multiple Tabs"
	args={{
		allowedPaymentMethods: ['CreditCard', 'PayPal', 'ShopPay']
	}}
/>

<Story name="With Store Credit">
	<PaymentTabs>
		<div slot="under-tabs">
			<Checkbox disabled={true} isChecked={true}>
				<span slot="title" class="text-fy-on-secondary text-sm font-medium">
					Apply <span class="font-bold"
						>{formatCurrency({
							currency: 'USD',
							value: 10.0
						})}</span
					>
					from store credit ({formatCurrency({ currency: 'USD', value: 39.95 })} available)
				</span>
			</Checkbox>
		</div>
	</PaymentTabs>
</Story>
