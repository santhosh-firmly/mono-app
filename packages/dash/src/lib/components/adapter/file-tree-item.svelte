<script>
	import {
		ChevronRight,
		ChevronDown,
		File,
		Folder,
		FolderOpen,
		Lock,
		Trash2
	} from 'lucide-svelte';

	let {
		node,
		selectedPath = null,
		depth = 0,
		onselect = () => {},
		ondelete = () => {}
	} = $props();

	let expanded = $state(depth < 2);

	const isSelected = $derived(node.type === 'file' && node.path === selectedPath);
	const isDirectory = $derived(node.type === 'directory');
	let showDelete = $state(false);

	function handleClick() {
		if (isDirectory) {
			expanded = !expanded;
		} else {
			onselect(node.path);
		}
	}

	function handleDelete(e) {
		e.stopPropagation();
		ondelete(node.path);
	}
</script>

<div
	class="relative flex items-center"
	onmouseenter={() => (showDelete = true)}
	onmouseleave={() => (showDelete = false)}
>
	<button
		class="flex w-full items-center gap-1 rounded-sm px-1.5 py-0.5 text-left text-sm hover:bg-muted/50 {isSelected
			? 'bg-muted font-medium text-foreground'
			: 'text-muted-foreground'}"
		style="padding-left: {depth * 16 + 6}px"
		onclick={handleClick}
	>
		{#if isDirectory}
			<span class="flex-shrink-0 text-muted-foreground">
				{#if expanded}
					<ChevronDown class="h-3.5 w-3.5" />
				{:else}
					<ChevronRight class="h-3.5 w-3.5" />
				{/if}
			</span>
			<span class="flex-shrink-0 text-muted-foreground">
				{#if expanded}
					<FolderOpen class="h-4 w-4" />
				{:else}
					<Folder class="h-4 w-4" />
				{/if}
			</span>
		{:else}
			<span class="w-3.5 flex-shrink-0"></span>
			<File class="h-4 w-4 flex-shrink-0 text-muted-foreground" />
		{/if}
		<span class="truncate">{node.name}</span>
		{#if node.isRequired && node.type === 'file'}
			<Lock class="ml-auto h-3 w-3 flex-shrink-0 text-muted-foreground/50" />
		{/if}
	</button>
	{#if !node.isRequired && node.type === 'file' && showDelete}
		<button
			class="absolute right-1 flex-shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-destructive"
			onclick={handleDelete}
			title="Delete file"
		>
			<Trash2 class="h-3 w-3" />
		</button>
	{/if}

</div>

{#if isDirectory && expanded && node.children}
	<div>
		{#each node.children as child (child.path)}
			<svelte:self node={child} {selectedPath} depth={depth + 1} {onselect} {ondelete} />
		{/each}
	</div>
{/if}
