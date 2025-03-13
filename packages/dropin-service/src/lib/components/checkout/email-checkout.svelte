<script>
    import Checkbox from '$lib/components/common/checkbox.svelte';
    import Group from '$lib/components/common/group.svelte';
    import TermsPopup from '$lib/components/footer/terms-popup.svelte';

    /**
     * @typedef {Object} EmailCheckoutProps
     * @property {string} email - Customer's email address
     * @property {HTMLInputElement} ref - Reference to the email input element
     * @property {string} errorMessage - Error message to display for invalid email
     * @property {function} onChange - Callback function to handle email changes
     * @property {Object} marketingConsent - Marketing consent configuration object
     * @property {boolean} isMarketingConsentSigned - Whether marketing consent has been accepted (Bindable)
     * @property {boolean} autocomplete - Whether to enable browser autocomplete for shipping email
     * @property {function} isC2PAvailable - Function that determines if Click to Pay is available
     * @property {boolean} isPlaceOrderInProgress - Whether order placement is in progress
     * @property {string} storeName - Name of the store
     */
    /**
     * @type {EmailCheckoutProps}
     */

    let { ref, onChange, isPlaceOrderInProgress, isMarketingConsentSigned, isC2PAvailable, autocomplete, email, marketingConsent, errorMessage, storeName } = $props();

    let isTermsPopupOpen = $state(false);
</script>

<h3 class="py-1 text-sm">Email</h3>
<Group>
    <div class="col-span-2 flex w-full flex-col justify-center rounded-lg">
        <input
            class="w-full rounded-lg border-0 placeholder:text-fy-on-primary-subtle focus:z-[2] disabled:bg-gray-100"
            disabled={isPlaceOrderInProgress}
            class:error={errorMessage}
            bind:this={ref}
            bind:value={email}
            onblur={(e) => onChange(e.target.value)}
            onkeypress={(e) => {
                if (e.key === 'Enter') {
                    onChange(e.target.value);
                }
            }}
            placeholder=""
            data-testid="email-input"
            autocomplete={autocomplete ? 'shipping email' : ''}
            type="email"
        />
    </div>
</Group>

{#if errorMessage}
    <span class="text-xs text-fy-alert">
        {errorMessage}
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
    <Checkbox disabled={isPlaceOrderInProgress} labelClasses="w-full pt-4 pb-4 flex rounded-lg" bind:isChecked={isMarketingConsentSigned}>
        {#snippet titleSnippet()}
            <span class="pt-0.5 text-xs font-normal text-fy-on-surface-subtle">
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
        {/snippet}
    </Checkbox>
{/if}

<!-- It is fetching some terms and conditions from the adoreme - hardcoded -->
<TermsPopup isModalOpen={isTermsPopupOpen} title={storeName} />

<style scoped>
    input.error {
        color: var(--fy-alert);
        box-shadow: var(--fy-form-element-input-error);
        z-index: 1;
    }

    input:focus,
    button:focus {
        border: 0 !important;
        outline: 0 !important;
        z-index: 10;

        box-shadow: var(--fy-form-element-input-focus);
        transition-property: box-shadow, color, filter;
    }
</style>
