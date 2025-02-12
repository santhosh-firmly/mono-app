<script>
    // @ts-nocheck

    import { createEventDispatcher } from 'svelte';

    import OtpField from './otp-field.svelte';

    /**
     * @typedef {Object} OTPValidationProps
     * @property {string} device - Device to use for OTP validation
     * @property {string} otpReference - Reference to use for OTP validation
     * @property {string} alternativeMethodText - Text to use for alternative method
     * @property {number} otpLength - Length of the OTP
     * @property {string} textClasses - Classes to apply to the text
     * @property {string} error - Error message
     * @property {boolean} disabled - Disable the OTP field
     * @property {boolean} alternativeTextDisabled - Disable the alternative text button
     * @property {string} contentHeaderText - Text to display as the header
     * @property {boolean} isWaitingStepupOtp - Whether the OTP is waiting for stepup OTP
     * @property {Snippet} underOtp - Under OTP content snippet
     * @property {Snippet} secondUnderOtp - Second Under OTP content snippet
     */
    /**
     * @type {OTPValidationProps}
     */
    let {
        device = 'phone',
        otpReference = '',
        alternativeMethodText = '',
        otpLength = 6,
        textClasses = '',
        error = '',
        disabled = false,
        alternativeTextDisabled = false,
        contentHeaderText = "Confirm it's you",
        isWaitingStepupOtp,
        underOtp,
        secondUnderOtp,
    } = $props();
    const dispatch = createEventDispatcher();
    function onOTPComplete(otpValue = '') {
        dispatch('otpCompleted', { otpValue });
    }

    function alternativeTextClicked() {
        dispatch('alternativeTextClicked', {});
    }
</script>

<div class="p-4">
    <div class="text-center text-sm font-bold text-[#5e5e5e]">{contentHeaderText}</div>
    {#if otpReference}
        <div class="pt-2 text-center text-sm font-medium">
            Enter the code sent to <b>{otpReference}</b> to complete your order
        </div>
    {:else}
        <div class="pt-2 text-center text-sm font-medium">
            Enter the code sent to your {device} to use your saved information
        </div>
    {/if}
    <OtpField {error} {otpLength} {onOTPComplete} {disabled} />

    {@render underOtp?.()}
    {@render secondUnderOtp?.()}

    {#if alternativeMethodText}
        <hr class="my-3" />
        <div class="items-center justify-center text-sm font-bold text-fy-on-surface">
            <button
                data-testid="alternative-text-button"
                class:blue-button={isWaitingStepupOtp}
                class="w-full p-2 {textClasses}
				 {alternativeTextDisabled ? 'cursor-default' : 'cursor-pointer hover:underline hover:underline-offset-4'}"
                onclick={() => alternativeTextClicked()}
                disabled={alternativeTextDisabled}
            >
                {isWaitingStepupOtp ? 'Confirm Order' : alternativeMethodText}
            </button>
        </div>
    {/if}
</div>

<style>
    .blue-button {
        background-color: #1f3f9a;
        color: white;
        font-size: 0.875rem;
        line-height: 1.5rem;
        font-weight: 500;
        border-radius: 0.25rem;
    }

    .blue-button:hover {
        background-color: rgb(29 78 216);
        text-decoration: none;
    }
</style>
