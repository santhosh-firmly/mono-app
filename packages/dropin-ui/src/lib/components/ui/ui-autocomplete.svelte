<script>
	import { clickOutside } from '$lib/directives/click-outside';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} UiAutocompleteProps
	 * @property {Array<{id: string, value: string}>} options - The options to display in the autocomplete
	 * @property {Function} onSelect - The function to call when an option is selected
	 * @property {Object} input - The input component to use in the autocomplete
	 * @property {string} value - The value of the input
	 */

	/**
	 * @type {UiAutocompleteProps}
	 */
	let {
		options = [],
		onSelect = () => {},
		input,
		value = $bindable(''),
		bottomContent = null,
		isOpen = $bindable(value.length > 2)
	} = $props();

	let selectedIndex = $state(-1);

	let haveMininalLength = $derived(value.length > 2);
	let haveOptions = $derived(options.length > 0);

	function handleKeyDown(event) {
		if (!isOpen && event.key === 'ArrowDown') {
			isOpen = true;
			return;
		}

		if (!isOpen) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, options.length - 1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, -1);
				break;
			case 'Enter':
				event.preventDefault();
				if (selectedIndex >= 0) {
					selectOption(options[selectedIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				selectedIndex = -1;
				break;
		}
	}

	function handleInput(inputValue) {
		value = inputValue;
		isOpen = true;
		selectedIndex = -1;
	}

	function selectOption(option) {
		onSelect(option);
		isOpen = false;
		selectedIndex = -1;
	}

	function handleClickOutside() {
		isOpen = false;
		selectedIndex = -1;
	}
</script>

<div
	class="relative w-full"
	role="combobox"
	aria-controls="autocomplete-options"
	aria-expanded={isOpen}
	aria-label="Autocomplete"
	tabindex="0"
	use:clickOutside={{ callback: handleClickOutside }}
	onfocus={(ev) => {
		// To don't break the ARIA it is passing the focus for the input (only ui-input component)
		ev.target.children[0].children[0].focus();
	}}
	onkeydown={handleKeyDown}
>
	{@render input?.({
		value,
		handleInput
	})}

	{#if isOpen && haveMininalLength && haveOptions}
		<div
			class="border-border absolute left-[1%] z-10 mt-2 flex w-full max-w-[98%] flex-col justify-center rounded-lg border bg-white shadow-xl"
			transition:slide={{ duration: 150 }}
		>
			<div class="max-h-52 w-full overflow-auto p-1.5">
				{#each options as option, index (option.id)}
					<button
						class="hover:bg-border w-full cursor-pointer rounded px-2 py-1 text-left"
						class:bg-gray-50={index === selectedIndex}
						onclick={() => selectOption(option)}
						type="button"
					>
						{option.value}
					</button>
				{/each}
			</div>
			{#if bottomContent}
				<div class="border-border border-t">
					{@render bottomContent({
						handleClose: handleClickOutside
					})}
				</div>
			{/if}
		</div>
	{/if}
</div>
