<script>
    import Group from '$lib/components/common/group.svelte';
    import ShippingAddress from '$lib/components/checkout/shipping-address-selector.svelte';
    import ShippingMethodSelector from '$lib/components/checkout/shipping-method-selector.svelte';
    import ExistingCreditCard from '$lib/components/checkout/existing-credit-card.svelte';
    import PaymentTabs from '$lib/components/payments/payment-tabs.svelte';
    import Checkbox from '$lib/components/common/checkbox.svelte';
    import { fadeSlide } from '$lib/transitions';
    import { formatCurrency } from '$lib/utils';

    /**
     * @typedef {Object} Props
     * @property {boolean} collapsedStateShipping - Whether the shipping section is collapsed
     * @property {boolean} collapsedStateShippingMethod - Whether the shipping method section is collapsed
     * @property {boolean} collapsedStatePayment - Whether the payment section is collapsed
     * @property {Array<Object>} savedAddresses - List of user's saved shipping addresses
     * @property {string} headerDisplay - Display text for the shipping address header
     * @property {string} subheaderName - Subheader name for shipping address section
     * @property {Object} newShippingAddress - Empty shipping address object for new addresses
     * @property {boolean} isFormComplete - Whether the entire checkout form is complete
     * @property {Object} selectedShippingAddress - Currently selected shipping address
     * @property {boolean} shippingInfoInProgress - Whether shipping info is being processed
     * @property {Array<Object>} savedCreditCards - List of user's saved credit cards
     * @property {boolean} placeOrderInProgress - Whether order placement is in progress
     * @property {Function} onSetShippingMethod - Handler for setting shipping method
     * @property {Function} onCreditCardUpdated - Handler for credit card updates
     * @property {Function} onPaypalHandler - Handler for PayPal payment processing
     * @property {boolean} shouldTryFocusOnPaymentTab - Whether to focus on payment tab
     * @property {boolean} isCvvRequired - Whether CVV confirmation is required
     * @property {boolean} isShippingAddrComplete - Whether shipping address form is complete
     * @property {Function} handleSetShippingInfo - Handler for setting shipping information
     * @property {boolean} paypalConnected - Whether PayPal is connected
     * @property {string} paypalPayerId - PayPal payer ID
     * @property {string} cvvConfirmationValue - CVV confirmation value
     * @property {Function} validateCreditCard - Function to validate credit card
     * @property {string} selectedPaymentMethod - Currently selected payment method
     * @property {string} selectedCardOption - Currently selected card option
     * @property {boolean} isBillingSameShipping - Whether billing address is same as shipping
     * @property {Function} getBillingInfo - Function to get billing information
     * @property {string} email - Customer's email address
     * @property {Object} cart - Shopping cart object with items, shipping, and payment details
     */

    let {
        collapsedStateShipping,
        collapsedStateShippingMethod,
        collapsedStatePayment,
        savedAddresses,
        headerDisplay,
        subheaderName,
        newShippingAddress,
        isFormComplete,
        selectedShippingAddress,
        shippingInfoInProgress,
        savedCreditCards,
        placeOrderInProgress,
        onSetShippingMethod,
        onCreditCardUpdated,
        onPaypalHandler,
        shouldTryFocusOnPaymentTab,
        isCvvRequired,
        isShippingAddrComplete,
        handleSetShippingInfo,
        paypalConnected,
        paypalPayerId,
        cvvConfirmationValue,
        validateCreditCard,
        selectedPaymentMethod,
        selectedCardOption,
        isBillingSameShipping,
        getBillingInfo,
        email,
        cart
    } = $props();
</script>

