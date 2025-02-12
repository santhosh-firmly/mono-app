<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect } from '@storybook/jest';
    import { userEvent, within } from '@storybook/testing-library';

    import BaseLogin from '$lib/components/common/base-login.svelte';
    import AdoremeLogoLarge from '$lib/components/common/svg/adoreme-logo-large.svelte';
    import { BASE_LOGIN_STEPS } from '$lib/constants.js';

    const { Story } = defineMeta({
        title: 'Checkout V4/Common/Base Login',
        component: BaseLogin,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <div class="adoreme-dark">
        <BaseLogin {...args} on:emailSet on:otpCompleted>
            <AdoremeLogoLarge width={null} height={16} />
        </BaseLogin>
    </div>
{/snippet}

<Story
    name="Insert email"
    args={{
        loginProviderName: 'Adore Me',
        termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
        privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
    }}
    children={template}
/>

<Story
    name="Invalid Email"
    args={{
        loginProviderName: 'Adore Me',
        termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
        privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
        email: 'not-a-valid-email',
    }}
    play={async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await step('Verify phone flag', async () => {
            await userEvent.click(canvas.getByRole('button'));
            await expect(canvas.getByTestId('email-error')).toBeInTheDocument();
        });
    }}
    children={template}
/>

<Story
    name="Processing Email"
    args={{
        loginProviderName: 'Adore Me',
        termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
        privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
        phone: '(---) --- 3570',
        currentStep: BASE_LOGIN_STEPS.PROCESSING_EMAIL,
    }}
    children={template}
/>

<Story
    name="Insert OTP"
    args={{
        loginProviderName: 'Adore Me',
        termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
        privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
        phone: '(---) --- 3570',
        currentStep: BASE_LOGIN_STEPS.WAITING_OTP,
    }}
    children={template}
/>

<Story
    name="Invalid OTP"
    args={{
        loginProviderName: 'Adore Me',
        termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
        privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
        currentStep: BASE_LOGIN_STEPS.WAITING_OTP,
        phone: '(---) --- 3570',
        otpError: 'OTP is invalid',
    }}
    children={template}
/>

<Story
    name="Processing OTP"
    args={{
        loginProviderName: 'Adore Me',
        termsOfServiceLink: 'https://www.adoreme.com/terms-conditions',
        privacyPolicyLink: 'https://www.adoreme.com/privacy-policy',
        phone: '(---) --- 3570',
        currentStep: BASE_LOGIN_STEPS.PROCESSING_OTP,
    }}
    children={template}
/>
