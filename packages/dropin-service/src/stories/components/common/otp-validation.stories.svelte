<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';

    import OTPValidation from '$lib/components/common/otp-validation.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Common/OTP Validation',
        component: OTPValidation,
        tags: ['autodocs'],
    });
</script>

{#snippet template(args)}
    <OTPValidation {...args} on:alternativeTextClicked on:otpCompleted />
{/snippet}

<Story
    name="Default"
    args={{
        alternativeMethodText: 'Send a code by e-mail',
    }}
    children={template}
/>

<Story name="Without Alternative Text" args={{}} />
