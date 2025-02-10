<script>
    // @ts-nocheck
    import { createEventDispatcher } from 'svelte';

    import Group from '$lib/components/common/group.svelte';
    import { NEW_SHIPPING_ADDRESS } from '$lib/constants.js';

    /**
     * @typedef {Object} ShippingAddressProps
     * @property {string} headerDisplay - The header display
     * @property {string} subheaderName - The subheader name
     * @property {AddressProps[]} savedAddresses - The saved addresses
     * @property {AddressProps} selectedShippingAddress - The selected shipping address
     * @property {boolean} disabled - Whether or not the form elements are disabled
     */
    /**
     * @type {ShippingAddressProps}
     */
    let { headerDisplay = '', subheaderName = '', savedAddresses = null, selectedShippingAddress = null, disabled = false } = $props();

    const dispatch = createEventDispatcher();

    function getShippingAddress(address) {
        if (address) {
            return `${getInfoDisplay(subheaderName, address)}, ${address.address1} ${address.address2 || ''}, ${address.city}, ${address.state_or_province} ${address.postal_code}`;
        } else {
            return '';
        }
    }

    function getInfoDisplay(headerDisplay, address) {
        if (headerDisplay === 'name') {
            return address?.first_name && address?.last_name ? `${address.first_name} ${address.last_name}` : '';
        } else {
            return `${address.email}`;
        }
    }

    function handleRadioClick() {
        if (selectedShippingAddress) {
            dispatch('set-shipping-info', { selectedShippingAddress });
        }
    }

    function isLast(Addresses, index) {
        return index === Addresses.length - 1;
    }
</script>

<Group>
    {#if savedAddresses}
        <div class="col-span-2 flex flex-col rounded-lg">
            {#each savedAddresses as address, index (index)}
                <div class="border-0 border-b-2 px-3 py-3">
                    <label>
                        <span class="text-sm font-semibold text-fy-on-surface">
                            <span>
                                <input
                                    name="address"
                                    class="text-fy-action disabled:text-fy-on-primary-subtle"
                                    data-testid="address-radio-{index}"
                                    type="radio"
                                    value={address}
                                    bind:group={selectedShippingAddress}
                                    onchange={handleRadioClick}
                                    {disabled}
                                />
                            </span>
                            <span class="pl-1">
                                {getInfoDisplay(headerDisplay, address)}
                            </span>
                        </span>
                        <div class="flex">
                            <span class="pl-6 text-sm font-normal text-fy-on-primary-subtle">
                                {getShippingAddress(address)}
                                {#if address?.phone}
                                    <span class="text-sm font-bold text-fy-on-primary-subtle"> · </span>
                                    <span class="whitespace-nowrap text-sm font-normal text-fy-on-primary-subtle">
                                        {address.phone}
                                    </span>
                                {/if}
                            </span>
                        </div>
                    </label>
                </div>
            {/each}
            <label class="flex items-center px-3 py-3">
                <input
                    name="address"
                    class="mr-2 text-fy-action disabled:text-fy-on-primary-subtle"
                    type="radio"
                    value={NEW_SHIPPING_ADDRESS}
                    bind:group={selectedShippingAddress}
                    onchange={handleRadioClick}
                    {disabled}
                />
                <div class="flex w-full items-center gap-2">
                    <span class="text-sm font-bold text-fy-on-surface">Add New Address</span>
                </div>
            </label>
        </div>
    {:else}
        {@const mockEntries = [0, 1]}
        <div class="col-span-2 flex flex-col rounded-lg">
            {#each mockEntries as index}
                <div class="border-0 border-b-2 px-5 py-4" class:border-none={isLast(mockEntries, index)}>
                    <label>
                        <span class="block font-bold">
                            <div class="my-2 h-3 w-1/2 animate-pulse rounded bg-fy-on-primary-subtle"></div>
                        </span>

                        <div class="grow">
                            <span class="block text-sm">
                                <div class="flex items-center">
                                    <input
                                        name="addresses"
                                        disabled={true}
                                        class="mr-2 animate-pulse border-0 bg-fy-on-primary-subtle text-fy-on-primary-subtle"
                                        type="radio"
                                        checked={false}
                                    />
                                    <div class="my-2 h-3 w-full animate-pulse rounded bg-fy-on-primary-subtle"></div>
                                </div>
                            </span>
                        </div>
                    </label>
                </div>
            {/each}
        </div>
    {/if}
</Group>
