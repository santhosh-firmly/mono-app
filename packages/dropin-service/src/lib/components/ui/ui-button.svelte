<script>
	/**
	 * Button component with customizable color and styling
	 * @typedef {Object} ButtonProps
	 * @property {string} [color] - Custom primary color value (CSS color)
	 * @property {string} [class] - Additional CSS classes to apply
	 * @property {() => any} [children] - Slot content to render inside button
	 */

	/**
	 * @type {ButtonProps}
	 */
	let { color = '', class: className, children, ...props } = $props();

	const style = $derived(`${color ? `--color-primary: ${color};` : ''}`);
</script>

<button
	{...props}
	class="flex w-full cursor-pointer items-center justify-center rounded px-4 py-3 shadow transition-colors duration-200 {className}"
	{style}
>
	{@render children?.()}
</button>

<style lang="postcss">
	button {
		background-color: var(--color-primary);
		color: var(--text-color, color-mix(in srgb, var(--color-primary) 0%, white 100%));
		@apply disabled:cursor-not-allowed disabled:opacity-50;
	}

	button:hover {
		background-color: color-mix(in srgb, var(--color-primary) 85%, black);
	}
</style>
