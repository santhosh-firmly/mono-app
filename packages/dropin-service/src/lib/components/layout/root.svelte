<script>
    import Skeleton from './skeleton.svelte';

    let { isLoading = false, aside, bside, summary } = $props();
</script>

<div class="@container relative min-h-full">
    <div class="fixed bottom-0 left-0 right-0 top-0 z-[-1] @md:bg-fy-primary"></div>
    <div class="fixed bottom-0 right-0 top-0 z-[-1] w-1/2 shadow @md:bg-fy-background"></div>
    <div class="flex w-full flex-row justify-center">
        <form class="w-full @md:flex @md:max-w-[1024px] @md:flex-row @md:justify-around">
            <section class="flex flex-col items-center @md:h-full @md:w-1/2 @md:max-w-[412px] @md:py-16">
                {@render aside?.({ isLoading, summary })}
            </section>
            <section class="bg-fy-background @md:w-1/2 @md:max-w-[412px] @md:py-16">
                {#if !isLoading}
                    {@render bside?.({ summary })}
                {:else}
                    <Skeleton />
                {/if}
            </section>
        </form>
    </div>
</div>
