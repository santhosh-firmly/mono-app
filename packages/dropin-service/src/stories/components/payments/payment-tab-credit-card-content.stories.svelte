<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect } from '@storybook/jest';
    import { userEvent, within } from '@storybook/testing-library';

    import CreditCardContent from '$lib/components/payments/payment-tab-credit-card-content.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Payments/Credit Card Content',
        component: CreditCardContent,
        tags: ['autodocs'],
        parameters: {
            fullscreen: true,
        },
    });
</script>

{#snippet template(args)}
    <CreditCardContent {...args} />
{/snippet}

<Story name="Default" />

<Story
    name="Saved Cards"
    args={{
        savedCreditCards: [
            {
                type: 'CreditCard',
                art: '',
                id: '249351882',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'visa',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
            {
                type: 'CreditCard',
                art: '',
                id: '249351883',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'mastercard',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
            {
                type: 'CreditCard',
                art: '',
                id: '249351884',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'amex',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
            {
                type: 'CreditCard',
                art: '',
                id: '249351885',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'discover',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
            {
                type: 'CreditCard',
                art: '',
                id: '249351886',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'dinersclub',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
            {
                type: 'CreditCard',
                art: '',
                id: '249351887',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'jcb',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
            {
                type: 'CreditCard',
                art: '',
                id: '249351888',
                wallet: 'shoppay',
                last_four: '8798',
                month: 3,
                year: 2030,
                card_type: 'unionpay',
                billing_info: {
                    first_name: 'John',
                    last_name: 'Smith',
                    address1: '123 Beautiful St.',
                    address2: '',
                    city: 'Newcastle',
                    state_or_province: 'WA',
                    state_name: 'Washington',
                    postal_code: '98056',
                    country: 'United States',
                    phone: '+14255551234',
                },
            },
        ],
    }}
    children={template}
/>

<Story
    name="Billing Address Different than Shipping Address"
    args={{
        isBillingSameShipping: false,
    }}
    children={template}
/>

<Story
    name="CVV max length"
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Verify CVV limit', async () => {
            const cvvField = canvas.getByTestId('verification_value');
            await cvvField.focus();
            await userEvent.keyboard('1234567890');
            await expect(cvvField.value).toEqual('1234');
        });
    }}
    children={template}
/>

<Story
    name="Expiry max length"
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        let expiryField;
        await step('Find expiry field', async () => {
            expiryField = canvas.getByTestId('expiry');
            await expiryField.focus();
        });

        await step('Verify normal date', async () => {
            expiryField.value = '';
            await userEvent.keyboard('12/24');
            await expect(expiryField.value).toEqual('12/24');
        });

        await step('Verify date with no slash', async () => {
            expiryField.value = '';
            await userEvent.keyboard('1224');
            await expect(expiryField.value).toEqual('12/24');
        });

        await step('Verify date with no slash and 4 year digits', async () => {
            expiryField.value = '';
            await userEvent.keyboard('122024');
            await expect(expiryField.value).toEqual('12/24');
        });

        await step('Verify date with 4 year digits', async () => {
            expiryField.value = '';
            await userEvent.keyboard('12/2024');
            await expect(expiryField.value).toEqual('12/24');
        });
    }}
    children={template}
/>

<Story
    name="Letters on card number"
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Add letters on the card number field', async () => {
            const numberField = canvas.getByTestId('number');
            await numberField.focus();
            await userEvent.keyboard('asd 4111 asd 1111 1111 qwe 1111');
            await expect(numberField.value).toEqual('4111 1111 1111 1111');
        });
    }}
    children={template}
/>

<Story
    name="Letters on Expiry field"
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Add letters on the Expiry field', async () => {
            const expiryield = canvas.getByTestId('expiry');
            await expiryield.focus();
            await userEvent.keyboard('1asd2');
            await expect(expiryield.value).toEqual('12');
        });
    }}
    children={template}
/>

<Story
    name="Letters on CVV field"
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Add letters on the CVV field', async () => {
            const cvvField = canvas.getByTestId('verification_value');
            await cvvField.focus();
            await userEvent.keyboard('asd123qwe4');
            await expect(cvvField.value).toEqual('1234');
        });
    }}
    children={template}
/>

<Story
    name="Unidentified card numbers"
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Type an unidentified card number', async () => {
            const numberField = canvas.getByTestId('number');
            await numberField.focus();
            await userEvent.keyboard('1111111111111111');
            await expect(numberField.value).toEqual('1111 1111 1111 1111');
        });
    }}
    children={template}
/>
