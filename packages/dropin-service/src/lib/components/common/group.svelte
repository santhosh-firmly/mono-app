<script>
    let { children, stretch = true, grid = true } = $props();
</script>

<div class="rounded-lg text-fy-on-surface" class:w-full={stretch} class:grid class:grid-cols-2={grid}>
    {@render children?.()}
</div>

<style lang="scss">
    div {
        & > :global(*) {
            background-color: var(--fy-surface);
            box-shadow: var(--fy-surface-box-shadow);
        }
    }
</style>
