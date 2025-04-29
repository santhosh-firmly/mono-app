<script>
	import Icon from '@iconify/svelte';

	/**
	 * @typedef {Object} CheckboxProps
	 * @property {boolean} isChecked - Whether the checkbox is checked
	 * @property {string} title - The title of the checkbox
	 * @property {string} subtitle - The subtitle of the checkbox
	 * @property {boolean} disabled - Whether the checkbox is disabled
	 * @property {Function} onChange - The function to call when the checkbox is changed
	 * @property {SvelteComponent} children - The children of the checkbox
	 */

	/**
	 * @type {CheckboxProps}
	 */
	let {
		isChecked = $bindable(false),
		title = '',
		subtitle = '',
		disabled = false,
		onChange = () => {},
		children,
		id = `checkbox-${Math.random().toString(36).substring(2, 9)}`
	} = $props();

	function handleCheckboxChange(event) {
		onChange(event.target.checked);
	}
</script>

<div class="flex items-center">
	<div class="checkbox-container {disabled ? 'checkbox-container--disabled' : ''}">
		<input
			{id}
			type="checkbox"
			bind:checked={isChecked}
			onchange={handleCheckboxChange}
			{disabled}
			class="peer absolute h-full w-full cursor-pointer opacity-0"
		/>
		<div class="checkbox-visual flex items-center justify-center">
			{#if isChecked}
				<Icon icon="material-symbols:check-small" class="text-sm text-white" />
			{/if}
		</div>
	</div>
	<div class="ml-2 flex flex-col gap-1">
		<label
			for={id}
			class="{disabled ? 'text-muted cursor-not-allowed' : 'text-primary'} text-sm"
		>
			{title}
			{@render children?.()}
		</label>
		{#if subtitle}
			<span class="text-muted text-xs font-normal">
				{subtitle}
			</span>
		{/if}
	</div>
</div>

<style lang="postcss">
	@reference '../../../app.css';

	.checkbox-container {
		@apply relative flex h-4 w-4 items-center justify-center rounded-md;
	}

	.checkbox-visual {
		@apply border-primary h-4 w-4 rounded-md border bg-white transition-colors;
	}

	input:checked + .checkbox-visual {
		@apply bg-primary border-primary;
	}

	input:focus + .checkbox-visual {
		@apply ring-primary/20 outline-primary ring-4 outline;
	}

	.checkbox-container--disabled .checkbox-visual {
		@apply border-muted bg-muted cursor-not-allowed;
	}

	.checkbox-container--disabled input {
		@apply cursor-not-allowed;
	}
</style>
