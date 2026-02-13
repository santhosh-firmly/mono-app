<script>
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';

	/**
	 * Results summary component showing filtered item count and pagination
	 */
	let {
		totalCount,
		filteredCount,
		hasActiveFilters,
		onClearAll,
		// Pagination props
		showPagination = false,
		pagination = $bindable({ page: 1, pageSize: 25 }),
		pageSizeOptions = [10, 25, 50, 100],
		onPaginationChange,
		serverSide = false
	} = $props();

	let totalPages = $derived(Math.ceil(filteredCount / pagination.pageSize) || 1);
	let startItem = $derived((pagination.page - 1) * pagination.pageSize + 1);
	let endItem = $derived(Math.min(pagination.page * pagination.pageSize, filteredCount));

	function handlePageSizeChange(event) {
		pagination.pageSize = parseInt(event.target.value);
		pagination.page = 1;
		if (serverSide && onPaginationChange) {
			onPaginationChange();
		}
	}

	function goToPrevPage() {
		if (pagination.page > 1) {
			pagination.page--;
			if (serverSide && onPaginationChange) {
				onPaginationChange();
			}
		}
	}

	function goToNextPage() {
		if (pagination.page < totalPages) {
			pagination.page++;
			if (serverSide && onPaginationChange) {
				onPaginationChange();
			}
		}
	}
</script>

{#if showPagination}
	<div class="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400">
		<div class="flex items-center gap-2">
			<span>
				Showing <span class="font-medium text-gray-700 dark:text-gray-300">{startItem}</span
				>-<span class="font-medium text-gray-700 dark:text-gray-300">{endItem}</span>
				of <span class="font-medium text-gray-700 dark:text-gray-300">{filteredCount}</span> items
			</span>
			{#if hasActiveFilters}
				<span class="text-gray-300 dark:text-gray-600">•</span>
				<button
					class="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline dark:text-purple-400 dark:hover:text-purple-300"
					onclick={onClearAll}
					aria-label="Clear all filters"
				>
					Clear filters
				</button>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			<!-- Page size selector -->
			<div class="flex items-center gap-1.5">
				<span class="text-gray-500 dark:text-gray-400">Rows:</span>
				<select
					class="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-xs focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
					value={pagination.pageSize}
					onchange={handlePageSizeChange}
				>
					{#each pageSizeOptions as size (size)}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</div>
			<!-- Page navigation -->
			<div class="flex items-center gap-1">
				<button
					class="rounded p-0.5 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-gray-700"
					disabled={pagination.page <= 1}
					onclick={goToPrevPage}
					aria-label="Previous page"
				>
					<ChevronLeft class="h-4 w-4" />
				</button>
				<span class="px-1">
					Page <span class="font-medium text-gray-700 dark:text-gray-300"
						>{pagination.page}</span
					>
					of
					<span class="font-medium text-gray-700 dark:text-gray-300">{totalPages}</span>
				</span>
				<button
					class="rounded p-0.5 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-gray-700"
					disabled={pagination.page >= totalPages}
					onclick={goToNextPage}
					aria-label="Next page"
				>
					<ChevronRight class="h-4 w-4" />
				</button>
			</div>
		</div>
	</div>
{:else if totalCount > 0}
	<div class="flex items-center gap-2 pt-2 text-xs text-gray-500 dark:text-gray-400">
		<span
			>Showing <span class="font-medium text-gray-700 dark:text-gray-300"
				>{filteredCount}</span
			>
			of
			<span class="font-medium text-gray-700 dark:text-gray-300">{totalCount}</span>
			{totalCount === 1 ? 'item' : 'items'}</span
		>
		<!-- Clear All Filters Button -->
		{#if hasActiveFilters}
			<span class="text-gray-300 dark:text-gray-600">•</span>
			<button
				class="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline dark:text-purple-400 dark:hover:text-purple-300"
				onclick={onClearAll}
				aria-label="Clear all filters"
			>
				Clear filters
			</button>
		{/if}
	</div>
{/if}
