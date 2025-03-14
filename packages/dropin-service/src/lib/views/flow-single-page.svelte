<script>
    import Summary from '$lib/components/cart/summary.svelte';
    import EmailCheckout from '$lib/components/checkout/email-checkout.svelte';
    import FastCheckout from '$lib/components/checkout/fast-checkout-buttons.svelte';
    import FooterLinks from '$lib/components/footer/footer-links.svelte';
    import Overview from '$lib/components/header/overview.svelte';
    import Layout from '$lib/components/layout/root.svelte';
    import { useEmailWithValidation } from '$lib/views/flow-single-page.svelte.js';

    let {
        cart,
        marketingConsent,
        onUpdateQuantity,
        onAddPromoCode,
        onClearPromoCode,
        onFastCheckout,
        onBack,
        isShippingInfoInProgress,
        isShippingMethodInProgress,
        isPlaceOrderInProgress,
        isMarketingConsentSigned,
        isC2PAvailable,
        isC2PInProgress,
        isCartLoading,
    } = $props();

    let email = useEmailWithValidation(cart?.email);

    let allowShopPay = $derived(cart?.payment_method_options?.some((p) => p.type === 'ShopPay' || p.wallet === 'shoppay'));
    let allowPayPal = $derived(!!cart?.shop_properties?.paypal);
    let allowMerchantLogin = $derived(cart?.session?.requires_login && !cart?.session?.is_logged_in);
    let hasFastCheckout = $derived(allowShopPay || allowPayPal || allowMerchantLogin);

    /**
     * Boolean variable to control if the line items are expanded or not in the Order Summary above the place order button
     */
    let toggleLineItemsExpanded = $state(false);
</script>

<Layout isLoading={isCartLoading}>
    {#snippet aside({ summary })}
        <Overview
            total={cart?.total}
            images={cart?.line_items?.map?.((l) => l.image.medium || l.image.url)}
            quantity={cart?.line_items?.reduce?.((sum, l) => sum + l.quantity, 0)}
            merchantInfo={{ displayName: cart?.display_name || cart?.shop_id }}
            {onBack}
        >
            <div class="w-full bg-fy-primary">
                {@render summary('header')}
            </div>
        </Overview>
        <div class="grow"></div>
        <div class="text-center text-xs text-fy-on-primary-subtle max-md:hidden">
            <FooterLinks />
        </div>
    {/snippet}
    {#snippet bside({ summary })}
        {#if hasFastCheckout}
            <FastCheckout onclick={onFastCheckout} {allowMerchantLogin} {allowPayPal} {allowShopPay} disabled={isC2PInProgress || isPlaceOrderInProgress} />
            <div class="relative my-2 flex w-full flex-row justify-center text-fy-on-primary-subtle">
                <div class="absolute left-0 flex h-full w-full flex-col justify-center">
                    <hr class="h-[1px] w-full" />
                </div>
                <span class="z-10 bg-fy-background px-4 text-sm"> Or pay another way </span>
            </div>
        {/if}
        <EmailCheckout
            ref={null}
            email={email.value}
            errorMessage={email.error}
            storeName={cart.display_name}
            autocomplete={false}
            {marketingConsent}
            onChange={email.set}
            {isC2PAvailable}
            {isPlaceOrderInProgress}
            {isMarketingConsentSigned}
        />
        <div class="h-full @md:hidden">
            <button
                class="flex w-full items-center justify-between rounded-lg py-2"
                type="button"
                aria-expanded={toggleLineItemsExpanded}
                aria-controls="order-summary-content"
                onclick={(ev) => {
                    ev.stopPropagation();
                    toggleLineItemsExpanded = !toggleLineItemsExpanded;
                }}
                onkeydown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                        ev.preventDefault();
                        toggleLineItemsExpanded = !toggleLineItemsExpanded;
                    }
                }}
            >
                <h2 class="font-semibold">Order Summary</h2>
                <div class="flex items-center">
                    <span class="mr-2">{toggleLineItemsExpanded ? 'Hide' : 'Show'}</span>
                    <svg
                        class="fill-fy-on-primary-subtle transition duration-300"
                        class:rotate-180={!toggleLineItemsExpanded}
                        xmlns="http://www.w3.org/2000/svg"
                        width="10"
                        height="6"
                        viewBox="0 0 10 6"
                        aria-hidden="true"
                    >
                        <path
                            d="M1.6125 5.74287C1.41993 5.8873 1.18172 5.95742 0.941609 5.94035C0.7015 5.92329 0.475602 5.82019 0.305391 5.64998C0.13518 5.47977 0.0320787 5.25387 0.0150146 5.01376C-0.00204945 4.77365 0.0680685 4.53544 0.212498 4.34287L4.2125 0.34287C4.39943 0.159643 4.65075 0.057013 4.9125 0.057013C5.17425 0.057013 5.42557 0.159643 5.6125 0.34287L9.6125 4.34287C9.75693 4.53544 9.82705 4.77365 9.80998 5.01376C9.79292 5.25387 9.68982 5.47977 9.51961 5.64998C9.34939 5.82019 9.1235 5.92329 8.88339 5.94035C8.64328 5.95742 8.40507 5.8873 8.2125 5.74287L4.9125 2.45287L1.6125 5.75287V5.74287Z"
                        />
                    </svg>
                </div>
            </button>
            {@render summary('collapsible', toggleLineItemsExpanded)}
        </div>
    {/snippet}
    {#snippet summary(displayMode, toggleLineItemsExpanded)}
        <div class="flex flex-col">
            <div class="w-full">
                <Summary
                    {displayMode}
                    {toggleLineItemsExpanded}
                    calculating={isShippingInfoInProgress || isShippingMethodInProgress}
                    lineItems={cart?.line_items}
                    discount={cart?.cart_discount}
                    discountsBreakdown={cart?.cart_discount_breakdown}
                    storeCredit={cart?.store_credit}
                    rewardPoints={cart?.reward_points}
                    coupons={cart?.coupons}
                    subtotal={cart?.sub_total}
                    shippingMethod={cart?.shipping_method}
                    tax={cart?.tax}
                    total={cart?.total}
                    {onUpdateQuantity}
                    disabled={isShippingInfoInProgress || isShippingMethodInProgress || isPlaceOrderInProgress}
                    {onAddPromoCode}
                    {onClearPromoCode}
                    showImageBorder={cart?.shop_id !== 'kardiel.com'}
                />
            </div>
        </div>
    {/snippet}
</Layout>
