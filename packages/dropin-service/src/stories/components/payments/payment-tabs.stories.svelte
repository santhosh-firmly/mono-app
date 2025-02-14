<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';

    import Checkbox from '$lib/components/common/checkbox.svelte';
    import PaymentTabs from '$lib/components/payments/payment-tabs.svelte';
    import { formatCurrency } from '$lib/utils';

    const { Story } = defineMeta({
        title: 'Checkout V4/Payments/Payment Tabs',
        component: PaymentTabs,
        tags: ['autodocs'],
        parameters: {
            fullscreen: true,
        },
    });
</script>

{#snippet template(args)}
    <PaymentTabs {...args} />
{/snippet}

<Story
    name="Single Tab"
    args={{
        allowedPaymentMethods: ['CreditCard'],
    }}
    children={template}
/>

<Story
    name="Multiple Tabs"
    args={{
        allowedPaymentMethods: ['CreditCard', 'PayPal', 'ShopPay'],
    }}
/>

<Story name="With Store Credit">
    <PaymentTabs>
        {#snippet underTabs()}
            <div>
                <Checkbox disabled={true} isChecked={true}>
                    {#snippet titleSnippet()}
                        <span class="text-fy-on-secondary text-sm font-medium">
                            Apply <span class="font-bold"
                                >{formatCurrency({
                                    currency: 'USD',
                                    value: 10.0,
                                })}</span
                            >
                            from store credit ({formatCurrency({ currency: 'USD', value: 39.95 })} available)
                        </span>
                    {/snippet}
                </Checkbox>
            </div>
        {/snippet}
    </PaymentTabs>
</Story>
