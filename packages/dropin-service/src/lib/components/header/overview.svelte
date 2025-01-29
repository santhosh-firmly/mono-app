<script>
    // @ts-nocheck
    import classNames from 'classnames';
    import { onMount } from 'svelte';

    import Header from './header.svelte';

    import CardStack from '$lib/components/cart/card-stack.svelte';
    import { formatCurrency } from '$lib/utils.js';

    /**
     * Merchant information to be used in the back button.
     */
    export let merchantInfo = {};

    /**
     * Images to show in product card stack.
     */
    export let images = null;

    /**
     * Total items in cart.
     */
    export let quantity;

    /**
     * Total cost of the current cart
     */
    export let total = null;

    let toggleExpanded;

    let showMiniOverview = false;

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
        <Header {merchantInfo} {total} skeleton={!images} on:back-click bind:toggleExpanded {showMiniOverview}>
            <div slot="smallSummary" class="relative mx-2 h-7 w-7 rounded bg-gray-300 bg-cover shadow" style={`background-image: url(${images?.[0]});`}>
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
            <div class="h-full overflow-scroll px-4">
                <slot />
            </div>
        </Header>
        <div bind:this={overviewElement} class="flex w-full flex-col p-4 max-md:items-center md:items-start">
            <div class="py-7 md:hidden">
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
                <slot />
            </div>
        </div>
    </div>
    <button aria-label="Toggle details" class="absolute left-0 top-0 h-full w-full border-0 bg-transparent md:hidden" on:click={toggleExpanded}></button>
</div>
