<script>
	import ArrowUp from 'lucide-svelte/icons/arrow-up';
	import ArrowDown from 'lucide-svelte/icons/arrow-down';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import { isSortable } from '../utils/sort-utils.js';

	/**
	 * Table header component with sorting
	 */
	let { columns, data, showActions, sortColumn, sortDirection, onSort } = $props();
</script>

<thead>
	<tr>
		{#each columns as column (column.id)}
			{@const sortable = isSortable(column.id, data)}
			{@const isActiveSortColumn = sortColumn === column.id}
			<th
				class="sticky top-0 border-b-2 border-gray-200 bg-slate-50 p-2.5 font-medium text-gray-800 select-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
				class:text-center={column.center}
				class:cursor-pointer={sortable}
				class:hover:bg-slate-100={sortable}
				class:dark:hover:bg-gray-700={sortable}
				onclick={() => onSort(column.id)}
			>
				<div class="flex items-center gap-1.5" class:justify-center={column.center}>
					<span>{column.name}</span>
					{#if sortable}
						{#if isActiveSortColumn}
							{#if sortDirection === 'asc'}
								<ArrowUp class="h-4 w-4 min-w-fit text-purple-600" />
							{:else}
								<ArrowDown class="h-4 w-4 min-w-fit text-purple-600" />
							{/if}
						{:else}
							<ArrowUpDown class="h-4 w-4 min-w-fit text-gray-400 dark:text-gray-500" />
						{/if}
					{/if}
				</div>
			</th>
		{/each}
		{#if showActions}
			<th
				class="sticky top-0 max-w-0 justify-end border-b-2 border-gray-200 bg-slate-50 px-2 text-center align-middle font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
			>
				<div class="inline-block">
					<Ellipsis class="h-5 w-5" />
				</div>
			</th>
		{/if}
	</tr>
</thead>
