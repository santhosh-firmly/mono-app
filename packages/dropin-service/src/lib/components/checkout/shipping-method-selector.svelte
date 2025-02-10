<script>
    // @ts-nocheck
    import { createEventDispatcher } from 'svelte';

    import Group from '$lib/components/common/group.svelte';
    import { formatCurrency } from '$lib/utils.js';

    /**
     * @typedef {Object} ShippingMethodSelectorProps
     * @property {ShippingMethodProps[]} shippingMethods - List of shipping methods to be rendered
     * @property {string} selectedShippingMethod - SKU of the currently selected shipping method
     * @property {boolean} inProgress - Whether or not API calls that changes the shipping methods are in progress
     * @property {boolean} disabled - Whether or not the form elements are disabled
     */

    /**
     * @type {ShippingMethodSelectorProps}
     */
    let { shippingMethods, selectedShippingMethod, inProgress, disabled } = $props();

    const dispatch = createEventDispatcher();

    function onChange(event) {
        selectedShippingMethod = event.currentTarget.value;
        dispatch('set-shipping-method', selectedShippingMethod);
    }

    function isFirst(shippingMethods, index) {
        return index === 0;
    }

    function isLast(shippingMethods, index) {
        return index === shippingMethods.length - 1;
    }
</script>

<Group>
    {#if !shippingMethods}
        {@const mockEntries = [0, 1]}
        <!-- eslint-ignore no-unused-vars -->
        {#each mockEntries as index}
            <label
                class="col-span-2 flex w-full flex-row items-center gap-3 rounded-t-lg border px-3 py-2"
                class:rounded-t-lg={isFirst(mockEntries, index)}
                class:rounded-b-lg={isLast(mockEntries, index)}
            >
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
            </label>
        {/each}
    {:else}
        {#each shippingMethods as shippingMethod, index (shippingMethod.sku)}
            <label
                class="col-span-2 flex w-full flex-row items-center gap-3 border-0 px-3 py-3"
                class:disabled-label={disabled}
                class:rounded-t-lg={isFirst(shippingMethods, index)}
                class:rounded-b-lg={isLast(shippingMethods, index)}
            >
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
            </label>
        {/each}
    {/if}
</Group>

<style>
    input[type='radio']:focus {
        box-shadow: none;
    }

    .disabled-label {
        @apply bg-gray-100;
    }
</style>
