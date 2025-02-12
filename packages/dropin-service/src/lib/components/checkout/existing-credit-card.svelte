<script>
    // @ts-nocheck

    import { getCardTypeByType, getCardTypeByValue } from '$lib/browser/credit-card-helper';
    import CustomArtCardIcon from '$lib/components/common/svg/custom-art-card-icon.svelte';

    /**
     * @typedef {Object} ExistingCreditCardProps
     * @property {boolean} showSkeleton - Whether or not to show the skeleton
     * @property {string} customArtUrl - The URL of the custom credit card art
     * @property {string} type - The type of the credit card
     * @property {string} number - The full credit card number
     * @property {string} issuer - The issuer of the credit card
     */
    /**
     * @type {ExistingCreditCardProps}
     */
    let { showSkeleton = false, type = '', number = '', issuer = '', customArtUrl = '' } = $props();

    const cardType = type ? getCardTypeByType(type, 'checkoutV4') : getCardTypeByValue(number, 'checkoutV4');
    const cardComponent = customArtUrl ? CustomArtCardIcon : cardType.component;

    const lastFourRegex = /\d{4}$/;
    const lastFourValidated = number.match(lastFourRegex)?.[0];

    const brandAndLastFour = `${cardType.displayName} *** ${lastFourValidated}`;
    const firstLineText = issuer || brandAndLastFour;
    const secondLineText = issuer ? brandAndLastFour : '';
</script>

<div class="flex w-full items-center gap-3">
    <div class="flex h-full w-11 items-center justify-center">
        {#if showSkeleton}
            <div role="status" class="w-full animate-pulse space-y-6">
                <div class="h-10 w-full animate-pulse rounded-lg bg-fy-on-primary-subtle2 px-4 py-2"></div>
            </div>
        {:else}
            {@render cardComponent({
                width: 48,
                height: 48,
                src: customArtUrl,
            })}
        {/if}
    </div>
    <div class="flex flex-col">
        <div class="flex h-full items-center text-sm font-bold text-fy-on-surface">
            {#if showSkeleton}
                <div class="h-4 w-32 animate-pulse rounded-lg bg-fy-on-primary-subtle2 px-4 py-2"></div>
            {:else}
                {firstLineText}
            {/if}
        </div>

        {#if secondLineText && !showSkeleton}
            <div class="flex h-full text-xs text-fy-on-primary-subtle">
                {secondLineText}
            </div>
        {/if}
    </div>
</div>
