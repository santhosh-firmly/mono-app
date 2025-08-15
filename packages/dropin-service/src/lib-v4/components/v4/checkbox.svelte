<script>
	// @ts-nocheck

	import { createEventDispatcher } from 'svelte';
	import { slide } from 'svelte/transition';

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

	export let expanded = false;

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
		class="text-fy-action disabled:text-fy-on-primary-subtle mr-3 h-5 w-5 rounded border-gray-300"
		{disabled}
	/>
	<div class="flex w-full flex-col gap-1">
		<slot name="title">
			<div class="flex w-full flex-row items-center justify-between">
				<span data-testid="checkbox-title" class={titleClasses}>
					{title}
				</span>
				<button
					type="button"
					aria-label="Toggle expanded"
					on:click={() => (expanded = !expanded)}
					class="rounded p-1 transition-colors hover:bg-gray-100"
				>
					<svg
						class="h-4 w-4 transition-transform duration-200 {expanded
							? 'rotate-180'
							: ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>
		</slot>
		{#if expanded && subtitle}
			<span
				transition:slide
				data-testid="checkbox-subtitle"
				class="text-fy-on-secondary-subtle text-xs font-normal"
			>
				{subtitle}
			</span>
		{/if}
	</div>
</label>
