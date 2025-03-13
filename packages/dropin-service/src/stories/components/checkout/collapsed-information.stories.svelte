<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { fn } from '@storybook/test';

    import CollapsedInformation from '$lib/components/checkout/collapsed-information.svelte';


    const { Story } = defineMeta({
        title: 'Checkout V4/Checkout/Collapsed Information',
        component: CollapsedInformation,
        tags: ['autodocs'],
        args:{
            onSetShippingMethod: fn(),
            onCreditCardUpdated: fn(),
            onPaypalHandler: fn(),
            handleSetShippingInfo: fn(),
            getBillingInfo: fn(),
            validateCreditCard: fn(),
        }
    });

    const name = 'John Doe';
    const savedAddresses = [
        {
            first_name: 'testing',
            last_name: 'mock',
            phone: '1234567891',
            address1: '1 microsoft way',
            address2: '',
            city: 'redmond',
            state_or_province: 'wa',
            country: 'us',
            postal_code: '98052',
            email: 'john@doe.com'
        },
        {
            first_name: 'john',
            last_name: 'doe',
            phone: '2222222222',
            address1: 'address test',
            address2: '2',
            city: 'San Francisco',
            state_or_province: 'CA',
            country: 'us',
            postal_code: '11111',
            email: 'john@doe.com'
        },
        {
            first_name: 'mock',
            last_name: 'mocking',
            phone: '+123 (45) 123-456',
            address1: 'my address',
            address2: '',
            city: 'Los Angeles',
            state_or_province: 'CA',
            country: 'us',
            postal_code: '22222',
            email: 'mock@mocking.com'
        }
    ];

    const oneAddress = [
        {
            first_name: 'testing',
            last_name: 'teste',
            phone: '1234567891',
            address1: '1 microsoft way',
            address2: '',
            city: 'redmond',
            state_or_province: 'wa',
            country: 'us',
            postal_code: '98052',
            email: 'mateus@firmly.ai'
        }
    ];

    // Mock data for saved credit cards
    const savedCreditCards = [
        {
            id: 'card1',
            last_four: '4242',
            card_type: 'visa',
            art: null
        },
        {
            id: 'card2',
            last_four: '1234',
            card_type: 'mastercard',
            art: null
        }
    ];

    // Mock cart data
    const cartWithShippingInfo = {
        shipping_info: {
            first_name: 'John',
            last_name: 'Doe',
            address1: '123 Main St',
            address2: 'Apt 4B',
            city: 'New York',
            state_or_province: 'NY',
            postal_code: '10001',
            country: 'US',
            phone: '555-123-4567'
        },
        shipping_method: null,
        shipping_method_options: [
            {
                sku: 'standard',
                description: 'Standard Shipping',
                price: {
                    currency: 'USD',
                    value: 0
                },
                estimate: '3-5 business days'
            },
            {
                sku: 'express',
                description: 'Express Shipping',
                price: {
                    currency: 'USD',
                    value: 12.99
                },
                estimate: '1-2 business days'
            }
        ],
        payment_method_options: [{ type: 'credit_card' }, { type: 'paypal' }],
        shop_properties: {
            paypal: {
                merchantId: 'merchant123',
                clientId: 'client123'
            }
        },
        available_store_credit: {
            value: 10.0
        },
        store_credit: 5.0
    };

    const cartWithShippingMethod = {
        ...cartWithShippingInfo,
        shipping_method: {
            sku: 'standard',
            description: 'Standard Shipping',
            price: {
                currency: 'USD',
                value: 12.99
            },
            estimate: '3-5 business days'
        }
    };

    const baseProps = {
        collapsedStateShipping: false,
        collapsedStateShippingMethod: false,
        collapsedStatePayment: false,
        savedAddresses: savedAddresses,
        headerDisplay: 'Shipping Address',
        subheaderName: 'Shipping',
        newShippingAddress: {},
        isFormComplete: false,
        selectedShippingAddress: savedAddresses[0],
        shippingInfoInProgress: false,
        savedCreditCards: savedCreditCards,
        selectedCardOption: 'card1',
        placeOrderInProgress: false,
        shouldTryFocusOnPaymentTab: false,
        isCvvRequired: false,
        isShippingAddrComplete: true,
        paypalConnected: false,
        paypalPayerId: null,
        cvvConfirmationValue: '',
        selectedPaymentMethod: 'credit_card',
        isBillingSameShipping: true,
        email: 'john.doe@example.com',
        cart: cartWithShippingInfo
    };

    // Default state - nothing collapsed
    const defaultProps = {
        args: {
            ...baseProps
        }
    };

    // Shipping section collapsed
    const shippingCollapsedProps = {
        args: {
            ...baseProps,
            collapsedStateShipping: true,
            cart: cartWithShippingInfo
        }
    };

    // Shipping and shipping method collapsed
    const shippingMethodCollapsedProps = {
        args: {
            ...baseProps,
            collapsedStateShipping: true,
            collapsedStateShippingMethod: true,
            cart: cartWithShippingMethod
        }
    };

    // All sections collapsed (fully completed checkout)
    const allCollapsedProps = {
        args: {
            ...baseProps,
            collapsedStateShipping: true,
            collapsedStateShippingMethod: true,
            collapsedStatePayment: true,
            cart: cartWithShippingMethod
        }
    };

    // Loading state
    const loadingProps = {
        args: {
            ...baseProps,
            shippingInfoInProgress: true
        }
    };

    // Add the missing shippingAddressProps
    const shippingAddressProps = {
        args: {
            ...baseProps,
            headerDisplay: 'Shipping Address',
            collapsedStateShipping: false
        }
    };
</script>

{#snippet template(args)}
    <div class="mx-auto max-w-md">
        <CollapsedInformation {...args} />
    </div>
{/snippet}

<Story name="Default View" args={defaultProps.args} children={template} />

<Story name="Shipping Address" args={shippingAddressProps.args} children={template} />

<Story name="Shipping Collapsed" args={shippingCollapsedProps.args} children={template} />

<Story name="Shipping and Method Collapsed" args={shippingMethodCollapsedProps.args} children={template} />

<Story name="All Sections Collapsed" args={allCollapsedProps.args} children={template} />

<Story name="Loading State" args={loadingProps.args} children={template} />
