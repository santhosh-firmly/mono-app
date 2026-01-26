<script>
	import { Switch } from 'bits-ui';

	/**
	 * @typedef {Object} PanelToggleProps
	 * @property {boolean} [checked] - Two-way bindable toggle state
	 * @property {boolean} [disabled] - Disable the toggle
	 * @property {Function} [onchange] - Called when toggle state changes
	 */

	/** @type {PanelToggleProps} */
	let { checked = $bindable(false), disabled = false, onchange = () => {} } = $props();

	function handleCheckedChange(newChecked) {
		checked = newChecked;
		onchange(newChecked);
	}
</script>

<Switch.Root
	{checked}
	{disabled}
	onCheckedChange={handleCheckedChange}
	class="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
>
	{#snippet children({ checked: isChecked })}
		<span
			class="pointer-events-none block size-4 rounded-full bg-white shadow-sm ring-0 transition-transform {isChecked
				? 'translate-x-4'
				: 'translate-x-0'}"
		></span>
	{/snippet}
</Switch.Root>
