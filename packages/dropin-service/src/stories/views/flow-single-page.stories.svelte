<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { fn } from '@storybook/test';

    import cartData from '../data/cart.json';

    import FlowSinglePage from '$lib/views/flow-single-page.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Views/FlowSinglePage',
        component: FlowSinglePage,
        parameters: {
            fullscreen: true,
        },
        args: {
            onAddPromoCode: fn(),
            onClearPromoCode: fn(),
            onUpdateQuantity: fn(),
            onFastCheckout: fn(),
            onBack: fn(),
            cart: cartData,
            isC2PInProgress: false,
            isPlaceOrderInProgress: false,
            isShippingInfoInProgress: false,
            isShippingMethodInProgress: false,
        },
    });
</script>

{#snippet template(args)}
    <FlowSinglePage {...args} />
{/snippet}

<Story name="Loading" args={{ isCartLoading: true, cart: {} }} children={template}></Story>
<Story name="Rendered" children={template}></Story>
