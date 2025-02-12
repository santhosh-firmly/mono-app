<script module>
	// @ts-nocheck

	import PaymentTabs from '$lib/components/payments/payment-tabs.svelte';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { formatCurrency } from '$lib/utils';
	import Checkbox from '$lib/components/common/checkbox.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Payments/Payment Tabs',
        component: PaymentTabs,
        tags: ['autodocs'],
        parameters: {
            fullscreen: true
        }
    });
</script>

{#snippet template(args)}
	<PaymentTabs {...args} />
{/snippet}

<Story
	name="Single Tab"
	args={{
		allowedPaymentMethods: ['CreditCard']
	}}
    children={template}
/>

<Story
	name="Multiple Tabs"
	args={{
		allowedPaymentMethods: ['CreditCard', 'PayPal', 'ShopPay']
	}}
    children={template}
/>

<Story name="With Store Credit" children={template}>
	<PaymentTabs>
		{#snippet underTabs()}
			<div>
				<Checkbox disabled={true} isChecked={true}>
					<span slot="title" class="font-medium text-fy-on-secondary text-sm">
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
		{/snippet}
	</PaymentTabs>
</Story>
