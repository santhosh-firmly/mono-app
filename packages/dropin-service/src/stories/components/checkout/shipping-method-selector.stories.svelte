<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { fn } from '@storybook/test';

    import ShippingMethodSelector from '$lib/components/checkout/shipping-method-selector.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Checkout/Shipping Method Selector',
        component: ShippingMethodSelector,
        tags: ['autodocs'],
        args: {
            onSetShippingMethod: fn(),
        },
    });
</script>

{#snippet template(args)}
    <ShippingMethodSelector {...args} />
{/snippet}

<Story
    name="One option"
    args={{
        shippingMethods: [
            {
                sku: 'shopify-Economy-0.00',
                description: 'Economy',
                price: {
                    currency: 'USD',
                    value: 0,
                },
            },
        ],
        selectedShippingMethod: 'shopify-Economy-0.00',
    }}
/>
<Story
    name="Two options"
    args={{
        shippingMethods: [
            {
                sku: 'shopify-Economy-0.00',
                description: 'Economy',
                price: {
                    currency: 'USD',
                    value: 0,
                },
            },
            {
                sku: 'shopify-Economy-2.00',
                description: 'Not so Economy',
                price: {
                    currency: 'USD',
                    value: 2,
                },
            },
        ],
        selectedShippingMethod: 'shopify-Economy-0.00',
    }}
    children={template}
/>
<Story
    name="Three options"
    args={{
        shippingMethods: [
            {
                sku: 'shopify-Economy-0.00',
                description: 'Economy',
                price: {
                    currency: 'USD',
                    value: 0,
                },
            },
            {
                sku: 'shopify-Economy-2.00',
                description: 'Not so Economy',
                price: {
                    currency: 'USD',
                    value: 2,
                },
            },
            {
                sku: 'shopify-Economy-20.00',
                description: 'Definitely not Economy',
                price: {
                    currency: 'USD',
                    value: 2,
                },
            },
        ],
        selectedShippingMethod: 'shopify-Economy-2.00',
    }}
    children={template}
/>
<Story
    name="Multiple lines"
    args={{
        shippingMethods: [
            {
                sku: 'shopify-Economy-0.00',
                description: 'Economy',
                estimated_delivery: 'Some time this year',
                price: {
                    currency: 'USD',
                    value: 0,
                },
            },
            {
                sku: 'shopify-Economy-2.00',
                description: 'Not so Economy',
                estimated_delivery: 'Some time this month',
                price: {
                    currency: 'USD',
                    value: 2,
                },
            },
            {
                sku: 'shopify-Economy-20.00',
                description: 'Definitely not Economy',
                estimated_delivery: 'Some time this week',
                price: {
                    currency: 'USD',
                    value: 20,
                },
            },
        ],
        selectedShippingMethod: 'shopify-Economy-2.00',
    }}
    children={template}
/>
<Story
    name="Single and multiple lines"
    args={{
        shippingMethods: [
            {
                sku: 'shopify-Economy-0.00',
                description: 'Economy',
                estimated_delivery: 'Some time this year',
                price: {
                    currency: 'USD',
                    value: 0,
                },
            },
            {
                sku: 'shopify-Economy-2.00',
                description: 'Not so Economy',
                price: {
                    currency: 'USD',
                    value: 2,
                },
            },
            {
                sku: 'shopify-Economy-20.00',
                description: 'Definitely not Economy',
                estimated_delivery: 'Some time this week',
                price: {
                    currency: 'USD',
                    value: 20,
                },
            },
        ],
        selectedShippingMethod: 'shopify-Economy-2.00',
    }}
    children={template}
/>
<Story
    name="Loading with items"
    args={{
        inProgress: true,
        shippingMethods: [
            {
                sku: 'shopify-Economy-0.00',
                description: 'Economy',
                estimated_delivery: 'Some time this year',
                price: {
                    currency: 'USD',
                    value: 0,
                },
            },
            {
                sku: 'shopify-Economy-2.00',
                description: 'Not so Economy',
                price: {
                    currency: 'USD',
                    value: 2,
                },
            },
            {
                sku: 'shopify-Economy-20.00',
                description: 'Definitely not Economy',
                estimated_delivery: 'Some time this week',
                price: {
                    currency: 'USD',
                    value: 20,
                },
            },
        ],
        selectedShippingMethod: 'shopify-Economy-2.00',
    }}
    children={template}
/>
<Story
    name="Loading with no items"
    args={{
        inProgress: true,
    }}
    children={template}
/>
