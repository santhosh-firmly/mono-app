<script>
    import Layout from '$lib/components/layout/root.svelte';
    import Overview from '$lib/components/header/overview.svelte';
    import Summary from '$lib/components/cart/summary.svelte';
    import FooterLinks from '$lib/components/footer/footer-links.svelte';
    import FastCheckout from '$lib/components/checkout/fast-checkout.svelte';

    let { cart } = $props();

    let shippingInfoInProgress = $state(false);
    let shippingMethodInProgress = $state(false);
    let placeOrderInProgress = $state(false);

    let isC2PInProgress = $state(false);
    let isShopPayOpen = $state(false);
    let smallLogo = $state(false);
    let largeLogo = $state(false);
    let paypalPayerId = $state(false);
    let onPaypalHandler = $state(false);
    let loginButtonClicked = $state(false);

    function updateQuantity(lineItem, quantity) {}

    function addPromoCodeCallback(promoCode) {}

    function clearPromoCodesCallback() {}
</script>

<Layout isLoading={false}>
    {#snippet aside()}
        <Overview
            total={cart?.total}
            images={cart?.line_items?.map?.((l) => l.image.medium || l.image.url)}
            quantity={cart?.line_items?.reduce?.((sum, l) => sum + l.quantity, 0)}
            merchantInfo={{ displayName: cart?.display_name || cart?.shop_id }}
        >
            <div class="bg-fy-primary w-full">
                <!--  Hack for showing to kardiel. This should become a configurations of the merchant's theme
                  It should be passed to the UI along with the colors, etc. -->
                <Summary
                    calculating={shippingInfoInProgress || shippingMethodInProgress}
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
                    disabled={shippingInfoInProgress || shippingMethodInProgress || placeOrderInProgress}
                    showImageBorder={cart?.shop_id !== 'kardiel.com'}
                    {updateQuantity}
                    {addPromoCodeCallback}
                    {clearPromoCodesCallback}
                />
            </div>
        </Overview>
        <div class="grow"></div>
        <div class="text-fy-on-primary-subtle text-center text-xs max-md:hidden">
            <FooterLinks />
        </div>
    {/snippet}
    {#snippet bside()}
        <FastCheckout {cart} disabled={isC2PInProgress || placeOrderInProgress} />
        <div class="text-fy-on-primary-subtle relative my-2 flex w-full flex-row justify-center">
            <div class="absolute left-0 flex h-full w-full flex-col justify-center">
                <hr class="h-[1px] w-full" />
            </div>
            <span class="bg-fy-background z-10 px-4 text-sm"> Or pay another way </span>
        </div>
    {/snippet}
</Layout>
