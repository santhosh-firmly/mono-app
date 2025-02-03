<script>
    // @ts-nocheck

    import { cubicInOut } from 'svelte/easing';
    import { fade, slide } from 'svelte/transition';

    import { formatCurrency } from '../../utils.js';

    import BackButton from '$lib/components/header/back-button.svelte';

    /**
     * @typedef {Object} HeaderProps
     * @property {Object} merchantInfo - Merchant information for the back button
     * @property {number|null} total - Total cost of the current cart
     * @property {boolean} expanded - Whether the header content is expanded
     * @property {boolean} showMiniOverview - Whether to show the small overview
     * @property {number} itemCount - Number of items in cart
     * @property {boolean} skeleton - Whether to show loading skeleton
     * @property {Function} smallSummary - Function to render the small summary (from overview)
     */

    /**
     * @type {HeaderProps}
     */
    let { merchantInfo = {}, total = null, expanded = false, showMiniOverview = false, itemCount = 0, skeleton = false, smallSummary, children } = $props();

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

<header class="top-0 z-[120] flex w-full flex-col max-md:fixed max-md:shadow-sm">
    {#if expanded}
        <button aria-label="Close overlay" class="fixed left-0 top-0 z-[-100] h-screen w-screen bg-black opacity-30 backdrop-blur-2xl" onclick={toggleExpanded}></button>
    {/if}
    <button
        aria-label="Toggle details"
        bind:offsetHeight={headerOffset}
        class="z-[101] flex w-full flex-row items-center justify-between bg-fy-primary md:z-[1]"
        onclick={toggleExpanded}
        type="button"
    >
        <div class="w-1/2 md:w-full">
            <BackButton {...merchantInfo} showBackButton={!expanded} {skeleton} on:back-click />
        </div>
        <div class="flex h-full w-1/2 flex-row items-center justify-end p-1 text-xs text-fy-on-primary-subtle md:hidden">
            <div class="relative flex flex-row items-center gap-1 text-right" style={`min-width: max-content;`}>
                {#if expanded}
                    <span class="min-w-max" style="min-width: max-content;">&nbsp;&nbsp;</span>
                    <span class="absolute right-0 min-w-max" style="min-width: max-content;" transition:fade={{ duration: 150 }}> Close </span>
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
        </div>
    </button>
    {#if expanded}
        <div
            transition:slide={{ duration: 300, easing: cubicInOut }}
            class="ov-gradient-y-primary fixed left-0 top-0 z-[100] flex max-h-screen w-screen flex-col bg-fy-primary"
            style="padding-top: {headerOffset}px;"
        >
            {@render children?.()}
        </div>
    {/if}
</header>
