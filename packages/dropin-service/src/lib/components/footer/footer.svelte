<script>
    // @ts-nocheck

    import FooterLinks from './footer-links.svelte';

    import PaymentButton from '$lib/components/checkout/payment-button.svelte';

    /**
     * @typedef {Object} footerProps
     * @property {number} total - Total amount of the order
     * @property {boolean} disabled - Whether the payment button is disabled
     * @property {boolean} inProgress - Whether the payment is in progress
     * @property {boolean} isOrderPlaced - Whether the order is placed
     * @property {string} termsOfUse - URL of the terms of use
     * @property {string} privacyPolicy - URL of the privacy policy
     */
    /**
     * @type {footerProps}
     */
    let { total, disabled, inProgress, isOrderPlaced, termsOfUse, privacyPolicy } = $props();
</script>

<div class="flex flex-col gap-4 pt-4 text-center">
    {#if termsOfUse && privacyPolicy}
        <span class="p-2 text-xs text-fy-on-primary-subtle">
            By selecting "Place Order", I agree to the merchant´s <a class="underline" target="_blank" href={termsOfUse}>Terms of Use</a>
            and <a class="underline" target="_blank" href={privacyPolicy}>Privacy Policy</a>.
        </span>
    {/if}
    <PaymentButton on:click {total} {disabled} {inProgress} {isOrderPlaced} />
    <span class="flex flex-row items-start justify-center gap-2 text-xs leading-normal text-fy-on-primary-subtle">
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="16" viewBox="0 0 11 16" fill="none">
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5.50087 0C4.6463 0 3.82674 0.396186 3.22247 1.1014C2.6182 1.80662 2.27872 2.76309 2.27872 3.76042V5.90923C1.7904 5.90923 1.32208 6.13562 0.976782 6.5386C0.631486 6.94158 0.4375 7.48814 0.4375 8.05804V12.8929C0.4375 13.4628 0.631486 14.0093 0.976782 14.4123C1.32208 14.8153 1.7904 15.0417 2.27872 15.0417H8.72301C9.21133 15.0417 9.67966 14.8153 10.025 14.4123C10.3703 14.0093 10.5642 13.4628 10.5642 12.8929V8.05804C10.5642 7.48814 10.3703 6.94158 10.025 6.5386C9.67966 6.13562 9.21133 5.90923 8.72301 5.90923V3.76042C8.72301 1.68323 7.28072 0 5.50087 0ZM7.8024 5.90923V3.76042C7.8024 3.04804 7.55992 2.36484 7.1283 1.86112C6.69668 1.35739 6.11127 1.0744 5.50087 1.0744C4.89046 1.0744 4.30506 1.35739 3.87344 1.86112C3.44182 2.36484 3.19934 3.04804 3.19934 3.76042V5.90923H7.8024Z"
                fill="#A3A3A3"
            />
        </svg>
        Payments are secure and encrypted
    </span>
    <span class="mt-6 text-xs text-fy-on-primary-subtle md:hidden">
        <FooterLinks />
    </span>
</div>
