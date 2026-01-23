<script>
	import { clickOutside } from '$lib/directives/click-outside';
	import { slide } from 'svelte/transition';

	/**
	 * @typedef {Object} UiAutocompleteProps
	 * @property {Array<{id: string, value: string}>} options - The options to display in the autocomplete
	 * @property {Function} onSelect - The function to call when an option is selected
	 * @property {Object} input - The input component to use in the autocomplete
	 * @property {string} value - The value of the input
	 * @property {string} highlightQuery - The query string to highlight in options
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
		isOpen = $bindable(value.length > 2),
		highlightQuery = ''
	} = $props();

	function getHighlightedParts(text, query) {
		if (!query || query.length < 2) return [{ text, bold: false }];

		const lowerText = text.toLowerCase();
		const lowerQuery = query.toLowerCase();
		const parts = [];
		let lastIndex = 0;

		let index = lowerText.indexOf(lowerQuery);
		while (index !== -1) {
			if (index > lastIndex) {
				parts.push({ text: text.slice(lastIndex, index), bold: false });
			}
			parts.push({ text: text.slice(index, index + query.length), bold: true });
			lastIndex = index + query.length;
			index = lowerText.indexOf(lowerQuery, lastIndex);
		}

		if (lastIndex < text.length) {
			parts.push({ text: text.slice(lastIndex), bold: false });
		}

		return parts.length > 0 ? parts : [{ text, bold: false }];
	}

	let queryToHighlight = $derived(highlightQuery || value);

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
	role={isOpen ? 'combobox' : undefined}
	aria-controls={isOpen ? 'autocomplete-options' : undefined}
	aria-expanded={isOpen}
	aria-label={isOpen ? 'Autocomplete' : undefined}
	use:clickOutside={{ callback: handleClickOutside }}
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
						class={[
							'hover:bg-border w-full cursor-pointer rounded px-2 py-1 text-left',
							{ 'bg-gray-50': index === selectedIndex }
						]}
						onclick={() => selectOption(option)}
						type="button"
					>
						{#each getHighlightedParts(option.value, queryToHighlight) as part, index (index)}
							{#if part.bold}
								<span class="font-bold">{part.text}</span>
							{:else}
								{part.text}
							{/if}
						{/each}
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
