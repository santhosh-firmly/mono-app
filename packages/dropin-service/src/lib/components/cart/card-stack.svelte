<script>
    // @ts-nocheck
    import CardImage from '$lib/components/cart/card-image.svelte';

    /**
     * @typedef {Object} CardStackProps
     * @property {Array<string>|null} images - List of image URLs to display
     * @property {number} maxImages - Maximum number of images to show in the stack
     * @property {number} horizontalOffsetPx - Horizontal offset between stacked cards in pixels
     * @property {number} verticalOffsetPx - Vertical offset between stacked cards in pixels
     */

    /**
     * @type {CardStackProps}
     */
    let { images = null, maxImages = 3, horizontalOffsetPx = 24, verticalOffsetPx = 16 } = $props();
</script>

<div class="relative flex flex-row">
    {#if !images}
        <div class="w-32">
            <CardImage />
        </div>
    {:else}
        {#each images.slice(-maxImages).reverse() as image, index}
            <div class="w-32" style={[index > 0 ? `margin-left: -${128 - horizontalOffsetPx}px` : '', `margin-top: ${index * verticalOffsetPx}px;`].join('; ')}>
                <CardImage src={image} alt="Product" />
            </div>
        {/each}
    {/if}
</div>
