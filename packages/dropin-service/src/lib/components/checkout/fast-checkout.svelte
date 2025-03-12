<script>
    import LoginButton from './login-button.svelte';
    import Paypal from '../payments/paypal/paypal.svelte';
    import ShopPayIcon from '$lib/components/common/svg/pay-pal-icon.svelte';

    let { cart, disabled } = $props();

    let allowShopPay = $derived(cart?.payment_method_options?.some((p) => p.type === 'ShopPay' || p.wallet === 'shoppay'));
    let allowPayPal = $derived(!!cart?.shop_properties?.paypal);
    let allowMerchantLogin = $derived(cart?.session?.requires_login && !cart?.session?.is_logged_in);
    let hasFastCheckout = $derived(allowShopPay || allowPayPal || allowMerchantLogin);

    let isShopPayOpen = $state(false);
    let paypalPayerId = $state(0);
</script>

<div class="grid grid-cols-1 gap-4 py-2">
    {#if allowMerchantLogin}
        <LoginButton {smallLogo} {largeLogo} merchantName={cart?.display_name} {disabled} on:click={loginButtonClicked} />
    {/if}
    {#if allowShopPay}
        <div class="flex justify-center">
            <button
                type="button"
                class="flex w-full flex-row items-center justify-center rounded bg-[#5a31f4] px-4 py-2 text-white shadow hover:bg-[#390ced]"
                {disabled}
                data-testid="shoppay-button"
                onclick={() => (isShopPayOpen = true)}
            >
                <ShopPayIcon class="fill-white px-2" width={84} height={32} />
            </button>
        </div>
    {/if}
    {#if allowPayPal}
        <div class="my-1 flex h-12 w-full flex-row justify-center overflow-hidden rounded bg-[#ffc439] shadow">
            <Paypal
                class="w-full"
                label="paypal"
                onPaypalHandler={() => {}}
                merchantId={cart.shop_properties.paypal.merchantId}
                clientId={cart.shop_properties.paypal.clientId}
                integrationVersion={cart.shop_properties.paypal.integration_version}
                bind:paypalPayerId
            />
        </div>
    {/if}
</div>
