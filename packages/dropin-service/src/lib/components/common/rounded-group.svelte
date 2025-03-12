<script>
    import Group from '$lib/components/common/group.svelte';

    /**
     * @typedef {Object} RoundedGroupProps
     * @property {boolean} isLoading - Whether or not the group is loading
     * @property {function} skeleton - Function to render the skeleton
     * @property {number} skeletonQuantity - Number of skeletons to render
     * @property {Array} items - List of items to be rendered
     * @property {function} item - Function to render each item
     * @property {function} children - Function to render additional content
     */

    /**
     * @type {RoundedGroupProps}
     */
    let { isLoading = true, skeleton, skeletonQuantity = 3, items, item, children } = $props();
</script>

<Group>
    {#if isLoading}
        <!-- no used-vars disabled -->
        {#each Array(skeletonQuantity) as index}
            <label class="col-span-2 flex w-full flex-row items-center gap-3 border px-3 py-2">
                {@render skeleton?.(index)}
            </label>
        {/each}
    {/if}

    {#if !isLoading}
        {#each items as data, index}
            <label class="col-span-2 flex w-full flex-row items-center gap-3 border-0 px-3 py-3">
                {@render item?.(data, index)}
            </label>
        {/each}
        {#if children}
            <label class="col-span-2 flex w-full flex-row items-center gap-3 border-0 px-3 py-3">
                {@render children()}
            </label>
        {/if}
    {/if}
</Group>

<style scoped lang="postcss">
    label:first-of-type {
        @apply rounded-t-lg;
    }

    label:last-of-type {
        @apply rounded-b-lg;
    }

    label:only-of-type {
        @apply rounded-lg;
    }
</style>
