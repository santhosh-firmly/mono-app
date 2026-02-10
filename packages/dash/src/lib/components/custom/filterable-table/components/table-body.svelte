<script>
	import ToolbarButton from './toolbar-button.svelte';
	import { get } from '../utils/data-utils.js';

	/**
	 * Table body component
	 */
	let {
		data,
		columns,
		showActions,
		loading,
		emptyMessage,
		visibleColumnsCount,
		rowClass,
		onclick
	} = $props();

	function getColumnKey(column, index) {
		const raw = column?.id;
		if (raw === undefined || raw === null) return `col-${index}`;
		const numeric = Number(raw);
		if (Number.isNaN(numeric)) return `col-${index}-${String(raw)}`;
		return String(raw);
	}
</script>

<tbody>
	{#each data as item, index (item?.rowKey ?? (Number.isFinite(Number(item?.rowNumber)) ? `row-${item.rowNumber}` : `idx-${index}`))}
		<tr
			class="group relative cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800 {rowClass?.(item)}"
			onclick={() => {
				onclick?.(item, index);
			}}
		>
			{#each columns as column, colIndex (getColumnKey(column, colIndex))}
				{@const customCellView = column.cellView}
				{#if customCellView}
					{@render customCellView(item, index, data)}
				{:else}
					{@const customView = column.view}
					<td
						class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 align-middle text-nowrap text-ellipsis group-hover:bg-slate-100 dark:border-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-800"
						class:pl-4={!column.center}
						class:text-center={column.center}
					>
						{#if customView}
							{@render customView(item)}
						{:else}
							{get(item, column.id)}
						{/if}
					</td>
				{/if}
			{/each}
			{#if showActions}
				<td
					class="max-w-fit min-w-fit border-b border-gray-200 px-2 text-right align-middle opacity-0 transition-opacity duration-300 group-hover:bg-slate-100 group-hover:opacity-100 dark:border-gray-700 dark:group-hover:bg-gray-800"
				>
					<div class="flex justify-end">
						<div
							class="flex overflow-hidden rounded-full border border-gray-100 bg-white text-gray-500 shadow dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
						>
							{#each item.actions || [] as action (action.label)}
								<ToolbarButton
									tooltipText={action.label}
									onclick={(e) => {
										e.stopPropagation();
										action.execute(item);
									}}
								>
									<svelte:component this={action.icon} class="h-5 w-5" />
								</ToolbarButton>
							{/each}
						</div>
					</div>
				</td>
			{/if}
		</tr>
	{:else}
		{#if loading}
			<tr>
				<td
					colspan={visibleColumnsCount + (showActions ? 1 : 0) || 1}
					class="py-3 text-center text-gray-500 dark:text-gray-400"
				>
					<div class="flex items-center justify-center gap-2">
						<div
							class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 dark:border-gray-600"
						></div>
						<span>Loading...</span>
					</div>
				</td></tr
			>
		{:else}
			<tr>
				<td
					colspan={visibleColumnsCount + (showActions ? 1 : 0) || 1}
					class="py-3 text-center text-gray-500 dark:text-gray-400">{emptyMessage || 'No data found'}</td
				>
			</tr>
		{/if}
	{/each}
</tbody>
