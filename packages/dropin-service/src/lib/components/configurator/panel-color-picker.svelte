<script>
	/**
	 * @typedef {Object} PanelColorPickerProps
	 * @property {string} [value] - Two-way bindable hex color value
	 * @property {string} [label] - Label text
	 * @property {Function} [onchange] - Called when color changes
	 */

	/** @type {PanelColorPickerProps} */
	let { value = $bindable('#000000'), label = '', onchange = () => {} } = $props();

	function handleInput(event) {
		value = event.target.value;
		onchange(value);
	}
</script>

<div class="flex items-center justify-between">
	<span class="text-xs text-gray-700">{label}</span>
	<label
		class="flex cursor-pointer items-center gap-2 overflow-hidden rounded-md border border-gray-200 bg-white transition-colors hover:border-gray-300"
	>
		<input type="color" class="sr-only" {value} oninput={handleInput} />
		<div class="h-6 w-6 rounded-l-sm" style:background-color={value}></div>
		<span class="pr-2 font-mono text-xs text-gray-600">{value}</span>
	</label>
</div>
