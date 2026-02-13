<script>
	import { clickOutside } from '../actions/click-outside.js';
	import FileText from 'lucide-svelte/icons/file-text';
	import FileJson from 'lucide-svelte/icons/file-json';
	import FileSpreadsheet from 'lucide-svelte/icons/file-spreadsheet';

	/**
	 * Export menu component for selecting export format
	 */
	let { show, onClose, onExport, isExporting = false } = $props();

	const exportFormats = [
		{
			id: 'csv',
			name: 'CSV',
			description: 'Comma-separated values',
			icon: FileText
		},
		{
			id: 'json',
			name: 'JSON',
			description: 'JavaScript Object Notation',
			icon: FileJson
		},
		{
			id: 'excel',
			name: 'Excel',
			description: 'Excel workbook (.xlsx)',
			icon: FileSpreadsheet
		}
	];

	function handleExport(format) {
		onExport(format);
	}
</script>

{#if show}
	<div
		class="absolute top-full right-0 z-50 mt-2 flex min-w-56 flex-col rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
		use:clickOutside={onClose}
	>
		<div class="mb-1 px-2 py-1 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
			Export as:
		</div>
		{#each exportFormats as format (format.id)}
			<button
				type="button"
				class="flex items-center gap-3 rounded px-3 py-2 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700"
				onclick={() => handleExport(format.id)}
				disabled={isExporting}
			>
				<svelte:component
					this={format.icon}
					class="h-5 w-5 text-gray-600 dark:text-gray-400"
				/>
				<div class="flex flex-col">
					<span class="text-sm font-medium text-gray-900 dark:text-gray-100"
						>{format.name}</span
					>
					<span class="text-xs text-gray-500 dark:text-gray-400"
						>{format.description}</span
					>
				</div>
			</button>
		{/each}
		{#if isExporting}
			<div class="mt-2 border-t border-gray-200 px-3 py-2 dark:border-gray-700">
				<div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
					<div
						class="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-purple-600 dark:border-gray-600"
					></div>
					<span>Exporting...</span>
				</div>
			</div>
		{/if}
	</div>
{/if}
