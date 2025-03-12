<script>
    // @ts-nocheck
    import RoundedGroup from '$lib/components/common/rounded-group.svelte';

    /**
     * @typedef {Object} ShippingAddressProps
     * @property {string} headerDisplay - The header display
     * @property {string} subheaderName - The subheader name
     * @property {AddressProps[]} savedAddresses - The saved addresses
     * @property {AddressProps} selectedShippingAddress - The selected shipping address
     * @property {boolean} disabled - Whether or not the form elements are disabled
     * @property {function} onSetShippingInfo - Callback function to be called when the shipping address is changed
     * @property {function} onAddNewAddress - Callback function to be called when the "Add New Address" option is selected
     */
    /**
     * @type {ShippingAddressProps}
     */
    let { headerDisplay = '', subheaderName = '', savedAddresses = null, selectedShippingAddress = null, disabled = false, onSetShippingInfo, onAddNewAddress } = $props();

    function getInfoDisplay(headerDisplay, address) {
        if (headerDisplay === 'name') {
            return address?.first_name && address?.last_name ? `${address.first_name} ${address.last_name}` : '';
        } else {
            return `${address.email}`;
        }
    }

    function getShippingAddress(address) {
        if (address) {
            return `${getInfoDisplay(subheaderName, address)}, ${address.address1} ${address.address2 || ''}, ${address.city}, ${address.state_or_province} ${address.postal_code}`;
        } else {
            return '';
        }
    }
</script>

<RoundedGroup items={savedAddresses} isLoading={!savedAddresses}>
    {#snippet skeleton()}
        <div class="flex w-full flex-col">
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
        </div>
    {/snippet}

    {#snippet item(address, index)}
        <div class="flex flex-col">
            <span class="text-sm font-semibold text-fy-on-surface">
                <span>
                    <input
                        name="address"
                        class="text-fy-action disabled:text-fy-on-primary-subtle"
                        data-testid="address-radio-{index}"
                        type="radio"
                        value={address}
                        bind:group={selectedShippingAddress}
                        onchange={() => onSetShippingInfo(address)}
                        {disabled}
                    />
                </span>
                <span class="pl-1">
                    {getInfoDisplay(headerDisplay, address)}
                </span>
            </span>
            <div class="flex flex-col">
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
        </div>
    {/snippet}

    <span class="text-sm font-semibold text-fy-on-surface">
        <span>
            <input name="address" class="text-fy-action disabled:text-fy-on-primary-subtle" type="radio" value={'add-new-address'} onchange={() => onAddNewAddress()} {disabled} />
        </span>
        <span>
            <span class="pl-1"> Add New Address </span>
        </span>
    </span>
</RoundedGroup>
