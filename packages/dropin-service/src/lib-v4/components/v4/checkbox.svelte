<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	/**
	 *  Set if the checkbox should already be checked
	 */
	export let isChecked = false;

	/**
	 * Title of the checkbox
	 */
	export let title = '';

	/**
	 * Subtitle of the checkbox
	 */
	export let subtitle = '';

	export let labelClasses = 'w-full px-4 py-3 flex rounded-lg bg-fy-surface-subtle';

	export let titleClasses = 'font-medium text-fy-on-secondary text-sm';

	export let disabled = false;

	// Handle checkbox change event
	function handleCheckboxChange(event) {
		dispatch('checkboxChanged', { isChecked: event.target.checked });
	}
</script>

<label class={labelClasses}>
	<input
		data-testid="checkbox"
		type="checkbox"
		bind:checked={isChecked}
		on:change={handleCheckboxChange}
		class="mr-3 h-5 w-5 rounded border-gray-300 text-fy-action disabled:text-fy-on-primary-subtle"
		{disabled}
	/>
	<div class="flex flex-col gap-1">
		<slot name="title">
			<span data-testid="checkbox-title" class={titleClasses}>
				{title}
			</span>
		</slot>
		{#if subtitle}
			<span data-testid="checkbox-subtitle" class="font-normal text-fy-on-secondary-subtle text-xs">
				{subtitle}
			</span>
		{/if}
	</div>
</label>
