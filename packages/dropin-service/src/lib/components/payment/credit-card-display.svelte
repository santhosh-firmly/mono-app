<script>
    // @ts-nocheck

    import { formatCardNumberRaw } from '$lib/browser/credit-card-helper.js';
    import { CreditCardExpired, CreditCardExpires } from '$lib/browser/localization.js';
    import CustomArtCardIcon from '$lib/components/common/svg/custom-art-card-icon.svelte';
    import EmptyCard from '$lib/components/common/svg/empty-card-icon.svelte';
    import MasterCard from '$lib/components/common/svg/master-card-icon.svelte';
    import VisaCard from '$lib/components/common/svg/visa-card-icon.svelte';

    /**
     * @typedef {Object} CreditCardDisplayProps
     * @property {string} lastFour - The last four digits of the credit card
     * @property {string} cardNumber - The full credit card number
     * @property {string} cardName - The name on the credit card
     * @property {string} cardMonth - The expiration month of the credit card
     * @property {string} cardYear - The expiration year of the credit card
     * @property {string} cardType - The type of the credit card
     * @property {string} customArtUrl - The URL of the custom credit card art
     * @property {boolean} mustRedactCardNumber - Whether or not to redact the credit card number
     * @property {boolean} isExpired - Whether or not the credit card is expired
     * @property {boolean} showExpiration - Whether or not to show the expiration date of the credit card
     * @property {boolean} showOnlyLastFour - Whether or not to show only the last four digits of the credit card
     */
    /**
     * @type {CreditCardDisplayProps}
     */
    let {
        lastFour = '',
        cardNumber = '',
        cardName = '',
        cardMonth = '',
        cardYear = '',
        cardType = '',
        customArtUrl = '',
        mustRedactCardNumber = false,
        isExpired = false,
        showExpiration = false,
        showOnlyLastFour = false,
    } = $props();

    function redactCardNumber(number) {
        return formatCardNumberRaw(number.replaceAll(/\d(?=.{4})/g, '•')).formatted;
    }

    let cardComponent = $state(EmptyCard);

    $effect(() => {
        if (lastFour || cardNumber || cardName || cardMonth || cardYear || cardType || customArtUrl) {
            if (customArtUrl) {
                cardComponent = CustomArtCardIcon;
            } else {
                switch (cardType?.toLowerCase?.()) {
                    case 'visa':
                        cardComponent = VisaCard;
                        break;
                    case 'master':
                        cardComponent = MasterCard;
                        break;
                    default:
                        cardComponent = EmptyCard;
                        break;
                }
            }
        }
    });
</script>

<div class="flex flex-row gap-1 font-normal">
    {#if isExpired}
        <div class="flex flex-wrap content-center justify-center text-red-400">{CreditCardExpired}</div>
    {/if}
    <div class="flex justify-center">
        {@render cardComponent({
            width: 48,
            height: 48,
            src: customArtUrl,
        })}
    </div>
    <div class="flex flex-col justify-center">
        <div class="flex flex-wrap content-center justify-start">
            {#if showOnlyLastFour}
                {redactCardNumber(`**** ${lastFour}`)}
            {:else}
                {mustRedactCardNumber ? redactCardNumber(cardNumber) : cardNumber}
            {/if}
        </div>
        {#if showExpiration}
            <div class="flex justify-start">{CreditCardExpires} {cardMonth} / {cardYear}</div>
        {/if}
    </div>
</div>
