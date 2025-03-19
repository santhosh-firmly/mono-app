<script>
    // @ts-nocheck

    import { cubicInOut } from 'svelte/easing';
    import { fade, slide } from 'svelte/transition';

    import BackButton from '$lib/components/header/back-button.svelte';
    import { isPrimaryDark } from '$lib/theme/theme-context.js';
    import { formatCurrency } from '$lib/utils.js';

    /**
     * @typedef {Object} HeaderProps
     * @property {Object} merchantInfo - Merchant information for the back button
     * @property {number|null} total - Total cost of the current cart
     * @property {boolean} expanded - Whether the header content is expanded
     * @property {boolean} showMiniOverview - Whether to show the small overview
     * @property {number} itemCount - Number of items in cart
     * @property {boolean} skeleton - Whether to show loading skeleton
     * @property {boolean} doNotExpand - Whether to show the expand button
     * @property {Function} smallSummary - Function to render the small summary (from overview)
     */

    /**
     * @type {HeaderProps}
     */
    let { merchantInfo = {}, total = null, expanded = false, showMiniOverview = false, itemCount = 0, skeleton = false, doNotExpand = false, smallSummary, children } = $props();

    let headerOffset = $state();

    export function toggleExpanded(ev) {
        ev.stopPropagation();
        expanded = !expanded;
        if (expanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
</script>

<header class="sticky top-0 z-[120] flex w-full flex-col shadow-sm @md:relative @md:shadow-none">
    <button
        bind:offsetHeight={headerOffset}
        class="z-[101] flex w-full flex-row items-center justify-between bg-fy-primary @md:z-[1]"
        onclick={toggleExpanded}
        type="button"
        aria-label="Toggle details"
    >
        <div class="flex w-1/2 items-center @md:w-full">
            <BackButton {...merchantInfo} showBackButton={!expanded} {skeleton} on:back-click />
            <div class="relative flex h-full flex-row items-center gap-2 transition duration-300" class:-translate-x-6={expanded}>
                {#if skeleton}
                    <div class="inline h-8 w-8 shrink-0 animate-pulse rounded-full bg-fy-on-primary-subtle2 duration-300 group-hover:-translate-x-1 group-hover:animate-none"></div>
                    <div
                        class="inline h-8 w-32 shrink animate-pulse rounded-lg bg-fy-on-primary-subtle2 leading-[normal] transition duration-300 group-hover:-translate-x-1 group-hover:animate-none"
                    ></div>
                {:else if merchantInfo.largeLogo}
                    <img
                        class="inline h-4 transition duration-300 group-hover:-translate-x-1 {$isPrimaryDark ? 'grayscale invert' : ''}"
                        src={merchantInfo.largeLogo}
                        alt="{merchantInfo.displayName} logo"
                    />
                {:else}
                    {#if merchantInfo.smallLogo}
                        <img
                            class="inline h-8 rounded-full transition duration-300 group-hover:-translate-x-1"
                            src={merchantInfo.smallLogo}
                            alt="{merchantInfo.displayName} logo"
                        />
                    {/if}
                    <span class="inline overflow-hidden text-ellipsis whitespace-nowrap align-middle uppercase leading-[normal] transition duration-300 group-hover:-translate-x-1">
                        {merchantInfo.displayName}
                    </span>
                {/if}
            </div>
        </div>
        <div class="flex h-full w-1/2 flex-row items-center justify-end p-1 text-xs text-fy-on-primary-subtle">
            {#if !doNotExpand}
                <div class="relative flex flex-row items-center gap-1 text-right" style={`min-width: max-content;`}>
                    {#if expanded}
                        <span class="min-w-max" style="min-width: max-content;">&nbsp;&nbsp;</span>
                        <span class="min-w-max absolute right-0" style="min-width: max-content;" transition:fade={{ duration: 150 }}> Close </span>
                    {:else if showMiniOverview}
                        <div class="absolute right-0 flex flex-row items-center" transition:fade={{ duration: 150 }}>
                            {@render smallSummary?.()}

                            <span class="min-w-max" style="min-width: max-content;" transition:fade={{ duration: 150 }}>
                                {total ? formatCurrency(total) : 'Details'}
                            </span>
                        </div>
                    {:else}
                        <span class="min-w-max" style="min-width: max-content;" transition:fade={{ duration: 150 }}>
                            {total ? formatCurrency(total) : 'Details'}
                        </span>
                        {#if itemCount}
                            <span class="min-w-max max-[380px]:hidden" style="min-width: max-content;" transition:fade={{ duration: 150 }}>
                                ({itemCount} items)
                            </span>
                        {/if}
                    {/if}
                </div>
                <svg
                    class="m-2 inline fill-fy-on-primary-subtle transition duration-300"
                    class:rotate-180={!expanded}
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                >
                    <path
                        d="M1.6125 5.74287C1.41993 5.8873 1.18172 5.95742 0.941609 5.94035C0.7015 5.92329 0.475602 5.82019 0.305391 5.64998C0.13518 5.47977 0.0320787 5.25387 0.0150146 5.01376C-0.00204945 4.77365 0.0680685 4.53544 0.212498 4.34287L4.2125 0.34287C4.39943 0.159643 4.65075 0.057013 4.9125 0.057013C5.17425 0.057013 5.42557 0.159643 5.6125 0.34287L9.6125 4.34287C9.75693 4.53544 9.82705 4.77365 9.80998 5.01376C9.79292 5.25387 9.68982 5.47977 9.51961 5.64998C9.34939 5.82019 9.1235 5.92329 8.88339 5.94035C8.64328 5.95742 8.40507 5.8873 8.2125 5.74287L4.9125 2.45287L1.6125 5.75287V5.74287Z"
                    />
                </svg>
            {/if}
        </div>
    </button>
    {#if expanded}
        <div
            transition:slide={{ duration: 300, easing: cubicInOut }}
            class="ov-gradient-y-primary absolute left-0 top-0 z-[100] flex max-h-screen w-full flex-col bg-fy-primary"
            style="padding-top: {headerOffset}px;"
        >
            {@render children?.()}
        </div>
    {/if}
</header>

{#if expanded}
    <button class="absolute bottom-0 left-0 right-0 top-0 z-[110] bg-black opacity-30 backdrop-blur-2xl" onclick={toggleExpanded} aria-label="Toggle details"></button>
{/if}
