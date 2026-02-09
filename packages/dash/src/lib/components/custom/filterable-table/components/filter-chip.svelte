<script>
	import CircleX from 'lucide-svelte/icons/circle-x';
	import { getFilterDisplayValue } from '../utils/data-utils.js';

	/**
	 * Filter chip component showing active filter
	 */
	let { filter, onEdit, onRemove } = $props();
</script>

<div
	class="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-1.5 py-0.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700"
>
	<button
		class="cursor-pointer text-gray-400 hover:text-purple-600 dark:text-gray-500 dark:hover:text-purple-400"
		onclick={onRemove}
		aria-label="Remove filter"
	>
		<CircleX class="h-4 w-4" />
	</button>
	<button class="flex cursor-pointer items-center gap-1.5 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400" onclick={onEdit}>
		<span class="font-medium">{filter.columnName}</span>
		<span class="text-gray-200 dark:text-gray-600">|</span>
		<span class="text-purple-600 dark:text-purple-400">{getFilterDisplayValue(filter)}</span>
	</button>
</div>
