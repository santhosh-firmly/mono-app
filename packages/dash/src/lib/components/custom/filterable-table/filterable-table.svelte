<script>
	import Download from 'lucide-svelte/icons/download';
	import Columns3 from 'lucide-svelte/icons/columns-3';
	import ToolbarButton from './components/toolbar-button.svelte';
	import TableHeader from './components/table-header.svelte';
	import TableBody from './components/table-body.svelte';
	import FilterToolbar from './components/filter-toolbar.svelte';
	import ColumnSelector from './components/column-selector.svelte';
	import ExportMenu from './components/export-menu.svelte';
	import ResultsSummary from './components/results-summary.svelte';
	import { compareValues, isSortable } from './utils/sort-utils.js';
	import { applyGlobalSearch, applyFilters } from './utils/filter-utils.js';
	import { exportTableData } from './utils/export-utils.js';
	import { loadTableState, saveTableState } from './utils/table-state-storage.js';
	import { onMount } from 'svelte';

	/**
	 * Generate a filename for exports
	 */
	function generateFilename(title) {
		const date = new Date().toISOString().slice(0, 10);
		return `${(title || 'export').replace(/[^a-zA-Z0-9-_]/g, '_')}_${date}`;
	}

	/**
	 * Main filterable table component
	 */
	let {
		tableId, // required: unique identifier for this table instance
		data,
		columns,
		onclick,
		visibleColumns = $bindable(),
		title,
		showActions = false,
		showToolbar = false,
		emptyMessage,
		loading = false,
		showFilters = true,
		actions, // optional snippet: {#snippet actions()}{/snippet}
		rowClass,
		initialSortColumn = null,
		initialSortDirection = 'asc',
		// Pagination props
		showPagination = false,
		pagination = $bindable({ page: 1, pageSize: 25 }),
		pageSizeOptions = [10, 25, 50, 100],
		totalItems = undefined, // Required for server-side mode
		// Server-side mode props
		serverSide = false,
		onFetchData = undefined, // (filterState) => Promise<void>
		applyMode = 'auto', // 'auto' | 'manual'
		filterOptions = {} // External options for select filters: { columnId: [{value, label}] }
	} = $props();

	// Sort state
	let sortColumn = $state(initialSortColumn);
	let sortDirection = $state(initialSortDirection); // 'asc' or 'desc'

	// Filter state
	let activeFilters = $state([]);
	let globalSearchText = $state('');

	// UI state
	let showColumnSelector = $state(false);
	let showExportMenu = $state(false);
	let isExporting = $state(false);

	// Server-side mode state (for tracking pending changes in manual mode)
	let appliedFilters = $state([]);
	let appliedGlobalSearch = $state('');

	// Check if there are pending filter changes (for manual apply mode)
	let hasPendingChanges = $derived(
		applyMode === 'manual' &&
			(JSON.stringify(activeFilters) !== JSON.stringify(appliedFilters) ||
				globalSearchText !== appliedGlobalSearch)
	);

	// Build filter state object for server-side mode
	function buildFilterState() {
		return {
			filters: activeFilters,
			globalSearch: globalSearchText,
			sort: sortColumn ? { column: sortColumn, direction: sortDirection } : null,
			pagination: { page: pagination.page, pageSize: pagination.pageSize }
		};
	}

	// Apply filters and trigger fetch (for manual mode)
	function handleApplyFilters() {
		appliedFilters = [...activeFilters];
		appliedGlobalSearch = globalSearchText;
		pagination.page = 1; // Reset to first page when applying filters
		if (onFetchData) {
			onFetchData(buildFilterState());
		}
	}

	// Trigger fetch for pagination/sort changes (always immediate, even in manual mode)
	function triggerImmediateFetch() {
		if (serverSide && onFetchData) {
			onFetchData(buildFilterState());
		}
	}

	// State persistence
	let stateLoaded = $state(false);
	let saveTimeout = null;

	// Load saved state on mount
	onMount(() => {
		const savedState = loadTableState(tableId);
		if (savedState) {
			// Restore saved state
			sortColumn = savedState.sortColumn ?? initialSortColumn;
			sortDirection = savedState.sortDirection ?? initialSortDirection;
			activeFilters = savedState.activeFilters ?? [];
			globalSearchText = savedState.globalSearchText ?? '';

			// Restore visible columns if saved
			if (savedState.visibleColumns && savedState.visibleColumns.length > 0) {
				visibleColumns = savedState.visibleColumns;
			}
		}
		stateLoaded = true;
	});

	// Save state to LocalStorage when it changes (with debouncing)
	$effect(() => {
		// Only save after initial load and if tableId is provided
		if (!stateLoaded || !tableId) return;

		// Track all state variables for reactivity
		const currentState = {
			sortColumn,
			sortDirection,
			activeFilters,
			globalSearchText,
			visibleColumns
		};

		// Clear existing timeout
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		// Debounce saves to avoid too many writes
		saveTimeout = setTimeout(() => {
			saveTableState(tableId, currentState);
		}, 500);

		// Cleanup timeout on component destroy
		return () => {
			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}
		};
	});

	// Initialize visible columns
	$effect(() => {
		if (!visibleColumns) {
			visibleColumns = columns?.map((c) => c.id);
		}
	});

	// Handle sorting
	function handleSort(columnId) {
		if (!isSortable(columnId, data)) return;

		if (sortColumn === columnId) {
			// Toggle direction or clear sort
			if (sortDirection === 'asc') {
				sortDirection = 'desc';
			} else {
				sortColumn = null;
				sortDirection = 'asc';
			}
		} else {
			sortColumn = columnId;
			sortDirection = 'asc';
		}

		// In server-side mode, trigger immediate fetch for sort changes
		if (serverSide) {
			triggerImmediateFetch();
		}
	}

	// Handle filter operations
	function handleFilterApply(filterData, editingFilter) {
		if (editingFilter) {
			// Update existing filter
			activeFilters = activeFilters.map((f) => (f === editingFilter ? filterData : f));
		} else {
			// Add new filter
			activeFilters = [...activeFilters, filterData];
		}
	}

	function handleFilterRemove(filter) {
		activeFilters = activeFilters.filter((f) => f !== filter);
	}

	function clearAllFilters() {
		activeFilters = [];
		globalSearchText = '';

		// In server-side mode with auto apply, trigger fetch immediately
		if (serverSide && applyMode === 'auto') {
			appliedFilters = [];
			appliedGlobalSearch = '';
			pagination.page = 1;
			triggerImmediateFetch();
		} else if (serverSide && applyMode === 'manual') {
			// In manual mode, also reset applied state and trigger fetch
			appliedFilters = [];
			appliedGlobalSearch = '';
			pagination.page = 1;
			if (onFetchData) {
				onFetchData(buildFilterState());
			}
		}
	}

	// Handle export operations
	async function handleExport(format) {
		isExporting = true;
		try {
			// Generate filename using inline function
			const filename = generateFilename(title || 'table_export');

			// Export using filtered and sorted data
			await exportTableData(filteredAndSortedData, columns, visibleColumns, format, filename);

			// Close the export menu after successful export
			showExportMenu = false;

			console.log(`Successfully exported to ${format.toUpperCase()}`);
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			isExporting = false;
		}
	}

	// Derived data: filtered and sorted
	let filteredAndSortedData = $derived.by(() => {
		let result = data || [];

		// Add stable row metadata
		result = result.map((item, index) => {
			const rowNumber = index + 1;
			const idValue = Number(item?.id);
			const rowKey = Number.isFinite(idValue) ? `id-${idValue}` : `idx-${index}`;
			return {
				...item,
				rowNumber,
				rowKey
			};
		});

		// In server-side mode, skip client-side filtering/sorting (data comes pre-filtered from server)
		if (serverSide) {
			return result;
		}

		// Apply global search first
		result = applyGlobalSearch(result, globalSearchText, columns, data);

		// Then apply column-specific filters
		result = applyFilters(result, activeFilters, columns, data);

		// Finally apply sorting
		if (sortColumn) {
			result = [...result].sort((a, b) => compareValues(a, b, sortColumn, sortDirection));
		}

		return result;
	});

	// Apply client-side pagination (when not in server-side mode)
	let paginatedData = $derived.by(() => {
		if (!showPagination || serverSide) return filteredAndSortedData;
		const start = (pagination.page - 1) * pagination.pageSize;
		return filteredAndSortedData.slice(start, start + pagination.pageSize);
	});

	// Total count for pagination display
	let displayTotalItems = $derived(serverSide ? (totalItems ?? 0) : filteredAndSortedData.length);

	let columnsToRender = $derived(columns?.filter((c) => visibleColumns?.includes(c.id)) || []);
