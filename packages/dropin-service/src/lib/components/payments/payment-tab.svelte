<script>
    // @ts-nocheck
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    /**
     * @typedef {Object} PaymentTabProps
     * @property {string} text - The text to display
     * @property {boolean} active - Whether the tab is active
     * @property {boolean} disabled - Whether the tab is disabled
     * @property {Snippet} children - Default content slot snippet
     */
    /**
     * @type {PaymentTabProps}
     */
    let { text, active, disabled, children } = $props();
</script>

<button
    type="button"
    class="flex w-20 min-w-[80px] flex-col justify-between rounded-lg border border-fy-on-surface bg-fy-surface px-3 py-2 hover:opacity-100 hover:shadow-lg"
    class:shadow-lg={active}
    class:opacity-50={!active}
    {disabled}
    onclick={() => {
        dispatch('click', text);
    }}
>
    {@render children?.()}
    <span class="pt-1 text-left text-xs leading-none text-fy-on-surface">{text}</span>
</button>
