<script>
	import { FilePlus } from 'lucide-svelte';
	import FileTreeItem from './file-tree-item.svelte';

	let {
		tree = [],
		selectedPath = null,
		onselect = () => {},
		ondelete = () => {},
		oncreate = () => {}
	} = $props();

	let showNewFileInput = $state(false);
	let newFilePath = $state('');
	let newFileError = $state('');

	function handleNewFileKeydown(e) {
		if (e.key === 'Enter') {
			submitNewFile();
		} else if (e.key === 'Escape') {
			cancelNewFile();
		}
	}

	function submitNewFile() {
		const path = newFilePath.trim();
		newFileError = '';

		if (!path) {
			cancelNewFile();
			return;
		}

		if (!path.endsWith('.js')) {
			newFileError = 'File must end with .js';
			return;
		}

		if (path.includes('..')) {
			newFileError = 'Invalid path';
			return;
		}

		if (path.startsWith('tests/')) {
			newFileError = 'Cannot create test files';
			return;
		}

		oncreate(path);
		cancelNewFile();
	}

	function cancelNewFile() {
		showNewFileInput = false;
		newFilePath = '';
		newFileError = '';
	}
</script>

<div class="flex h-full flex-col">
	<div class="flex items-center justify-between border-b px-3 py-2">
		<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
			>Adapter Files</span
		>
		<button
			class="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
			onclick={() => (showNewFileInput = true)}
			title="New file"
		>
			<FilePlus class="h-4 w-4" />
		</button>
	</div>

	{#if showNewFileInput}
		<div class="border-b px-3 py-2">
			<input
				type="text"
				class="w-full rounded border bg-background px-2 py-1 text-xs {newFileError
					? 'border-destructive'
					: 'border-border'}"
				placeholder="lib/my-file.js"
				bind:value={newFilePath}
				onkeydown={handleNewFileKeydown}
				autofocus
			/>
			{#if newFileError}
				<p class="mt-1 text-xs text-destructive">{newFileError}</p>
			{/if}
		</div>
	{/if}

	<div class="flex-1 overflow-y-auto py-1">
		{#each tree as node (node.path)}
			<FileTreeItem {node} {selectedPath} depth={0} {onselect} {ondelete} />
		{/each}
	</div>
</div>
