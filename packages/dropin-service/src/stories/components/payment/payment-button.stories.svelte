<script module>
    // @ts-nocheck
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import PaymentButton from '$lib/components/payment/payment-button.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Payment/Payment Button',
        tags: ['autodocs'],
        component: PaymentButton,
    });
</script>

{#snippet template(args)}
    <div class="adoreme-dark">
        <PaymentButton {...args} />
    </div>
{/snippet}

<Story
    name="Default"
    args={{
        total: {
            currency: 'USD',
            value: 133.33,
        },
    }}
    children={template}
/>

<Story
    name="Disabled"
    args={{
        disabled: true,
        total: {
            currency: 'USD',
            value: 133.33,
        },
    }}
    children={template}
/>

<Story
    name="Place Order in Progress"
    args={{
        inProgress: true,
        total: {
            currency: 'USD',
            value: 133.33,
        },
    }}
    children={template}
/>

<Story
    name="Order placed"
    args={{
        isOrderPlaced: true,
        total: {
            currency: 'USD',
            value: 133.33,
        },
    }}
    children={template}
/>

<Story
    name="Zero dollar order"
    args={{
        total: {
            currency: 'USD',
            value: 0,
        },
    }}
    children={template}
/>

<Story name="No total" children={template} />
