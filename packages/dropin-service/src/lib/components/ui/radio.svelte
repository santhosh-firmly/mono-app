<script>
	/**
	 * @typedef {Object} UiRadioProps
	 * @property {string} id - The id of the radio
	 * @property {string} name - The name of the radio
	 * @property {boolean} isSelected - Whether the radio is selected
	 * @property {Function} onSelect - The onSelect of the radio
	 * @property {import('svelte').Snippet} children - The content of the radio
	 */

	/**
	 * @type {UiRadioProps}
	 */
	let { id, name, isSelected, onSelect, children, class: className, disabled } = $props();
</script>

<div class={['flex items-center gap-3', className]}>
	<div class="relative flex size-5 items-center justify-center">
		<input
			type="radio"
			{id}
			{name}
			value={id}
			checked={isSelected}
			onchange={() => onSelect(id)}
			{disabled}
			class="
			border-border size-5 appearance-none rounded-full border-2
			{disabled ? 'cursor-not-allowed' : 'checked:border-primary cursor-pointer'}"
		/>
		{#if isSelected}
			<div
				class={[
					'pointer-events-none absolute size-2.5  rounded-full',
					{ 'bg-primary': !disabled, 'bg-gray-300': disabled }
				]}
			></div>
		{/if}
	</div>
	<label class="w-full" for={id}>
		{@render children?.()}
	</label>
</div>

<style>
	input[type='radio']:checked {
		background-image: none;
	}
</style>
