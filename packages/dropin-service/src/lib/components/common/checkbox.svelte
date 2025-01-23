<script>
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    /**
     * @typedef {Object} CheckboxProps
     * @property {string} titleSnippet - Title snippet/slot
     * @property {string} title - Title text to display next to checkbox
     * @property {string} subtitle - Optional subtitle text to display below title
     * @property {boolean} isChecked - Whether the checkbox is checked
     * @property {boolean} disabled - Whether the checkbox is disabled
     * @property {string} labelClasses - CSS classes for the label wrapper
     * @property {string} titleClasses - CSS classes for the title text
     */

    /**
     * @type {CheckboxProps}
     */
    let {
        titleSnippet,
        title = '',
        subtitle = '',
        isChecked = false,
        disabled = false,
        labelClasses = 'w-full px-4 py-3 flex rounded-lg bg-fy-surface-subtle',
        titleClasses = 'font-medium text-fy-on-secondary text-sm'
    } = $props();

    // Handle checkbox change event
    function handleCheckboxChange(event) {
        dispatch('checkboxChanged', { isChecked: event.target.checked });
    }
</script>

<label class={labelClasses}>
    <input
        type="checkbox"
        bind:checked={isChecked}
        onchange={handleCheckboxChange}
        class="mr-3 h-5 w-5 rounded border-gray-300 text-fy-action disabled:text-fy-on-primary-subtle"
        {disabled}
    />
    <div class="flex flex-col gap-1">
        {#if titleSnippet}
            {@render titleSnippet()}
        {:else}
            <span class={titleClasses}>{title}</span>
        {/if}
        {#if subtitle}
            <span class="text-fy-on-secondary-subtle text-xs font-normal">
                {subtitle}
            </span>
        {/if}
    </div>
</label>