</script>

<div class="flex h-full min-h-0 flex-col gap-1">
	{#if showToolbar}
		<div class="relative mb-2 flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<div class="relative min-w-0 grow">
					{#if showFilters}
						<FilterToolbar
							{columns}
							{data}
							bind:activeFilters
							bind:globalSearchText
							onFilterApply={handleFilterApply}
							onFilterRemove={handleFilterRemove}
							{applyMode}
							{hasPendingChanges}
							onApplyFilters={handleApplyFilters}
							{filterOptions}
						/>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<div
						class="relative flex rounded-full border border-gray-200 bg-white text-gray-500 shadow dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
					>
						<div class="relative">
							<ToolbarButton
								tooltipText="Export Table Data"
								active={showExportMenu}
								onclick={() => {
									showExportMenu = !showExportMenu;
									showColumnSelector = false;
								}}
							>
								<Download class="h-5 w-5" />
							</ToolbarButton>
							<ExportMenu
								show={showExportMenu}
								{isExporting}
								onClose={() => {
									showExportMenu = false;
								}}
								onExport={handleExport}
							/>
						</div>
						<div class="relative">
							<ToolbarButton
								tooltipText="Choose Columns To View"
								active={showColumnSelector}
								onclick={() => {
									showColumnSelector = !showColumnSelector;
									showExportMenu = false;
								}}
							>
								<Columns3 class="h-5 w-5" />
							</ToolbarButton>
							<ColumnSelector
								show={showColumnSelector}
								{columns}
								bind:visibleColumns
								onClose={() => {
									showColumnSelector = false;
								}}
							/>
						</div>
						{@render actions?.()}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<div
		class="block min-h-0 w-full flex-1 overflow-auto rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900"
	>
		{#if title}
			<div
				class="flex w-full items-center justify-between rounded-t-lg bg-slate-50 p-2 text-center dark:bg-gray-800"
			>
				<span class="w-full text-sm font-medium text-gray-800 dark:text-gray-200">
					{title}
				</span>
			</div>
		{/if}
		<table class="w-full border-collapse text-left text-sm dark:text-gray-300">
			<TableHeader
				columns={columnsToRender}
				{data}
				{showActions}
				{sortColumn}
				{sortDirection}
				onSort={handleSort}
			/>
			<TableBody
				data={paginatedData}
				columns={columnsToRender}
				{showActions}
				{loading}
				{emptyMessage}
				visibleColumnsCount={visibleColumns?.length || 0}
				{rowClass}
				{onclick}
			/>
		</table>
	</div>

	<!-- Results Summary at Bottom -->
	<ResultsSummary
		totalCount={serverSide ? (totalItems ?? 0) : data?.length || 0}
		filteredCount={displayTotalItems}
		hasActiveFilters={activeFilters.length > 0 || globalSearchText}
		onClearAll={clearAllFilters}
		{showPagination}
		bind:pagination
		{pageSizeOptions}
		onPaginationChange={triggerImmediateFetch}
		{serverSide}
	/>
</div>
