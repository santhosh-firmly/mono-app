<script>
	import { clickOutside } from '../actions/click-outside.js';
	import { getColumnType, getColumnFilterOptions } from '../utils/data-utils.js';
	import * as Select from '$lib/components/ui/select';

	/**
	 * Filter popover component
	 */
	let {
		show,
		buttonRef,
		selectedColumnId,
		columns,
		data,
		filterCondition = $bindable(),
		filterValue = $bindable(),
		filterValue2 = $bindable(),
		selectedValues = $bindable(),
		onApply,
		onClose,
		externalFilterOptions = {} // External options for select filters: { columnId: [{value, label}] }
	} = $props();

	let columnType = $derived(
		selectedColumnId ? getColumnType(selectedColumnId, columns, data) : 'string'
	);
	let isNumeric = $derived(columnType === 'number');
	let isBoolean = $derived(columnType === 'boolean');
	let isSelect = $derived(columnType === 'select');
	let isDate = $derived(columnType === 'date');
	let filterOptions = $derived(
		isSelect || isBoolean
			? getColumnFilterOptions(selectedColumnId, columns, data, externalFilterOptions)
			: []
	);
	let columnName = $derived(columns.find((c) => c.id === selectedColumnId)?.name || '');

	const NUMERIC_CONDITIONS = [
		{ value: 'equals', label: 'is equal to' },
		{ value: 'not_equals', label: 'is not equal to' },
		{ value: 'greater_than', label: 'is greater than' },
		{ value: 'less_than', label: 'is less than' },
		{ value: 'between', label: 'is between' }
	];

	const STRING_CONDITIONS = [
		{ value: 'equals', label: 'is equal to' },
		{ value: 'not_equals', label: 'is not equal to' },
		{ value: 'contains', label: 'contains' },
		{ value: 'starts_with', label: 'starts with' },
		{ value: 'ends_with', label: 'ends with' }
	];

	const DATE_CONDITIONS = [
		{ value: 'equals', label: 'is on' },
		{ value: 'not_equals', label: 'is not on' },
		{ value: 'after', label: 'is after' },
		{ value: 'before', label: 'is before' },
		{ value: 'between', label: 'is between' }
	];

	let conditionOptions = $derived(
		isDate ? DATE_CONDITIONS : isNumeric ? NUMERIC_CONDITIONS : STRING_CONDITIONS
	);

	let selectedConditionLabel = $derived(
		conditionOptions.find((o) => o.value === filterCondition)?.label || ''
	);

	let searchTerm = $state('');
	let filteredOptions = $derived(
		filterOptions.filter((option) =>
			option.label.toLowerCase().includes(searchTerm.toLowerCase())
		)
	);

	// Determine if the Apply button should be disabled
	let isApplyDisabled = $derived.by(() => {
		if (isSelect) {
			return selectedValues.length === 0 || filterOptions.length === 0;
		}
		if (isBoolean) {
			return (filterValue !== true && filterValue !== false) || filterOptions.length === 0;
		}
		// String/number/date filters
		if (!filterValue) return true;
		if (filterCondition === 'between' && !filterValue2) return true;
		return false;
	});

	// Reset search term when popover opens/closes or column changes
	$effect(() => {
		if (!show || selectedColumnId) {
			searchTerm = '';
		}
	});
</script>

