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
        onUpdateQuantity,
        onAddPromoCode,
        onClearPromoCode,
        onFastCheckout,
        onBack,
        isShippingInfoInProgress,
        isShippingMethodInProgress,
        isPlaceOrderInProgress,
        isC2PAvailable,
        isC2PInProgress,
        isCartLoading,
    } = $props();

    let email = useEmailWithValidation(cart?.email);

    let allowShopPay = $derived(cart?.payment_method_options?.some((p) => p.type === 'ShopPay' || p.wallet === 'shoppay'));
    let allowPayPal = $derived(!!cart?.shop_properties?.paypal);
    let allowMerchantLogin = $derived(cart?.session?.requires_login && !cart?.session?.is_logged_in);
    let hasFastCheckout = $derived(allowShopPay || allowPayPal || allowMerchantLogin);
</script>

<Layout isLoading={isCartLoading}>
    {#snippet aside()}
        <Overview
            total={cart?.total}
            images={cart?.line_items?.map?.((l) => l.image.medium || l.image.url)}
            quantity={cart?.line_items?.reduce?.((sum, l) => sum + l.quantity, 0)}
            merchantInfo={{ displayName: cart?.display_name || cart?.shop_id }}
            {onBack}
        >
            <div class="w-full bg-fy-primary">
                <!--  Hack for showing to kardiel. This should become a configurations of the merchant's theme
                  It should be passed to the UI along with the colors, etc. -->
                <Summary
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
                    disabled={isShippingInfoInProgress || isShippingMethodInProgress || isPlaceOrderInProgress}
                    showImageBorder={cart?.shop_id !== 'kardiel.com'}
                    updateQuantity={onUpdateQuantity}
                    addPromoCodeCallback={onAddPromoCode}
                    clearPromoCodeCallback={onClearPromoCode}
                />
            </div>
        </Overview>
        <div class="grow"></div>
        <div class="text-center text-xs text-fy-on-primary-subtle max-md:hidden">
            <FooterLinks />
        </div>
    {/snippet}
    {#snippet bside()}
        {#if hasFastCheckout}
            <FastCheckout onclick={onFastCheckout} {allowMerchantLogin} {allowPayPal} {allowShopPay} disabled={isC2PInProgress || isPlaceOrderInProgress} />
            <div class="relative my-2 flex w-full flex-row justify-center text-fy-on-primary-subtle">
                <div class="absolute left-0 flex h-full w-full flex-col justify-center">
                    <hr class="h-[1px] w-full" />
                </div>
                <span class="z-10 bg-fy-background px-4 text-sm"> Or pay another way </span>
            </div>
        {/if}
        <EmailCheckout email={email.value} errorMessage={email.error} onChange={email.set} {isPlaceOrderInProgress} {isC2PAvailable} />
    {/snippet}
</Layout>
