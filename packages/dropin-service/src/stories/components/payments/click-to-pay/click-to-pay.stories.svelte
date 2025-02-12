<script module>
    // @ts-nocheck

    import { defineMeta } from '@storybook/addon-svelte-csf';

    import ClickToPay from '$lib/components/payments/click-to-pay/click-to-pay.svelte';
    import { BASE_LOGIN_STEPS } from '$lib/constants';
    // import FlowSinglePage from '../flow-single-page.svelte';

    const { Story } = defineMeta({
        title: 'Checkout V4/Payments/ClickToPay/Click to Pay Popup',
        component: ClickToPay,
        tags: ['autodocs'],
        parameters: {
            fullscreen: true,
        },
    });
</script>

{#snippet template(args)}
    <div class="h-screen w-full bg-zinc-200">
        <ClickToPay
            {args}
            isModalOpen={true}
            c2pOTPDestination={{
                emails: ['samuelsmith@testing.com', 'johnsmith@example.com'],
                phones: ['(•••) •••-•875', '1234564478'],
            }}
        />
    </div>
{/snippet}

<Story name="Default">
    <!-- <FlowSinglePage /> -->
    <ClickToPay isModalOpen={true} otpEmailInfo={'samuelsmith@testing.com'} otpPhoneInfo={'(•••) •••-•875'} children={template} />
</Story>

<Story name="With C2P Checkbox">
    <!-- <FlowSinglePage /> -->
    <ClickToPay isModalOpen={true} showC2pCheckbox={true} popupStep={BASE_LOGIN_STEPS.WAITING_OTP} otpEmailInfo={'samuelsmith@testing.com'} otpPhoneInfo={'(•••) •••-•875'} />
</Story>

<Story name="Waiting OTP Stepup">
    <!-- <FlowSinglePage /> -->
    <ClickToPay
        isModalOpen={true}
        popupStep={BASE_LOGIN_STEPS.WAITING_C2P_OTP_STEPUP}
        isWaitingStepupOtp={true}
        showSecondSlot={true}
        otpReference={'******8080'}
        contentHeaderText={"Confirm it's you"}
    />
</Story>
