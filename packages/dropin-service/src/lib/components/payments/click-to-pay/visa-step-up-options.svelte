<script>
    // @ts-nocheck

    import { createEventDispatcher, onMount } from 'svelte';

    import Group from '$lib/components/common/group.svelte';
    import C2pIcon from '$lib/components/common/svg/c2p-icon.svelte';
    import { BASE_LOGIN_STEPS } from '$lib/constants';

    /**
     * @typedef {Object} VisaStepUpOptionsProps
     * @property {Object} c2pMaskedCard - MaskedCard from Visa to be rendered for the step up
     * @property {string} currentStep - Current step of the popup
     * @property {string} buttonClasses - Classes to apply to the button
     * @property {string} spinnerClasses - Classes to apply to the spinner
     * @property {string} loginProviderName - Name of the login provider
     * @property {Object} selectedAuthenticationMethod - Selected authentication method
     */
    /**
     * @type {VisaStepUpOptionsProps}
     */
    let { c2pMaskedCard, currentStep, buttonClasses, spinnerClasses, loginProviderName, selectedAuthenticationMethod } = $props();

    let authenticationMethods = $state();
    /**
     * Authentication Type of the selected authentication method
     */

    const dispatch = createEventDispatcher();

    async function handleButtonClick() {
        dispatch('otpMethodSelected', { selectedAuthenticationMethod });
    }

    onMount(() => {
        authenticationMethods = c2pMaskedCard?.digitalCardData?.authenticationMethods;
        if (authenticationMethods) {
            authenticationMethods = authenticationMethods.filter((method) => method.authenticationMethodType !== 'APP_AUTHENTICATION');
        }
        selectedAuthenticationMethod = authenticationMethods[0];
    });

    function isLast(addresses, index) {
        return index === addresses.length - 1;
    }
</script>

<div class="scale-1/2 mt-4 flex max-h-[300px] transform flex-col">
    <div class="ml-4 flex items-center justify-center text-sm font-bold text-[#5e5e5e]">Confirm it's you</div>
    <div class="mx-4 mb-2 flex items-center justify-center text-center text-sm font-medium">
        For added security, your bank wants to verify your identity. Select how to verify your card.
    </div>
    <div class="ml-4 mr-4 mt-4">
        <div class="flex justify-center">
            {#if authenticationMethods}
                <Group>
                    <div class="col-span-2 flex flex-col rounded-lg">
                        {#each authenticationMethods.filter( (o) => ['SMS_OTP', 'EMAIL_OTP'].includes(o.authenticationMethodType), ) as option, index (option.authenticationMethodType)}
                            <div class="border-0 border-b-2 px-2 py-2" class:border-none={isLast(authenticationMethods, index)}>
                                <label class="col-span-2 flex items-center gap-3 px-3 py-2 text-sm">
                                    <input
                                        class="text-fy-on-surface"
                                        name="verification-method"
                                        type="radio"
                                        disabled={false}
                                        checked={option === selectedAuthenticationMethod}
                                        value={option}
                                        bind:group={selectedAuthenticationMethod}
                                    />
                                    <div>
                                        {#if option.authenticationMethodType === 'SMS_OTP'}
                                            <span class="flex flex-col font-normal">Text Code to <strong>{option?.authenticationCredentialReference}</strong></span>
                                        {/if}
                                        {#if option.authenticationMethodType === 'EMAIL_OTP'}
                                            <span class="flex flex-col font-normal">Email Code to <strong>{option?.authenticationCredentialReference}</strong></span>
                                        {/if}
                                    </div>
                                </label>
                            </div>
                        {/each}
                    </div>
                </Group>
            {/if}
        </div>
        <div class="my-4 flex items-center justify-center">
            <button
                type="submit"
                class="relative flex w-full flex-row rounded p-2 text-sm font-medium {buttonClasses}"
                disabled={currentStep === BASE_LOGIN_STEPS.PROCESSING_C2P_OTP_STEPUP}
                onclick={handleButtonClick}
            >
                {#if currentStep === BASE_LOGIN_STEPS.PROCESSING_C2P_OTP_STEPUP}
                    <span class="flex w-full flex-row items-center justify-center leading-6"><C2pIcon width={null} height={30} class="fill-white" /> Sending OTP... </span>
                    <svg
                        aria-hidden="true"
                        class="absolute right-0 mr-2 h-7 w-6 animate-spin {spinnerClasses}"
                        viewBox="0 0 100 101"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="currentColor"
                        />
                        <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentFill"
                        />
                    </svg>
                {:else}
                    <span class="flex w-full flex-row items-center justify-center leading-6"
                        ><C2pIcon width={null} height={30} class="fill-white" /> Continue with
                        <span class="font-bold"> &nbsp;{loginProviderName} </span>
                    </span>
                {/if}
            </button>
        </div>
    </div>
</div>

<style>
    input[type='radio']:focus {
        box-shadow: none;
    }
</style>
