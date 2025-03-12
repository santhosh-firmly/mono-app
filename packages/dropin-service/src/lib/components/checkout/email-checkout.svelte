<script>
    import Checkbox from '$lib/components/common/checkbox.svelte';
    import Group from '$lib/components/common/group.svelte';

    /**
     * @typedef {Object} EmailCheckoutProps
     * @property {string} email - Customer's email address
     * @property {HTMLInputElement} emailField - Reference to the email input element
     * @property {string} email_error_message - Error message to display for invalid email
     * @property {function} validateAndSubmitContactInfo - Function to validate and submit contact information
     * @property {Object} marketingConsent - Marketing consent configuration object
     * @property {boolean} isMarketingConsentSigned - Whether marketing consent has been accepted
     * @property {boolean} isTermsPopupOpen - Controls visibility of terms and conditions popup
     * @property {boolean} shippingAutoCompleteEnabled - Whether to enable browser autocomplete for shipping email
     * @property {function} isC2PAvailable - Function that determines if Click to Pay is available
     * @property {boolean} placeOrderInProgress - Whether order placement is in progress
     */
    /**
     * @type {EmailCheckoutProps}
     */

    let {
        placeOrderInProgress,
        emailField,
        email,
        email_error_message,
        validateAndSubmitContactInfo,
        marketingConsent,
        isMarketingConsentSigned,
        isTermsPopupOpen,
        isC2PAvailable,
        shippingAutoCompleteEnabled,
    } = $props();
</script>

<h3 class="py-1 text-sm">Email</h3>
<Group>
    <div class="col-span-2 flex w-full flex-col justify-center rounded-lg">
        <input
            class="w-full rounded-lg border-0 placeholder:text-fy-on-primary-subtle focus:z-[2] disabled:bg-gray-100"
            disabled={placeOrderInProgress}
            class:error={email_error_message}
            bind:this={emailField}
            bind:value={email}
            onblur={validateAndSubmitContactInfo}
            placeholder=""
            data-testid="email-input"
            autocomplete={shippingAutoCompleteEnabled ? 'shipping email' : ''}
            type="email"
        />
    </div>
</Group>

{#if email_error_message}
    <span class="text-xs text-fy-alert">
        {email_error_message}
    </span>
{/if}

{#if isC2PAvailable}
    <div class="my-2 rounded-lg bg-[#F7F7F7] p-2">
        <span class="leading-1 inline-block text-sm text-fy-on-surface-subtle">
            By entering your email, you consent and direct firmly to send your information to
            <span class="font-bold">Click to Pay</span> to check if you have any saved cards
        </span>
    </div>
{/if}

{#if marketingConsent && marketingConsent.ui_slot === 'UNDER_EMAIL_INPUT'}
    <Checkbox disabled={placeOrderInProgress} labelClasses="w-full pt-4 pb-4 flex rounded-lg" bind:isChecked={isMarketingConsentSigned}>
        <span slot="title" class="pt-0.5 text-xs font-normal text-fy-on-surface-subtle">
            {#each marketingConsent.parts as part}
                {#if part.type === 'text'}
                    {part.content}
                {/if}
                {#if part.type === 'terms'}
                    <button type="button" onclick={() => (isTermsPopupOpen = true)} class="underline">
                        {part.content}
                    </button>
                {/if}
            {/each}
        </span>
    </Checkbox>
{/if}
