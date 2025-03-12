<script>
    import LoginButton from '$lib/components/checkout/login-button.svelte';
    import PaypalIcon from '$lib/components/common/svg/pay-pal-icon.svelte';
    import ShopPayIcon from '$lib/components/common/svg/shoppay-icon.svelte';

    let { disabled, allowShopPay, allowPayPal, allowMerchantLogin, onclick, smallLogo, largeLogo, merchantName } = $props();
</script>

<div class="grid grid-cols-1 gap-4 py-2">
    {#if allowMerchantLogin}
        <LoginButton {smallLogo} {largeLogo} {merchantName} {disabled} onclick={() => onclick('merchant')} />
    {/if}
    {#if allowShopPay}
        <div class="flex justify-center">
            <button type="button" class="button-base shoppay-button" {disabled} data-testid="shoppay-button" onclick={() => onclick('shoppay')}>
                <ShopPayIcon class="fill-white px-2" width={84} height={32} />
            </button>
        </div>
    {/if}
    {#if allowPayPal}
        <div class="flex justify-center">
            <button type="button" class="button-base paypal-button" {disabled} data-testid="paypal-button" onclick={() => onclick('paypal')}>
                <PaypalIcon class="fill-black px-2" width={76} height={20} />
            </button>
        </div>
    {/if}
</div>

<style lang="postcss">
    .button-base {
        @apply flex h-[50px] w-full flex-row items-center justify-center rounded px-4 py-2 shadow transition-colors;
    }

    .shoppay-button {
        @apply bg-[#5a31f4] text-white hover:bg-[#390ced];
    }

    .paypal-button {
        @apply bg-[#ffc439] text-black hover:bg-[#e0a800];
    }
</style>
