<script>
	import Icon from '@iconify/svelte';

	let timer = null;

	/**
	 * @typedef {Object} UiQuantitySelectorProps
	 * @property {number} quantity - The quantity of the quantity selector
	 * @property {Function} onChange - The onChange of the quantity selector
	 * @property {boolean} disabled - Whether the quantity selector is disabled
	 * @property {number} delay - The delay of the quantity selector
	 */

	/**
	 * @type {UiQuantitySelectorProps}
	 */
	let { quantity = $bindable(1), onChange, disabled, delay } = $props();

	function handlePlus() {
		clearTimeout(timer);
		quantity += 1;
		timer = setTimeout(() => onChange(quantity), delay);
	}

	function handleMinus() {
		if (quantity === 0) return;
		clearTimeout(timer);
		quantity -= 1;
		timer = setTimeout(() => onChange(quantity), delay);
	}

	function handleInput(event) {
		const value = parseInt(event.target.value, 10);
		if (!isNaN(value) && value >= 0) {
			clearTimeout(timer);
			quantity = value;
			timer = setTimeout(() => onChange(quantity), delay);
		}
	}

	$effect(() => {
		return () => {
			clearTimeout(timer);
		};
	});
</script>

<div
	class="border-border flex h-6 w-fit items-center overflow-hidden rounded-lg border shadow {disabled
		? 'bg-border'
		: 'bg-white'}"
	class:bg-gray-200={disabled}
>
	<button {disabled} onclick={handleMinus}>
		<Icon icon={quantity <= 1 ? 'mdi:trash' : 'mdi:minus'} />
	</button>
	<input
		type="number"
		onchange={handleInput}
		{disabled}
		class="w-6 appearance-none text-center text-xs"
		min="0"
		value={quantity}
	/>
	<button {disabled} onclick={handlePlus}>
		<Icon icon="mdi:plus" />
	</button>
</div>

<style scoped lang="postcss">
	@reference '../../../app.css';

	button {
		@apply flex h-full w-8 cursor-pointer items-center justify-center text-xs transition-colors duration-200 hover:bg-gray-200 focus:bg-gray-200;
	}

	button:disabled {
		@apply cursor-default opacity-50 hover:bg-transparent focus:bg-transparent;
	}

	/* Chrome, Safari, Edge, Opera */
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Firefox */
	input[type='number'] {
		-moz-appearance: textfield;
	}
</style>
