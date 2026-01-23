<script>
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} CheckboxProps
	 * @property {boolean} [isChecked] - Two-way bindable checked state
	 * @property {string} [title] - Main label text
	 * @property {string} [subtitle] - Expandable description text
	 * @property {boolean} [disabled] - Disable interaction
	 * @property {Function} [onChange] - Handler called when checked state changes
	 * @property {import('svelte').Snippet} [children] - Additional content after title
	 * @property {string} [id] - Input element ID
	 * @property {string} [labelClass] - CSS classes for the label wrapper
	 */

	/** @type {CheckboxProps} */
	let {
		isChecked = $bindable(false),
		title = '',
		subtitle = '',
		disabled = false,
		onChange = () => {},
		children,
		id = `checkbox-${crypto.randomUUID()}`,
		labelClass = 'bg-gray-50 px-4 py-3'
	} = $props();

	let expanded = $state(false);

	function handleCheckboxChange(event) {
		isChecked = event.target.checked;
		onChange(event.target.checked);
	}
</script>

<label
	class={['flex w-full cursor-pointer rounded-lg', labelClass, disabled && 'cursor-not-allowed']}
>
	<input
		{id}
		type="checkbox"
		bind:checked={isChecked}
		onchange={handleCheckboxChange}
		{disabled}
		data-testid="checkbox"
		class="sr-only"
	/>
	<span
		class={[
			'mr-3 flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
			isChecked ? 'border-primary bg-primary' : 'border-gray-300 bg-white',
			disabled && 'opacity-50'
		]}
	>
		{#if isChecked}
			<svg class="size-3 text-white" viewBox="0 0 12 12" fill="none">
				<path
					d="M10 3L4.5 8.5L2 6"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		{/if}
	</span>
	<div class="flex w-full flex-col gap-1">
		<div class="flex w-full flex-row items-center justify-between">
			<span
				data-testid="checkbox-title"
				class={['text-sm font-medium', disabled ? 'text-gray-400' : 'text-gray-700']}
			>
				{title}
				{@render children?.()}
			</span>
			{#if subtitle}
				<button
					type="button"
					aria-label="Toggle expanded"
					onclick={() => (expanded = !expanded)}
					class="rounded p-1 transition-colors hover:bg-gray-100"
				>
					<svg
						class={[
							'size-4  transition-transform duration-200',
							expanded && 'rotate-180'
						]}
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
			{/if}
		</div>
		{#if expanded && subtitle}
			<span
				data-testid="checkbox-subtitle"
				class="text-xs font-normal text-gray-500"
				transition:slide={{ duration: 200 }}
			>
				{subtitle}
			</span>
		{/if}
	</div>
</label>
