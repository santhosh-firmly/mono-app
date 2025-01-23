<script>
    // @ts-nocheck

    import { slide } from 'svelte/transition';
    import Group from '$lib/components/common/group.svelte';
    import { isActionDark } from '$lib/theme/theme-context.js';

    export let addPromoCodeCallback;
    export let clearPromoCodesCallback;
    export let coupons = [];

    let showButton = true;
    let promoCode = '';
    let showSpinner = false;
    let inputElement;
    let removingPromoCodes = false;
    let error = '';
    let promoListContainer;
    let promoListContainerScrollLeft = 0;

    $: {
        if (inputElement && !showButton) {
            inputElement.focus();
        }
    }

    export let spinnerClasses = !$isActionDark ? 'fill-fy-on-action text-gray-400' : 'fill-fy-on-action text-gray-fy-on-action-subtle';

    function promoCodeButtonClicked() {
        showButton = false;
    }

    function onInputBlur() {
        if (!promoCode) {
            showButton = true;
        }
    }

    async function addPromoCode() {
        if (promoCode) {
            error = '';
            showSpinner = true;
            try {
                await addPromoCodeCallback(promoCode);
                showButton = true;
                promoCode = '';
            } catch (e) {
                error = e.description || 'There was an error while adding the promotion';
            }

            showSpinner = false;
        }
    }

    async function clearPromoCodes() {
        if (!removingPromoCodes) {
            removingPromoCodes = true;
            await clearPromoCodesCallback();
            removingPromoCodes = false;
        }
    }

    async function handleInputKeyPress(event) {
        if (event.key === 'Enter') {
            addPromoCode();
        }
    }
</script>

<div>
    {#if showButton}
        <button
            data-testid="add-promo-code-button"
            on:click={() => promoCodeButtonClicked()}
            class="promo-button col-span-2 w-full rounded-lg border-0 bg-fy-primary px-2 py-2 text-sm text-fy-on-primary"
        >
            Add promotion code
        </button>
    {:else}
        <Group>
            <div class="relative col-span-2 h-9 rounded-lg">
                <div class="absolute right-0 z-[2] text-xs font-semibold text-fy-on-primary-subtle">
                    {#if showSpinner}
                        <div class="absolute inset-y-0 right-0 rounded-l-md px-4 py-1.5">
                            <svg
                                aria-hidden="true"
                                class="absolute right-0 mr-2 h-6 w-6 animate-spin {spinnerClasses}"
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
                        </div>
                    {:else if promoCode}
                        <button
                            type="button"
                            disabled={showSpinner || removingPromoCodes}
                            data-testid="apply-promo-code-button"
                            class="m-1.5 mx-2 rounded-full px-2 py-1 shadow"
                            on:click={() => addPromoCode()}
                        >
                            Apply
                        </button>
                    {/if}
                </div>

                <input
                    type="text"
                    data-testid="promo-code-input"
                    maxlength="20"
                    bind:this={inputElement}
                    bind:value={promoCode}
                    disabled={showSpinner}
                    class="h-full w-full rounded-lg border-0 px-1 text-sm"
                    class:error
                    placeholder="Add promotion code"
                    on:keyup={handleInputKeyPress}
                    on:blur={() => onInputBlur()}
                />
            </div>
        </Group>
        {#if error}
            <div class="p-1" data-testid="promo-code-error">
                <p class="text-xs font-light italic text-red-700 dark:text-red-500">
                    {error}
                </p>
            </div>
        {/if}
    {/if}
    {#if coupons?.length > 0}
        <div transition:slide class="relative mt-2 flex w-full flex-row items-center">
            <div
                class="relative grow overflow-hidden"
                class:ov-gradient-to-r-primary={promoListContainerScrollLeft > 0}
                class:ov-gradient-to-l-primary={promoListContainer?.scrollWidth - promoListContainerScrollLeft > 0}
            >
                <div
                    bind:this={promoListContainer}
                    on:scroll={() => {
                        promoListContainerScrollLeft = promoListContainer.scrollLeft;
                    }}
                    class="no-scrollbar flex grow flex-row gap-2 overflow-scroll overflow-y-hidden px-0.5 py-2"
                >
                    {#each coupons || [] as coupon}
                        <Group grid={false} stretch={false}>
                            <div data-testid="applied-promo-code" class="flex shrink flex-row items-center rounded-lg bg-fy-surface p-1 text-center text-xs">
                                <svg
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    width="20px"
                                    height="20px"
                                    viewBox="0 0 24 24"
                                    style="enable-background:new 0 0 24 24; vertical-align: middle;"
                                    xml:space="preserve"
                                    class="m-0.5 inline-block fill-fy-on-surface-subtle"
                                >
                                    <g id="Icons" style="opacity:0.75;">
                                        <g id="tag">
                                            <g>
                                                <path
                                                    d="M18.748,11.717c0.389,0.389,0.389,1.025,0,1.414l-4.949,4.95c-0.389,0.389-1.025,0.389-1.414,0l-6.01-6.01
            c-0.389-0.389-0.707-1.157-0.707-1.707L5.667,6c0-0.55,0.45-1,1-1h4.364c0.55,0,1.318,0.318,1.707,0.707L18.748,11.717z
             M8.104,7.456C7.525,8.032,7.526,8.97,8.103,9.549c0.578,0.577,1.516,0.577,2.095,0.001c0.576-0.578,0.576-1.517,0-2.095
            C9.617,6.879,8.68,6.878,8.104,7.456z"
                                                />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                                <span class="leading-0 mr-1.5 text-fy-on-surface-subtle">
                                    {coupon.toUpperCase()}
                                </span>
                            </div>
                        </Group>
                    {/each}
                    <div class="w-1"></div>
                </div>
            </div>

            {#if coupons?.length > 0}
                <div class="rounded-lg text-sm font-thin">
                    {#if !removingPromoCodes}
                        <button
                            type="button"
                            disabled={showSpinner || removingPromoCodes}
                            data-testid="remove-promo-codes-button"
                            class="ml-2 whitespace-nowrap rounded-lg p-1 text-fy-on-primary-subtle underline"
                            on:click={() => clearPromoCodes()}>Remove all</button
                        >
                    {:else}
                        <div class="m-0.5 rounded-l-md pl-2">
                            <svg aria-hidden="true" class="mr-1 h-4 w-4 animate-spin {spinnerClasses}" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style lang="scss">
    input.error {
        color: var(--fy-alert);
        box-shadow: var(--fy-form-element-input-error);
        z-index: 1;
    }

    input:focus,
    button:focus {
        border: 0 !important;
        outline: 0 !important;
        z-index: 2;

        box-shadow: var(--fy-form-element-input-focus);
        transition-property: box-shadow, color, filter;
    }

    .promo-button {
        box-shadow: var(--fy-surface-box-shadow);
    }
</style>
