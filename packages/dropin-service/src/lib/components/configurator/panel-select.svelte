<script>
	import { Select } from 'bits-ui';
	import Icon from '$lib/components/ui/icons/icon.svelte';

	/**
	 * @typedef {Object} PanelSelectProps
	 * @property {string} [value] - Two-way bindable selected value
	 * @property {Array<{value: string, label: string}>} [options] - Select options
	 * @property {string} [placeholder] - Placeholder text when no selection
	 * @property {Function} [onchange] - Called when selection changes
	 */

	/** @type {PanelSelectProps} */
	let {
		value = $bindable(''),
		options = [],
		placeholder = 'Select an option',
		onchange = () => {}
	} = $props();

	let selectedLabel = $derived(
		value ? options.find((opt) => opt.value === value)?.label : placeholder
	);

	function handleValueChange(newValue) {
		value = newValue;
		onchange(newValue);
	}
</script>

<Select.Root type="single" {value} onValueChange={handleValueChange} items={options}>
	<Select.Trigger
		class="flex h-8 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 transition-colors hover:border-gray-300 focus:ring-2 focus:ring-black/20 focus:outline-none"
	>
		<span class={[value ? 'text-gray-900' : 'text-gray-400']}>{selectedLabel}</span>
		<Icon icon="mdi:chevron-down" class="text-sm text-gray-400" />
	</Select.Trigger>

	<Select.Content
		class="z-50 w-(--bits-select-anchor-width) rounded-md border border-gray-200 bg-white p-1 shadow-lg"
		sideOffset={4}
	>
		{#each options as option (option.value)}
			<Select.Item
				value={option.value}
				label={option.label}
				class="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs text-gray-700 outline-none data-highlighted:bg-gray-100"
			>
				{#snippet children({ selected })}
					<span class={[selected && 'font-medium text-gray-900']}>
						{option.label}
					</span>
					{#if selected}
						<Icon icon="mdi:check" class="text-sm text-gray-900" />
					{/if}
				{/snippet}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
