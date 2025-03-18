<script>
    import { fade } from 'svelte/transition';

    import Notice from '$lib/components/cart/notice.svelte';

    export let notices = [];

    function removeNotice(id) {
        notices = notices.filter((notice) => notice.id !== id);
    }

    $: {
        // Loop through notices and set a timer to remove each notice after its timeout
        notices.forEach((notice) => {
            setTimeout(() => {
                removeNotice(notice.id);
            }, notice.timeout || 10000);
        });
    }
</script>

<div class="pointer-events-none fixed bottom-10 z-[121] flex w-full @md:bottom-24 @md:justify-around">
    <div class="flex w-full flex-col justify-center px-3 @md:w-1/2 @md:max-w-[412px]">
        {#each notices as notice}
            <div transition:fade class="pointer-events-auto py-1">
                <Notice text={notice.text} undoCallback={notice.undoCallback} closeable={notice.closeable}>
                    {#snippet icon()}
                        {#if notice.image}
                            <div class="relative aspect-square h-8 rounded bg-gray-300 bg-cover shadow" style={`background-image: url("${notice.image}");`}></div>
                        {:else}
                            <div
                                class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200"
                            >
                                <svg class="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
                                </svg>
                                <span class="sr-only">Warning icon</span>
                            </div>
                        {/if}
                    {/snippet}
                </Notice>
            </div>
        {/each}
    </div>
</div>
