<script>
	import { clickOutside } from '../actions/click-outside.js';

	/**
	 * Column selector component for toggling column visibility
	 */
	let { show, columns, visibleColumns = $bindable(), onClose } = $props();
</script>

{#if show}
	<div
		class="absolute top-full right-0 z-50 mt-2 flex min-w-48 flex-col rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
		use:clickOutside={onClose}
	>
		<div class="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select columns to display:</div>
		{#each columns as column (column.id)}
			<label
				class="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-700"
			>
				<input
					type="checkbox"
					class="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
					checked={visibleColumns.includes(column.id)}
					onchange={() => {
						visibleColumns = visibleColumns.includes(column.id)
							? visibleColumns.filter((c) => c !== column.id)
							: [...visibleColumns, column.id];
					}}
				/>
				<span class="text-sm text-gray-700 dark:text-gray-300">{column.name}</span>
			</label>
		{/each}
	</div>
{/if}
