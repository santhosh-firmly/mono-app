<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { fn } from '@storybook/test';

    import EmailCheckoutComponent from '$lib/components/checkout/email-checkout.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Checkout/Email Checkout',
        component: EmailCheckoutComponent,
        tags: ['autodocs'],
        args: {
            onChange: fn(),
            email: '',
            errorMessage: '',
            isC2PAvailable: false,
            isMarketingConsentSigned: false,
            isPlaceOrderInProgress: false,
            isShippingAutoCompleteEnabled: false,
            storeName: 'Firmly Inc',
            marketingConsent: {
                ui_slot: 'UNDER_EMAIL_INPUT',
                parts: [
                    { type: 'text', content: 'I agree to receive marketing communications ' },
                    { type: 'terms', content: 'Terms and Conditions' },
                ],
            },
            ref: null,
        },
    });

    const baseProps = {
        email: '',
        marketingConsent: {
            ui_slot: 'UNDER_EMAIL_INPUT',
            parts: [
                { type: 'text', content: 'I agree to receive marketing communications ' },
                { type: 'terms', content: 'Terms and Conditions' },
            ],
        },
        isShippingAutoCompleteEnabled: true,
        isC2PAvailable: true,
    };

    const defaultProps = {
        args: {
            ...baseProps,
            isPlaceOrderInProgress: false,
            errorMessage: '',
            isMarketingConsentSigned: false,
        },
    };

    const withErrorProps = {
        args: {
            ...baseProps,
            email: 'teste124firmly.ai',
            errorMessage: 'Please enter a valid email address',
        },
    };

    const loadingProps = {
        args: {
            ...baseProps,
            isPlaceOrderInProgress: true,
            isMarketingConsentSigned: true,
        },
    };

    const consentSignedProps = {
        args: {
            ...baseProps,
            isMarketingConsentSigned: true,
        },
    };
</script>

{#snippet template(args)}
    <EmailCheckoutComponent {...args} />
{/snippet}

<Story name="Default Email Checkout" args={defaultProps.args} children={template} />

<Story name="With Error" args={withErrorProps.args} children={template} />

<Story name="Loading State" args={loadingProps.args} children={template} />

<Story name="Marketing Consent Signed" args={consentSignedProps.args} children={template} />
