<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect } from '@storybook/jest';
    import { within } from '@storybook/testing-library';

    import cart from '../../data/cart.json';
    import subscriptionLineItem from '../../data/line-item-subscription.json';

    import Summary from '$lib/components/Header/summary.svelte';

    const lineItems = cart.line_items;

    const { Story } = defineMeta({
        title: 'Checkout V4/Header/Summary',
        component: Summary,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <Summary subtotal={cart.sub_total} tax={cart.tax} total={cart.total} {...args} />
{/snippet}

<Story
    name="Single Line Item"
    args={{
        lineItems: [lineItems[0]],
    }}
    children={template}
/>

<Story
    name="Two Line Items"
    args={{
        lineItems: [lineItems[0], { ...lineItems[0], line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }],
    }}
    children={template}
/>

<Story
    name="With Shipping Information"
    args={{
        lineItems: [lineItems[0], { ...lineItems[0], line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }],
        shippingMethod: {
            description: 'Economy shipping',
            price: {
                currency: 'USD',
                value: 100.5,
            },
        },
        tax: {
            currency: 'USD',
            value: 13.95,
        },
    }}
    children={template}
/>

<Story
    name="With Subscription"
    args={{
        lineItems: [lineItems[0], subscriptionLineItem, { ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }],
        shippingMethod: {
            description: 'Economy shipping',
            price: {
                currency: 'USD',
                value: 100.5,
            },
        },
        tax: {
            currency: 'USD',
            value: 13.95,
        },
    }}
    children={template}
/>

<Story
    name="With Store Credit and Reward Points"
    args={{
        lineItems: [lineItems[0], subscriptionLineItem, { ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }],
        shippingMethod: {
            description: 'Economy shipping',
            price: {
                currency: 'USD',
                value: 100.5,
            },
        },
        storeCredit: {
            currency: 'USD',
            value: 10.0,
        },
        rewardPoints: {
            currency: 'USD',
            value: 39.95,
        },
        tax: {
            currency: 'USD',
            value: 13.95,
        },
    }}
    children={template}
/>

<Story
    name="With Zero Dollar Cart"
    args={{
        lineItems: [lineItems[0], subscriptionLineItem, { ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }],
        shippingMethod: {
            description: 'Economy shipping',
            price: {
                currency: 'USD',
                value: 100.5,
            },
        },
        total: {
            currency: 'USD',
            value: 0,
        },
    }}
    children={template}
/>

<Story
    name="With Discounts Breakdown"
    args={{
        lineItems: [lineItems[0], subscriptionLineItem, { ...subscriptionLineItem, line_item_id: 'b82c88fb-7a90-4652-8c1a-eebd4a3a4791' }],
        shippingMethod: {
            description: 'Economy shipping',
            price: {
                currency: 'USD',
                value: 100.5,
            },
        },
        total: {
            currency: 'USD',
            value: 0,
        },
        discountsBreakdown: [
            {
                is_vip: false,
                step: 1,
                label: 'First Set for $19.99',
                discount: {
                    currency: 'USD',
                    value: 39.96,
                },
            },
            {
                is_vip: true,
                step: 2,
                label: '2 VIP sets 45% OFF',
                discount: {
                    currency: 'USD',
                    value: 53.96,
                },
            },
        ],
    }}
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Validate discounts breakdown are present', async () => {
            const elements = canvas.queryAllByTestId('discount');

            expect(elements.length).toEqual(2);
            expect(elements[0].textContent).toEqual('First Set for $19.99 (-$39.96)');
            expect(elements[1].textContent).toEqual('2 VIP sets 45% OFF (-$53.96)');
        });
    }}
    children={template}
/>

<Story name="Skeleton">
    <Summary />
</Story>
