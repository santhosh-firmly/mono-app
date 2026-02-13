<script>
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Folder from 'lucide-svelte/icons/folder';
	import FileText from 'lucide-svelte/icons/file-text';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import X from 'lucide-svelte/icons/x';
	import HardDrive from 'lucide-svelte/icons/hard-drive';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { PageErrorAlert } from '../shared/index.js';

	// Props
	let {
		domains = [],
		currentDomain = '',
		currentPath = '',
		files = null,
		stats = null,
		loading = false,
		loadingStorage = false,
		error = null,
		// File viewer state
		showFileModal = false,
		fileContent = null,
		loadingFile = false,
		// Handlers
		onRefresh = () => {},
		onDomainChange = () => {},
		onNavigateToFolder = () => {},
		onNavigateUp = () => {},
		onNavigateToBreadcrumb = () => {},
		onNavigateToRoot = () => {},
		onViewFile = () => {},
		onCloseFileModal = () => {},
		onDismissError = () => {}
	} = $props();

	// Derived values
	let pathParts = $derived.by(() => {
		if (!currentPath) return [];
		return currentPath.split('/').filter(Boolean);
	});

	// Helper functions
	function formatSize(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
	}

	function handleDomainChange(e) {
		onDomainChange(e.target.value);
	}

	function handleModalKeydown(e) {
		if (e.key === 'Escape') {
			onCloseFileModal();
		}
	}

	function handleModalBackdropClick(e) {
		if (e.target === e.currentTarget) {
			onCloseFileModal();
		}
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader title="Storage Browser" description="Browse raw storage files by domain" />
		<div class="flex items-center gap-4">
			<select
				value={currentDomain}
				onchange={handleDomainChange}
				class="px-3 py-2 text-sm border rounded-md bg-background min-w-[200px]"
				disabled={loading}
			>
				{#each domains as domain (domain.domain)}
					<option value={domain.domain}>{domain.domain}</option>
				{/each}
			</select>
			<Button variant="outline" onclick={onRefresh} disabled={loadingStorage}>
				<RefreshCw class="h-4 w-4 mr-2 {loadingStorage ? 'animate-spin' : ''}" />
				Refresh
			</Button>
		</div>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading...
			</Card.Content>
		</Card.Root>
	{:else if stats}
		<!-- Stats Grid -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			<Card.Root>
				<Card.Content class="p-4 text-center">
					<div class="text-xl font-bold">
						{stats.totalFiles?.toLocaleString() || 0}
					</div>
					<div class="text-xs text-muted-foreground uppercase mt-1">Total Files</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4 text-center">
					<div class="text-xl font-bold">{stats.totalSizeFormatted || '0 B'}</div>
					<div class="text-xs text-muted-foreground uppercase mt-1">Total Size</div>
				</Card.Content>
			</Card.Root>
			{#each Object.entries(stats.byFolder || {}) as [folder, count] (folder)}
				<Card.Root>
					<Card.Content class="p-4 text-center">
						<div class="text-xl font-bold">{count}</div>
						<div
							class="text-xs text-muted-foreground uppercase mt-1 truncate"
							title={folder}
						>
							{folder}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Breadcrumb -->
		<div class="flex items-center gap-2 text-sm flex-wrap">
			<button class="text-primary hover:underline cursor-pointer" onclick={onNavigateToRoot}>
				{currentDomain}
			</button>
			{#each pathParts as part, i (part + i)}
				<span class="text-muted-foreground">/</span>
				{#if i === pathParts.length - 1}
					<span class="text-muted-foreground">{part}</span>
				{:else}
					<button
						class="text-primary hover:underline cursor-pointer"
						onclick={() => onNavigateToBreadcrumb(i)}
					>
						{part}
					</button>
				{/if}
			{/each}
		</div>

		<!-- File Browser -->
		{#if loadingStorage}
			<div class="flex items-center justify-center py-12 text-muted-foreground">
				<RefreshCw class="h-5 w-5 animate-spin mr-2" />
				Loading...
			</div>
		{:else if files}
			<Card.Root class="overflow-hidden">
				<div class="flex flex-col divide-y">
					<!-- Parent directory -->
					{#if currentPath}
						<button
							class="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
							onclick={onNavigateUp}
						>
							<ArrowLeft class="h-5 w-5 text-muted-foreground" />
							<span class="font-medium">..</span>
						</button>
					{/if}

					<!-- Folders -->
					{#each files.folders || [] as folder (folder.name || folder.path)}
						<button
							class="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
							onclick={() => onNavigateToFolder(folder)}
						>
							<Folder class="h-5 w-5 text-yellow-500" />
							<span class="font-medium">{folder.name}</span>
						</button>
					{/each}

					<!-- Files -->
					{#each files.files || [] as file (file.name || file.key)}
						<button
							class="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
							onclick={() => onViewFile(file)}
						>
							<FileText class="h-5 w-5 text-muted-foreground" />
							<div class="flex-1 min-w-0">
								<div class="font-medium truncate">{file.name}</div>
								<div class="text-xs text-muted-foreground flex gap-3">
									{#if file.size}
										<span>{formatSize(file.size)}</span>
									{/if}
									{#if file.uploaded}
										<span>{new Date(file.uploaded).toLocaleDateString()}</span>
									{/if}
								</div>
							</div>
						</button>
					{/each}

					<!-- Empty state -->
					{#if (files.folders?.length || 0) === 0 && (files.files?.length || 0) === 0}
						<div class="py-12 text-center text-muted-foreground">
							<HardDrive class="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p>This folder is empty</p>
						</div>
					{/if}
				</div>
			</Card.Root>
		{/if}
	{:else}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<HardDrive class="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p>Select a domain to browse storage</p>
			</Card.Content>
		</Card.Root>
	{/if}
</div>

<!-- File Content Modal -->
{#if showFileModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={handleModalBackdropClick}
		onkeydown={handleModalKeydown}
		role="dialog"
		tabindex="-1"
	>
		<div class="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="font-semibold truncate pr-4">{fileContent?.path || 'File'}</h2>
				<Button variant="ghost" size="sm" onclick={onCloseFileModal}>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="flex-1 overflow-auto p-4">
				{#if loadingFile}
					<div class="flex items-center justify-center py-12 text-muted-foreground">
						<RefreshCw class="h-5 w-5 animate-spin mr-2" />
						Loading file...
					</div>
				{:else if fileContent}
					<div class="flex gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
						<span>Size: {formatSize(fileContent.size)}</span>
						<span>Type: {fileContent.contentType}</span>
						<span>Modified: {new Date(fileContent.uploaded).toLocaleString()}</span>
					</div>
					<div class="bg-gray-900 rounded-lg p-4 max-h-[500px] overflow-auto">
						<pre
							class="text-xs text-gray-100 whitespace-pre-wrap break-all font-mono">{typeof fileContent.content ===
							'string'
								? fileContent.content
								: JSON.stringify(fileContent.content, null, 2)}</pre>
					</div>
				{/if}
			</div>

			<div class="flex justify-end p-4 border-t">
				<Button variant="secondary" onclick={onCloseFileModal}>Close</Button>
			</div>
		</div>
	</div>
{/if}
