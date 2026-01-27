<script>
	import { clickOutside } from '$lib/directives/click-outside';
	import { fade } from 'svelte/transition';

	/**
	 * @typedef {Object} UiInputProps
	 * @property {import('svelte').Ref} ref - The ref of the input
	 * @property {string} value - The value of the input
	 * @property {string} placeholder - The placeholder of the input
	 * @property {string} errorMessage - The error message of the input
	 * @property {boolean} onlyNumbers - Whether the input is only numbers
	 * @property {import('svelte').Snippet} suffix - The suffix of the input
	 * @property {import('svelte').Snippet} prefix - The prefix of the input
	 * @property {string} mask - The mask of the input
	 * @property {string} unmask - The unmask of the input
	 * @property {Function} clickoutside - The clickoutside of the input
	 * @property {boolean} onlyShowSuffixWhenValue - Whether to show the suffix only when the value is present
	 * @property {Function} onPressEnter - The onPressEnter of the input
	 * @property {Function} onChange - The onChange of the input
	 * @property {Function} onInput - The onInput of the input
	 * @property {Function} onBlur - The onBlur of the input
	 * @property {Function} onanimationstart - The onanimationstart of the input
	 * @property {string} [class] - The class of the input
	 */

	/**
	 * @type {UiInputProps}
	 */
	let {
		ref = $bindable(null),
		value = $bindable(''),
		placeholder = '',
		errorMessage,
		onlyNumbers = false,
		suffix,
		prefix,
		mask,
		unmask,
		clickoutside = () => {},
		onlyShowSuffixWhenValue = false,
		onPressEnter = () => {},
		onChange = () => {},
		onInput = () => {},
		onBlur = () => {},
		onanimationstart = () => {},
		...props
	} = $props();

	function isOnlyNumbers(value) {
		return /^\d+$/.test(value);
	}

	function handleKeyPress(event) {
		if (event.key === 'Enter') {
			onPressEnter();
		}
	}

	function handleChange(event) {
		const inputValue = event.target.value;
		onChange(unmask ? unmask(inputValue) : inputValue);
	}

	function handleInput(event) {
		const inputValue = event.target.value;

		if (onlyNumbers && !isOnlyNumbers(inputValue) && inputValue.length > 0) {
			event.preventDefault();
			event.target.value = mask ? mask(inputValue) : inputValue.replace(/\D/g, '');
			return;
		}

		value = unmask ? unmask(inputValue) : inputValue;

		onInput(value);
	}

	let maskedValue = $derived(mask ? mask(value) : value);
</script>

<div
	use:clickOutside={{ callback: clickoutside }}
	class={['input-container', { 'input-container--error': errorMessage }]}
>
	{#if prefix}
		<div class="mr-0.5 ml-2">
			{@render prefix?.(ref)}
		</div>
	{/if}
	<input
		{...props}
		class="min-h-[inherit] w-full flex-1 px-2.5 hover:outline-none focus:outline-none"
		bind:this={ref}
		value={maskedValue}
		onchange={handleChange}
		oninput={handleInput}
		onkeypress={handleKeyPress}
		onblur={onBlur}
		{onanimationstart}
		inputmode={onlyNumbers && !mask ? 'numeric' : 'text'}
		{placeholder}
	/>
	{#if (onlyShowSuffixWhenValue && value) || !onlyShowSuffixWhenValue}
		<div
			class="absolute top-0 right-2 flex h-full items-center justify-end"
			transition:fade={{ duration: 150 }}
		>
			{@render suffix?.(ref)}
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference '../../../app.css';

	.input-container {
		@apply relative flex h-full min-h-11 w-full items-center rounded-lg border border-gray-300 bg-white text-sm transition-colors duration-200;
	}

	.input-container:hover:not(:has(input:focus)) {
		@apply border-gray-400;
	}

	.input-container:has(input:focus) {
		@apply ring-primary/20 border-primary z-1 ring-4;
	}

	.input-container--error {
		@apply border-danger text-danger;
	}

	.input-container--error:has(input:focus) {
		@apply border-danger ring-4 ring-red-500/10;
	}
</style>
