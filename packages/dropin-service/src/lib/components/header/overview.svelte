<script>
    // @ts-nocheck
    import classNames from 'classnames';
    import { onMount } from 'svelte';

    import CardStack from '$lib/components/cart/card-stack.svelte';
    import Header from '$lib/components/header/header.svelte';
    import { formatCurrency } from '$lib/utils.js';

    /**
     * @typedef {Object} OverviewProps
     * @property {Object} merchantInfo - Merchant information for display
     * @property {Array<string>|null} images - Images to show in product card stack
     * @property {number} quantity - Total items in cart
     * @property {number|null} total - Total cost of the current cart
     * @property {Function} children - Function to render additional content
     * @property {Function} onBack - Callback function for back button
     */

    /**
     * @type {OverviewProps}
     */
    let { merchantInfo = {}, images = null, quantity, total = null, children, onBack = () => {} } = $props();

    let toggleExpanded = $state();

    let showMiniOverview = $state(false);

    let overviewElement;

    onMount(() => {
        let options = {
            root: null,
            rootMargin: '0px',
            threshold: [0],
        };
        const observer = new IntersectionObserver((entries) => {
            showMiniOverview = !entries[0].isIntersecting;
        }, options);

        observer.observe(overviewElement);

        return () => {
            observer.disconnect();
        };
    });
</script>

<div class="relative w-full">
    <div class="flex w-full flex-col items-center bg-fy-primary max-md:px-3 max-md:pb-3 max-md:pt-12">
        <Header {merchantInfo} {total} skeleton={!images} on:back-click={() => onBack()} bind:toggleExpanded {showMiniOverview}>
            {#snippet smallSummary()}
                <div class="relative mx-2 h-7 w-7 rounded bg-gray-300 bg-cover shadow">
                    <span
                        class={classNames(
                            'bg-fy-alert',
                            'text-fy-on-alert',
                            'shadow',
                            'absolute',
                            'rounded-full',
                            'w-4',
                            'h-4',
                            'text-xs',
                            'right-[-5px]',
                            'bottom-[-5px]',
                            'flex',
                            'items-center',
                            'justify-center',
                            'font-bold',
                        )}
                    >
                        {quantity || '?'}
                    </span>
                </div>
            {/snippet}
            <div class="h-full overflow-scroll px-4">
                {@render children?.()}
            </div>
        </Header>
        <div bind:this={overviewElement} class="flex w-full flex-col p-4 @md:items-start max-md:items-center">
            <div class="py-7 @md:hidden">
                <CardStack {images} />
            </div>
            {#if !images}
                <div class="m-1 h-4 w-20 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
                <div class="m-1 h-6 w-20 animate-pulse rounded bg-fy-on-primary-subtle2"></div>
            {:else}
                <span class="pt-1 text-fy-on-primary-subtle">Order Total ({quantity} item{quantity > 1 ? 's' : ''})</span>
                <span class="text-4xl font-semibold leading-normal text-fy-on-primary">{formatCurrency(total)}</span>
            {/if}
            <div class="w-full py-2 max-md:hidden">
                {@render children?.()}
            </div>
        </div>
    </div>
    <button aria-label="Toggle details" class="absolute left-0 top-0 h-full w-full border-0 bg-transparent md:hidden" onclick={toggleExpanded}></button>
</div>
