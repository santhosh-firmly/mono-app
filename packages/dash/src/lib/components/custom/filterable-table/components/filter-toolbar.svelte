<script>
	import Filter from 'lucide-svelte/icons/filter';
	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';
	import Check from 'lucide-svelte/icons/check';
	import { clickOutside } from '../actions/click-outside.js';
	import FilterChip from './filter-chip.svelte';
	import FilterPopover from './filter-popover.svelte';
	import { getFilterableColumns, getColumnType } from '../utils/data-utils.js';

	/**
	 * Filter toolbar component - simplified with single Filters button
	 */
	let {
		columns,
		data,
		activeFilters = $bindable(),
		globalSearchText = $bindable(),
		onFilterApply,
		onFilterRemove,
		// Server-side mode props
		applyMode = 'auto',
		hasPendingChanges = false,
		onApplyFilters,
		filterOptions = {}
	} = $props();

	// Filter menu state
	let showFilterMenu = $state(false);
	let filterMenuButtonRef = $state(null);

	// Filter dialog state
	let showFilterDialog = $state(false);
	let editingFilter = $state(null);
	let selectedFilterColumn = $state(null);
	let filterCondition = $state('equals');
	let filterValue = $state('');
	let filterValue2 = $state('');
	let selectedValues = $state([]);
	let filterButtonRef = $state(null);

	function openFilterDialog(column = null, filter = null, buttonElement = null) {
		if (filter) {
			editingFilter = filter;
			selectedFilterColumn = filter.columnId;
			filterCondition = filter.condition;
			filterValue = filter.value || '';
			filterValue2 = filter.value2 || '';
			selectedValues = filter.values || [];
		} else {
			editingFilter = null;
			selectedFilterColumn = column?.id || null;
			const colType = column ? getColumnType(column.id, columns, data) : 'string';
			if (colType === 'select') {
				filterCondition = 'in';
			} else {
				filterCondition = 'equals';
			}
			filterValue = '';
			filterValue2 = '';
			selectedValues = [];
		}
		filterButtonRef = buttonElement;
		showFilterDialog = true;
		showFilterMenu = false;
	}

	function applyFilter() {
		if (!selectedFilterColumn) return;
		if (filterCondition === 'in' && selectedValues.length === 0) return;
		const columnType = getColumnType(selectedFilterColumn, columns, data);
		if (filterCondition !== 'in' && columnType !== 'boolean' && !filterValue) return;
		if (
			filterCondition !== 'in' &&
			columnType === 'boolean' &&
			filterValue !== true &&
			filterValue !== false
		)
			return;
		if (filterCondition === 'between' && !filterValue2) return;

		const columnName =
			columns.find((c) => c.id === selectedFilterColumn)?.name || selectedFilterColumn;

		const filterData = {
			columnId: selectedFilterColumn,
			columnName,
			condition: filterCondition,
			...(filterCondition === 'in'
				? { values: selectedValues }
				: {
						value: filterValue,
						...(filterCondition === 'between' && { value2: filterValue2 })
					})
		};

		onFilterApply(filterData, editingFilter);
		closeFilterDialog();
	}

	function closeFilterDialog() {
		showFilterDialog = false;
		editingFilter = null;
		selectedFilterColumn = null;
		filterCondition = 'equals';
		filterValue = '';
		filterValue2 = '';
		selectedValues = [];
		filterButtonRef = null;
	}

	let allFilterableColumns = $derived(getFilterableColumns(columns, data));
</script>

<div class="flex flex-wrap items-center gap-2">
	<!-- Global Search Input -->
	<div class="relative flex-shrink-0">
		<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
			<Search class="h-4 w-4 text-gray-400 dark:text-gray-500" />
		</div>
		<input
			type="text"
			bind:value={globalSearchText}
			placeholder="Search all columns..."
			class="h-[26px] rounded-full border border-gray-300 bg-white py-0.5 pr-3 pl-8 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500"
		/>
	</div>

	<!-- Single Filters Button -->
	<div class="relative flex-shrink-0">
		<button
			bind:this={filterMenuButtonRef}
			class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors {activeFilters.length >
			0
				? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50'
				: 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700'}"
			onclick={() => {
				showFilterMenu = !showFilterMenu;
			}}
		>
			<Filter class="h-3.5 w-3.5" />
			<span>Filters</span>
			{#if activeFilters.length > 0}
				<span
					class="flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white"
				>
					{activeFilters.length}
				</span>
			{/if}
		</button>

		<!-- Filter Menu Dropdown -->
		{#if showFilterMenu}
			<div
				class="absolute top-full left-0 z-50 mt-2 min-w-56 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
				use:clickOutside={() => {
					showFilterMenu = false;
				}}
			>
				<div class="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
					<span
						class="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400"
						>Add Filter</span
					>
				</div>
				<div class="max-h-72 overflow-y-auto py-1">
					{#each allFilterableColumns as column (column.id)}
						{@const isActive = activeFilters.some((f) => f.columnId === column.id)}
						<button
							class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors {isActive
								? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
								: 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}"
							onclick={(e) => {
								if (isActive) {
									// Edit existing filter
									const existingFilter = activeFilters.find(
										(f) => f.columnId === column.id
									);
									openFilterDialog(null, existingFilter, filterMenuButtonRef);
								} else {
									// Add new filter
									openFilterDialog(column, null, filterMenuButtonRef);
								}
							}}
						>
							<span class="flex-1">{column.name}</span>
							{#if isActive}
								<span
									class="rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600 dark:bg-purple-900/50 dark:text-purple-300"
									>Active</span
								>
							{/if}
						</button>
					{/each}
					{#if allFilterableColumns.length === 0}
						<div class="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
							No filterable columns
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Filter Popover (for adding/editing filters) -->
		<FilterPopover
			show={showFilterDialog && !editingFilter}
			buttonRef={filterMenuButtonRef}
			selectedColumnId={selectedFilterColumn}
			{columns}
			{data}
			bind:filterCondition
			bind:filterValue
			bind:filterValue2
			bind:selectedValues
			onApply={applyFilter}
			onClose={closeFilterDialog}
			externalFilterOptions={filterOptions}
		/>
	</div>

	<!-- Active Filters as Chips -->
	{#each activeFilters as filter (filter)}
		<div class="relative">
			<FilterChip
				{filter}
				onEdit={(e) => openFilterDialog(null, filter, e.currentTarget)}
				onRemove={() => onFilterRemove(filter)}
			/>
			<!-- Filter Popover for editing existing filter -->
			<FilterPopover
				show={showFilterDialog && editingFilter === filter}
				buttonRef={filterButtonRef}
				selectedColumnId={filter.columnId}
				{columns}
				{data}
				bind:filterCondition
				bind:filterValue
				bind:filterValue2
				bind:selectedValues
				onApply={applyFilter}
				onClose={closeFilterDialog}
				externalFilterOptions={filterOptions}
			/>
		</div>
	{/each}

	<!-- Clear All Filters -->
	{#if activeFilters.length > 0}
		<button
			class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
			onclick={() => {
				activeFilters = [];
			}}
		>
			<X class="h-3 w-3" />
			<span>Clear all</span>
		</button>
	{/if}

	<!-- Apply Filters Button (for manual server-side mode) -->
	{#if applyMode === 'manual' && hasPendingChanges}
		<button
			class="inline-flex items-center gap-1 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
			onclick={onApplyFilters}
		>
			<Check class="h-3 w-3" />
			<span>Apply Filters</span>
		</button>
	{/if}
</div>
