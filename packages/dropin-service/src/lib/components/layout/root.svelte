<script>
    import Skeleton from './skeleton.svelte';

    let { isLoading = false, aside, bside } = $props();
</script>

<div class="md:bg-fy-primary fixed bottom-0 left-0 right-0 top-0 z-[-1]"></div>
<div class="md:bg-fy-background fixed bottom-0 right-0 top-0 z-[-1] w-1/2 shadow"></div>
<div class="flex w-full flex-row justify-center">
    <form class="w-full md:flex md:max-w-[1024px] md:flex-row md:justify-around">
        <section class="flex flex-col items-center md:h-full md:w-1/2 md:max-w-[412px] md:py-16">
            {@render aside?.(isLoading)}
        </section>
        <section class="bg-fy-background md:w-1/2 md:max-w-[412px] md:py-16">
            {#if !isLoading}
                {@render bside?.()}
            {:else}
                <Skeleton />
            {/if}
        </section>
    </form>
</div>
