<script>
	import { onMount } from 'svelte';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Folder from 'lucide-svelte/icons/folder';
	import FileText from 'lucide-svelte/icons/file-text';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import X from 'lucide-svelte/icons/x';
	import HardDrive from 'lucide-svelte/icons/hard-drive';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { catalogApi } from '$lib/api/catalog/index.js';

	let domains = $state([]);
	let selectedDomain = $state('');
	let loading = $state(true);
	let error = $state(null);

	// Storage data
	let storageStats = $state(null);
	let storageList = $state(null);
	let currentPath = $state('');
	let loadingStorage = $state(false);

	// File viewer
	let showFileModal = $state(false);
	let fileContent = $state(null);
	let loadingFile = $state(false);

	// Breadcrumb
	let pathParts = $derived.by(() => {
		if (!currentPath) return [];
		return currentPath.split('/').filter(Boolean);
	});

	onMount(async () => {
		await loadDomains();
	});

	async function loadDomains() {
		loading = true;
		error = null;
		try {
			domains = await catalogApi.domains.list();
			if (domains.length > 0) {
				selectedDomain = domains[0].domain;
				await loadStorage();
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load domains';
		} finally {
			loading = false;
		}
	}

	async function loadStorage() {
		if (!selectedDomain) return;
		loadingStorage = true;
		try {
			const [stats, list] = await Promise.all([
				catalogApi.storage.getStats(selectedDomain),
				catalogApi.storage.list(selectedDomain, currentPath)
			]);
			storageStats = stats;
			storageList = list;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load storage';
		} finally {
			loadingStorage = false;
		}
	}

	async function navigateToFolder(folder) {
		currentPath = folder.path;
		await loadStorage();
	}

	async function navigateUp() {
		const parts = currentPath.split('/').filter(Boolean);
		parts.pop();
		currentPath = parts.join('/');
		await loadStorage();
	}

	async function navigateToBreadcrumb(index) {
		currentPath = pathParts.slice(0, index + 1).join('/');
		await loadStorage();
	}

	async function viewFile(file) {
		if (!file.key) return;
		showFileModal = true;
		loadingFile = true;
		fileContent = null;
		try {
			fileContent = await catalogApi.storage.getFile(selectedDomain, file.key);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load file';
			showFileModal = false;
		} finally {
			loadingFile = false;
		}
	}

	function formatSize(bytes) {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
		return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
	}

	function handleDomainChange(e) {
		selectedDomain = e.target.value;
		currentPath = '';
		loadStorage();
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader title="Storage Browser" description="Browse raw storage files by domain" />
		<div class="flex items-center gap-4">
			<select
				value={selectedDomain}
				onchange={handleDomainChange}
				class="px-3 py-2 text-sm border rounded-md bg-background min-w-[200px]"
				disabled={loading}
			>
				{#each domains as domain (domain.domain)}
					<option value={domain.domain}>{domain.domain}</option>
				{/each}
			</select>
			<Button variant="outline" onclick={loadStorage} disabled={loadingStorage}>
				<RefreshCw class="h-4 w-4 mr-2 {loadingStorage ? 'animate-spin' : ''}" />
				Refresh
			</Button>
		</div>
	</div>

	{#if error}
		<div
			class="rounded-lg bg-destructive/10 p-4 text-destructive flex items-center justify-between"
		>
			<span>{error}</span>
			<Button variant="ghost" size="sm" onclick={() => (error = null)}>Dismiss</Button>
		</div>
	{/if}

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading...
			</Card.Content>
		</Card.Root>
	{:else if storageStats}
		<!-- Stats Grid -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
			<Card.Root>
				<Card.Content class="p-4 text-center">
					<div class="text-xl font-bold">
						{storageStats.totalFiles?.toLocaleString() || 0}
					</div>
					<div class="text-xs text-muted-foreground uppercase mt-1">Total Files</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4 text-center">
					<div class="text-xl font-bold">{storageStats.totalSizeFormatted || '0 B'}</div>
					<div class="text-xs text-muted-foreground uppercase mt-1">Total Size</div>
				</Card.Content>
			</Card.Root>
			{#each Object.entries(storageStats.byFolder || {}) as [folder, count] (folder)}
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
			<button
				class="text-primary hover:underline cursor-pointer"
				onclick={() => {
					currentPath = '';
					loadStorage();
				}}
			>
				{selectedDomain}
			</button>
			{#each pathParts as part, i (part + i)}
				<span class="text-muted-foreground">/</span>
				{#if i === pathParts.length - 1}
					<span class="text-muted-foreground">{part}</span>
				{:else}
					<button
						class="text-primary hover:underline cursor-pointer"
						onclick={() => navigateToBreadcrumb(i)}
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
		{:else if storageList}
			<Card.Root class="overflow-hidden">
				<div class="flex flex-col divide-y">
					<!-- Parent directory -->
					{#if currentPath}
						<button
							class="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
							onclick={navigateUp}
						>
							<ArrowLeft class="h-5 w-5 text-muted-foreground" />
							<span class="font-medium">..</span>
						</button>
					{/if}

					<!-- Folders -->
					{#each storageList.folders || [] as folder (folder.name || folder.path)}
						<button
							class="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
							onclick={() => navigateToFolder(folder)}
						>
							<Folder class="h-5 w-5 text-yellow-500" />
							<span class="font-medium">{folder.name}</span>
						</button>
					{/each}

					<!-- Files -->
					{#each storageList.files || [] as file (file.name || file.key)}
						<button
							class="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left w-full"
							onclick={() => viewFile(file)}
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
					{#if (storageList.folders?.length || 0) === 0 && (storageList.files?.length || 0) === 0}
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
		onclick={(e) => {
			if (e.target === e.currentTarget) showFileModal = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') showFileModal = false;
		}}
		role="dialog"
		tabindex="-1"
	>
		<div class="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="font-semibold truncate pr-4">{fileContent?.path || 'File'}</h2>
				<Button variant="ghost" size="sm" onclick={() => (showFileModal = false)}>
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
				<Button variant="secondary" onclick={() => (showFileModal = false)}>Close</Button>
			</div>
		</div>
	</div>
{/if}
