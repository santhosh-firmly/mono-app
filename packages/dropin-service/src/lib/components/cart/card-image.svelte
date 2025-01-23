<script>
    /**
     * Image source URL or Blob.
     */
    export let src;

    /**
     * Image description.
     */
    export let alt = '';

    export let showImageBorder = true;

    let loaded = false;
    let errored = false;

    function onLoad() {
        loaded = true;
    }

    function onError() {
        errored = true;
    }
</script>

<div class="w-full max-w-[8rem]">
    <img
        {src}
        {alt}
        class:image={showImageBorder}
        class:rounded-lg={showImageBorder}
        class:outline={showImageBorder}
        class:outline-1={showImageBorder}
        class:hidden={!loaded}
        on:error={onError}
        on:load={onLoad}
    />
    {#if errored || !loaded}
        <div class="image aspect-square rounded-lg outline outline-1" class:animate-pulse={!errored}></div>
    {/if}
</div>

<style lang="scss">
    @use 'sass:color';

    .image {
        background-color: #e0e0e0;
        outline-color: color.adjust($color: #e0e0e0, $alpha: -0.75);
        outline-offset: -1px;
        box-shadow: -2px 0px 6px 0px rgba(136, 136, 136, 0.25);
    }
</style>