{#if collapsedStateShipping}
    <div transition:fadeSlide class="pt-2" class:pb-2={!collapsedStateShippingMethod}>
        <Group>
            <div class="col-span-2 flex flex-row items-center justify-between rounded-t-lg p-5" class:rounded-b-lg={!collapsedStateShippingMethod}>
                {#if cart.shipping_info}
                    <div class="w-full">
                        <span class="text-sm font-bold">{email}</span>
                        <hr />
                        <span class="text-sm">
                            {cart.shipping_info?.first_name}
                            {cart.shipping_info?.last_name} · {cart.shipping_info?.address1}{cart.shipping_info?.address2 ? `, ${cart.shipping_info?.address2}` : ''}, {cart
                                .shipping_info?.city}, {cart.shipping_info?.state_or_province}
                            {cart.shipping_info?.postal_code}
                            {cart.shipping_info?.phone ? `· ${cart.shipping_info?.phone}` : ''}
                        </span>
                    </div>
                    <button
                        type="button"
                        class="ml-5 rounded-full px-1 text-sm text-blue-500"
                        data-testid="change-shipping-button"
                        onclick={() => {
                            collapsedStateShipping = false;
                            if (savedAddresses.length === 1) {
                                selectedShippingAddress = newShippingAddress;
                            }
                        }}
                    >
                        Change
                    </button>
                {:else}
                    <div class="w-full">
                        <div class="m-1 h-4 w-48 animate-pulse rounded bg-fy-on-primary-subtle2" />
                        <hr />
                        <div class="m-1 h-4 w-48 animate-pulse rounded bg-fy-on-primary-subtle2" />
                        <div class="m-1 h-4 w-32 animate-pulse rounded bg-fy-on-primary-subtle2" />
                        <div class="m-1 h-4 w-24 animate-pulse rounded bg-fy-on-primary-subtle2" />
                    </div>
                    <div class="m-1 ml-5 h-4 w-16 animate-pulse rounded bg-fy-on-primary-subtle2" />
                {/if}
            </div>
        </Group>
    </div>
{:else}
    <div transition:fadeSlide class="py-2">
        <h2 class="font-semibold">Shipping Information</h2>
    </div>
    {#if savedAddresses.length > 1}
        <ShippingAddress
            {savedAddresses}
            {headerDisplay}
            {subheaderName}
            shippingInfo={cart?.shippingInfo}
            disabled={shippingInfoInProgress}
            separator={false}
            on:set-shipping-info={handleSetShippingInfo}
            bind:selectedShippingAddress
            bind:isFormComplete={isShippingAddrComplete}
        />
    {/if}
{/if}

{#if collapsedStateShippingMethod}
    <div class:pt-2={!collapsedStateShipping} class:pb-2={!collapsedStatePayment} transition:fadeSlide>
        <Group>
            <div class="col-span-2 flex flex-row items-center p-5" class:rounded-t-lg={!collapsedStateShipping} class:rounded-b-lg={!collapsedStatePayment}>
                {#if cart.shipping_method}
                    <div class="w-full">
                        <div class="flex flex-row justify-between text-sm">
                            <span class="font-bold">{cart.shipping_method.description}</span>
                            <span class="font-bold">
                                {formatCurrency(cart.shipping_method.price)}
                            </span>
                        </div>
                        {#if cart.shipping_method.estimate}
                            <span class="text-xs">{cart.shipping_method.estimate}</span>
                        {/if}
                    </div>
                    <button
                        type="button"
                        class="ml-5 rounded-full px-1 text-sm text-blue-500"
                        onclick={() => {
                            collapsedStateShippingMethod = false;
                        }}
                    >
                        Change
                    </button>
                {:else}
                    <div class="w-full">
                        <div class="m-1 h-4 w-56 animate-pulse rounded bg-fy-on-primary-subtle2" />
                        <div class="m-1 h-4 w-24 animate-pulse rounded bg-fy-on-primary-subtle2" />
                    </div>
                    <div class="m-1 h-4 w-16 animate-pulse rounded bg-fy-on-primary-subtle2" />
                {/if}
            </div>
        </Group>
    </div>
{:else}
    <div transition:fadeSlide>
        <h3 class="py-1 text-sm">Shipping Method</h3>
        {#if cart?.shipping_method_options || shippingInfoInProgress}
            <ShippingMethodSelector
                shippingMethods={cart?.shipping_method_options}
                selectedShippingMethod={cart?.shipping_method?.sku}
                inProgress={shippingInfoInProgress}
                disabled={placeOrderInProgress}
                on:set-shipping-method={onSetShippingMethod}
            />
        {:else}
            <div class="my-2 rounded-lg bg-[#F7F7F7] p-2">
                <span class="text-sm leading-3 text-fy-on-surface-subtle"> Complete the shipping form to see the shipping methods. </span>
            </div>
        {/if}
    </div>
{/if}
{#if collapsedStatePayment}
    {@const selectedCard = savedCreditCards.find((c) => selectedCardOption && c.id === selectedCardOption)}
    <div class="pb-3" class:pt-2={!collapsedStateShippingMethod} transition:fadeSlide>
        <Group>
            <div class="col-span-2 flex flex-row items-center rounded-b-lg p-5" class:rounded-t-lg={!collapsedStateShippingMethod}>
                <ExistingCreditCard number="**** {selectedCard?.last_four}" type={selectedCard.card_type} customArtUrl={selectedCard?.art} />
                <button
                    type="button"
                    class="ml-5 rounded-full px-1 text-sm text-blue-500"
                    onclick={() => {
                        collapsedStatePayment = false;
                    }}
                >
                    Change
                </button>
            </div>
        </Group>
    </div>
{:else}
    <div class="py-2" transition:fadeSlide>
        <h2 class="font-semibold">Payment Method</h2>
        <!-- TODO: how to get the email from PayPal? -->
        <PaymentTabs
            allowedPaymentMethods={cart?.payment_method_options?.map?.((p) => p.type) || []}
            disabled={placeOrderInProgress}
            merchantId={cart?.shop_properties?.paypal?.merchantId}
            clientId={cart?.shop_properties?.paypal?.clientId}
            connected={paypalConnected}
            email={paypalConnected ? cart?.payment_method?.attributes?.email || 'Unknown' : ''}
            {onCreditCardUpdated}
            {onPaypalHandler}
            {savedCreditCards}
            {shouldTryFocusOnPaymentTab}
            {isCvvRequired}
            bind:paypalPayerId
            bind:cvvConfirmationValue
            bind:validateCreditCard
            bind:selectedPaymentMethod
            bind:selectedCardOption
            bind:isBillingSameShipping
            bind:getBillingInfo
        >
            {#snippet underTabs()}
                {#if cart?.available_store_credit?.value > 0}
                    <Checkbox
                        disabled={true}
                        title="Apply {formatCurrency(cart.store_credit)} from store credit ({formatCurrency(cart.available_store_credit)} available)"
                        isChecked={true}
                    />
                {/if}
            {/snippet}
        </PaymentTabs>
    </div>
{/if}
