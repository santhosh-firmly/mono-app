<script>
    // @ts-nocheck
    import { slide } from 'svelte/transition';

    import LineItem from '$lib/components/cart/line-item.svelte';
    import PromoCodes from '$lib/components/cart/promo-codes.svelte';
    import { formatCurrency } from '$lib/utils.js';

    /**
     * @typedef {Object} SummaryProps
     * @property {boolean} calculating - Whether the summary is currently calculating totals
     * @property {Array|null} lineItems - Array of cart line items
     * @property {Function} updateQuantity - Callback function to update item quantity
     * @property {boolean} disabled - Whether the summary interactions are disabled
     * @property {Array|null} coupons - Array of applied coupon codes
     * @property {number|null} subtotal - Cart subtotal amount
     * @property {number|null} discount - Total discount amount
     * @property {Array|null} discountsBreakdown - Detailed breakdown of applied discounts
     * @property {number|null} storeCredit - Applied store credit amount
     * @property {number|null} rewardPoints - Applied reward points
     * @property {Object|null} shippingMethod - Selected shipping method details
     * @property {number|null} tax - Tax amount
     * @property {number|null} total - Cart total amount
     * @property {boolean} showImageBorder - Whether to show borders around product images
     * @property {Function} addPromoCodeCallback - Callback function to add a promo code
     * @property {Function} clearPromoCodesCallback - Callback function to clear all promo codes
     */

    /**
     * @type {SummaryProps}
     */
    let {
        calculating = false,
        lineItems = null,
        updateQuantity = () => {},
        disabled = false,
        coupons = null,
        subtotal = null,
        discount = null,
        discountsBreakdown = null,
        storeCredit = null,
        rewardPoints = null,
        shippingMethod = null,
        tax = null,
        total = null,
        showImageBorder = true,
        addPromoCodeCallback,
        clearPromoCodesCallback,
    } = $props();

    let skeleton = $derived(!subtotal);
    let monthlyRecurring = $derived((lineItems || []).filter((l) => l.recurring === 'monthly').reduce((sum, l) => sum + l.price.value, 0));
</script>

<div class="mx-auto flex w-full max-w-[800px] flex-col gap-4 py-4 text-fy-on-primary">
    {#each lineItems || [] as item (item.line_item_id)}
        <LineItem
            image={item.image.url}
            quantity={item.quantity}
            description={item.description}
            variantDescription={item.variant_description}
            msrp={item.msrp}
            price={item.line_price}
            recurringPeriod={item.recurring}
            updateQuantity={(qty) => updateQuantity(item, qty)}
            allowChangeQuantity={!item.fixed_quantity}
            {disabled}
            {showImageBorder}
        />
    {:else}
        <LineItem />
    {/each}
    <div class="ml-[5.5rem] flex flex-col text-sm">
        <hr class="my-3" />
        <div class="flex flex-col gap-5">
            <div class="flex flex-row justify-between font-semibold">
                {#if skeleton}
                    <div class="m-1 h-4 w-24 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
                    <div class="m-1 h-4 w-12 animate-pulse rounded bg-fy-on-primary-subtle2 text-right"></div>
                {:else}
                    <span>Subtotal</span>
                    <span class="text-right">{formatCurrency(subtotal)}</span>
                {/if}
            </div>
            {#if !skeleton}
                <PromoCodes {coupons} {addPromoCodeCallback} {clearPromoCodesCallback} />
            {/if}
            {#if discountsBreakdown}
                <div class="flex flex-col justify-between gap-5 font-semibold text-fy-on-primary-accent">
                    {#each discountsBreakdown as db (db.label)}
                        <div class="flex flex-row justify-between" data-testid="discount">
                            <span> {db.label} </span>
                            <span class="text-right font-semibold">
                                (-{formatCurrency(db.discount)})
                            </span>
                        </div>
                    {/each}
                </div>
            {:else if discount?.value > 0}
                <div transition:slide class="flex flex-row items-start justify-between gap-2 text-fy-on-primary-subtle">
                    <div class="flex flex-col text-left">
                        <span> Discount </span>
                    </div>
                    <span class="text-right">
                        (-{formatCurrency(discount)})
                    </span>
                </div>
            {/if}
            <div class="flex flex-row items-start justify-between gap-2 text-fy-on-primary-subtle">
                {#if skeleton}
                    <div class="flex flex-col text-left">
                        <div class="m-1 h-4 w-24 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
                        <div class="m-1 h-4 w-32 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
                    </div>
                    <div class="m-1 h-4 w-12 animate-pulse rounded bg-fy-on-primary-subtle2 text-right"></div>
                {:else}
                    <div class="flex flex-col text-left">
                        <span> Shipping </span>
                        {#if shippingMethod}
                            <span class="text-xs"> {shippingMethod.description} </span>
                        {/if}
                    </div>
                    <span class="text-right">
                        {#if calculating}
                            Calculating...
                        {:else if shippingMethod}
                            {shippingMethod.price.value === 0 ? 'Free' : formatCurrency(shippingMethod.price)}
                        {:else}
                            Enter shipping address
                        {/if}
                    </span>
                {/if}
            </div>
            <div class="flex flex-row justify-between gap-2 text-fy-on-primary-subtle">
                {#if skeleton}
                    <div class="m-1 h-4 w-24 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
                    <div class="m-1 h-4 w-12 animate-pulse rounded bg-fy-on-primary-subtle2 text-right"></div>
                {:else}
                    <span>Tax</span>
                    <span class="text-right">
                        {#if calculating}
                            Calculating...
                        {:else if shippingMethod}
                            {formatCurrency(tax) || '-'}
                        {:else}
                            Enter shipping address
                        {/if}
                    </span>
                {/if}
            </div>
            {#if storeCredit?.value > 0}
                <div class="flex flex-row items-start justify-between gap-2 text-fy-on-primary-subtle">
                    <div class="flex flex-col text-left">
                        <span> Store Credit </span>
                    </div>
                    <span class="text-right">
                        (-{formatCurrency(storeCredit)})
                    </span>
                </div>
            {/if}
            {#if rewardPoints?.value > 0}
                <div class="flex flex-row items-start justify-between gap-2 text-fy-on-primary-subtle">
                    <div class="flex flex-col text-left">
                        <span> Reward Points </span>
                    </div>
                    <span class="text-right">
                        (-{formatCurrency(rewardPoints)})
                    </span>
                </div>
            {/if}
        </div>
        <hr class="my-3" />
        <div class="flex flex-col gap-5">
            <div class="flex flex-row justify-between font-semibold">
                {#if skeleton}
                    <div class="m-1 h-4 w-24 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
                    <div class="m-1 h-4 w-12 animate-pulse rounded bg-fy-on-primary-subtle2 text-right"></div>
                {:else}
                    <span>Total due today</span>
                    <span class="text-right">{formatCurrency(total)}</span>
                {/if}
            </div>
            {#if monthlyRecurring}
                <div class="flex flex-row justify-between text-fy-on-primary-subtle">
                    <span>Due monthly</span>
                    <span class="text-right">{formatCurrency({ currency: 'USD', value: monthlyRecurring })}/mo<br />after 1 month</span>
                </div>
            {/if}
        </div>
    </div>
</div>