{#if show && buttonRef}
	<div
		class="absolute top-full left-0 z-50 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
		use:clickOutside={onClose}
		style="left: {buttonRef?.offsetLeft || 0}px"
	>
		<h3 class="mb-4 text-sm font-medium text-gray-900 dark:text-gray-100">
			Filter by: {columnName}
		</h3>

		<div class="space-y-3">
			{#if isBoolean}
				<!-- Radio buttons for boolean -->
				<div class="space-y-2 rounded border border-gray-300 p-3 dark:border-gray-600">
					{#if filterOptions.length === 0}
						<div class="py-6 text-center">
							<p class="text-sm text-gray-500 dark:text-gray-400">
								No values available
							</p>
							<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
								All rows are empty for this column
							</p>
						</div>
					{:else}
						{#each filterOptions as option (option.value)}
							<label
								class="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<input
									type="radio"
									name="boolean-filter"
									class="border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
									checked={filterValue === option.value}
									onchange={() => {
										filterValue = option.value;
									}}
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300"
									>{option.label}</span
								>
							</label>
						{/each}
					{/if}
				</div>
			{:else if isSelect}
				<!-- Multi-select checkboxes with search -->
				<!-- Search input -->
				{#if filterOptions.length > 0}
					<div>
						<input
							type="text"
							bind:value={searchTerm}
							placeholder="Search values..."
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
						/>
					</div>
				{/if}

				<div
					class="max-h-64 space-y-2 overflow-y-auto rounded border border-gray-300 p-3 dark:border-gray-600"
				>
					{#if filterOptions.length === 0}
						<div class="py-6 text-center">
							<p class="text-sm text-gray-500 dark:text-gray-400">
								No values available
							</p>
							<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
								All rows are empty for this column
							</p>
						</div>
					{:else if filteredOptions.length === 0}
						<div class="py-6 text-center">
							<p class="text-sm text-gray-500 dark:text-gray-400">No matches found</p>
							<p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
								Try a different search term
							</p>
						</div>
					{:else}
						{#each filteredOptions as option, idx (idx)}
							<label
								class="flex cursor-pointer items-center gap-2 rounded p-1 hover:bg-gray-50 dark:hover:bg-gray-700"
							>
								<input
									type="checkbox"
									class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
									checked={selectedValues.includes(option.value)}
									onchange={(e) => {
										if (e.currentTarget.checked) {
											selectedValues = [...selectedValues, option.value];
										} else {
											selectedValues = selectedValues.filter(
												(v) => v !== option.value
											);
										}
									}}
								/>
								<span class="text-sm text-gray-700 dark:text-gray-300"
									>{option.label}</span
								>
							</label>
						{/each}
					{/if}
				</div>
			{:else}
				<!-- Condition selector for string/number filters -->
				<div>
					<Select.Root
						type="single"
						value={filterCondition}
						onValueChange={(v) => {
							filterCondition = v;
						}}
					>
						<Select.Trigger class="w-full">
							<Select.Value placeholder="Select condition">
								{#if selectedConditionLabel}
									{selectedConditionLabel}
								{/if}
							</Select.Value>
						</Select.Trigger>
						<Select.Content>
							{#each conditionOptions as option}
								<Select.Item value={option.value} label={option.label} />
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				{#if filterCondition === 'between'}
					<div class="flex items-center gap-2">
						<input
							type={isDate ? 'date' : 'number'}
							bind:value={filterValue}
							placeholder={isDate ? '' : 'Min'}
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
							onkeydown={(e) => {
								if (e.key === 'Enter') onApply();
								if (e.key === 'Escape') onClose();
							}}
						/>
						<span class="text-sm text-gray-500 dark:text-gray-400">and</span>
						<input
							type={isDate ? 'date' : 'number'}
							bind:value={filterValue2}
							placeholder={isDate ? '' : 'Max'}
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
							onkeydown={(e) => {
								if (e.key === 'Enter') onApply();
								if (e.key === 'Escape') onClose();
							}}
						/>
					</div>
				{:else}
					<div>
						<input
							type={isDate ? 'date' : isNumeric ? 'number' : 'text'}
							bind:value={filterValue}
							placeholder={isDate ? '' : isNumeric ? '0' : 'Enter value...'}
							class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
							onkeydown={(e) => {
								if (e.key === 'Enter') onApply();
								if (e.key === 'Escape') onClose();
							}}
						/>
					</div>
				{/if}
			{/if}

			<button
				onclick={onApply}
				disabled={isApplyDisabled}
				class="w-full rounded bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-600 dark:disabled:text-gray-400"
			>
				Apply
			</button>
		</div>
	</div>
{/if}
