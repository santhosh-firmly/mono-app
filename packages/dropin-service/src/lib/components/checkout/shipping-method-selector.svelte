<script>
    // @ts-nocheck
    import RoundedGroup from '$lib/components/common/rounded-group.svelte';
    import { formatCurrency } from '$lib/utils.js';

    /**
     * @typedef {Object} ShippingMethodSelectorProps
     * @property {ShippingMethodProps[]} shippingMethods - List of shipping methods to be rendered
     * @property {string} selectedShippingMethod - SKU of the currently selected shipping method
     * @property {boolean} inProgress - Whether or not API calls that changes the shipping methods are in progress
     * @property {boolean} disabled - Whether or not the form elements are disabled
     * @property {function} onSetShippingMethod - Callback function to be called when the shipping method is changed
     */

    /**
     * @type {ShippingMethodSelectorProps}
     */
    let { shippingMethods, selectedShippingMethod, inProgress, disabled, onSetShippingMethod } = $props();

    function onChange(event) {
        selectedShippingMethod = event.currentTarget.value;
        onSetShippingMethod(selectedShippingMethod);
    }
</script>

<RoundedGroup isLoading={!shippingMethods} items={shippingMethods}>
    {#snippet skeleton()}
        <input name="shipping-method" disabled={true} class="animate-pulse border-0 bg-fy-on-primary-subtle text-fy-on-primary-subtle" type="radio" checked={false} />
        <div class="grow">
            <span class="block font-bold">
                <div class="my-2 h-3 w-1/2 animate-pulse rounded bg-fy-on-primary-subtle"></div>
            </span>
            <span class="block text-sm">
                <div class="my-2 h-3 w-2/3 animate-pulse rounded bg-fy-on-primary-subtle"></div>
            </span>
        </div>
        <span class="font-bold">
            <div class="my-2 h-3 w-12 animate-pulse rounded bg-fy-on-primary-subtle"></div>
        </span>
    {/snippet}

    {#snippet item(shippingMethod)}
        <input
            name="shipping-method"
            class="text-fy-action disabled:text-fy-on-primary-subtle"
            type="radio"
            disabled={inProgress || disabled}
            value={shippingMethod.sku}
            checked={selectedShippingMethod === shippingMethod.sku}
            onchange={onChange}
        />
        <div>
            <span class="block text-sm font-bold" class:text-fy-on-surface-subtle={selectedShippingMethod !== shippingMethod.sku}>
                {#if inProgress}
                    <div class="my-2 h-3 w-32 animate-pulse rounded bg-fy-on-primary-subtle"></div>
                {:else}
                    {shippingMethod.description}
                {/if}
            </span>
            {#if shippingMethod.estimated_delivery}
                <span class="block text-sm text-fy-on-surface-subtle">
                    {#if inProgress}
                        <div class="my-2 h-3 w-64 animate-pulse rounded bg-fy-on-primary-subtle"></div>
                    {:else}
                        {shippingMethod.estimated_delivery}
                    {/if}
                </span>
            {/if}
        </div>
        <div class="grow"></div>
        <span class="text-sm font-bold" class:text-fy-on-surface-subtle={selectedShippingMethod !== shippingMethod.sku}>
            {#if inProgress}
                <div class="my-2 h-3 w-12 animate-pulse rounded bg-fy-on-primary-subtle"></div>
            {:else}
                {shippingMethod.price.value === 0 ? 'Free' : formatCurrency(shippingMethod.price)}
            {/if}
        </span>
    {/snippet}
</RoundedGroup>

<style scoped lang="postcss">
    input[type='radio']:focus {
        box-shadow: none;
    }
</style>
