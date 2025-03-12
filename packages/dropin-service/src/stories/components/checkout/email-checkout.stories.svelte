<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';

    import EmailCheckoutComponent from '$lib/components/checkout/email-checkout.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Checkout/Email Checkout',
        component: EmailCheckoutComponent,
        tags: ['autodocs'],
    });

    const baseProps = {
        email: '',
        validateAndSubmitContactInfo: () => {
            console.log('validateAndSubmitContactInfo');
        },
        marketingConsent: {
            ui_slot: 'UNDER_EMAIL_INPUT',
            parts: [
                { type: 'text', content: 'I agree to receive marketing communications ' },
                { type: 'terms', content: 'Terms and Conditions' },
            ],
        },
        shippingAutoCompleteEnabled: true,
        isC2PAvailable: true,
    };
    const defaultProps = {
        args: {
            ...baseProps,
            placeOrderInProgress: false,
            email_error_message: '',
            isMarketingConsentSigned: false,
            isTermsPopupOpen: false,
        },
    };

    const withErrorProps = {
        args: {
            ...baseProps,
            email: 'teste124firmly.ai',
            placeOrderInProgress: false,
            email_error_message: 'Please enter a valid email address',
            isMarketingConsentSigned: false,
            isTermsPopupOpen: false,
        },
    };

    const loadingProps = {
        args: {
            ...baseProps,
            placeOrderInProgress: true,
            email_error_message: '',
            isMarketingConsentSigned: true,
            isTermsPopupOpen: false,
        },
    };

    const consentSignedProps = {
        args: {
            ...baseProps,
            placeOrderInProgress: false,
            email_error_message: '',
            isMarketingConsentSigned: true,
            isTermsPopupOpen: false,
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
