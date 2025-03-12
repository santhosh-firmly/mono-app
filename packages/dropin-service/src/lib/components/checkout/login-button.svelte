<script>
    // @ts-nocheck
    import { isActionDark } from '$lib/theme/theme-context';

    /**
     * @typedef {Object} LoginButtonProps
     * @property {string} smallLogo - URL for the small logo displayed before the merchant name.
     * @property {string} largeLogo - Large logo URL.
     * @property {string} displayText - Display text
     * @property {string} merchantName - Merchant Name
     * @property {boolean} disabled - Disable the button
     * @property {function} onclick - Click event handler
     */
    /**
     * @type {LoginButtonProps}
     */
    let { smallLogo, largeLogo, displayText, merchantName, onclick, disabled } = $props();
</script>

<button {onclick} class="text-fy-on-action bg-fy-action flex w-full flex-row items-center justify-center gap-2 rounded p-3 pr-5 shadow" {disabled}>
    {#if smallLogo && !largeLogo}
        <img class="inline h-6" src={smallLogo} alt="" />
    {/if}

    {#if displayText}
        <span class="inline font-normal">
            {displayText}
            {#if !largeLogo}
                <span class="inline font-bold">
                    {merchantName}
                </span>
            {/if}
        </span>
    {/if}

    {#if largeLogo}
        <img class="inline h-4 align-middle {$isActionDark ? 'grayscale invert' : ''}" src={largeLogo} alt="{merchantName} logo" />
    {/if}
</button>
