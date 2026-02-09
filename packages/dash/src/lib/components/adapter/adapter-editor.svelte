<script>
	import { onMount } from 'svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import { adapterStore } from '$lib/services/adapter/adapter-store.svelte.js';
	import FileTree from './file-tree.svelte';
	import CodeEditor from './code-editor.svelte';
	import TestPanel from './test-panel.svelte';
	import PublishBar from './publish-bar.svelte';
	import UnsavedDialog from './unsaved-dialog.svelte';

	let { domain } = $props();

	let showUnsavedDialog = $state(false);
	let pendingFilePath = $state(null);
	let showPublishConfirm = $state(false);
	let showForcePublishWarning = $state(false);
	let showRollbackConfirm = $state(false);

	onMount(() => {
		adapterStore.initialize(domain);
	});

	function handleFileSelect(path) {
		if (adapterStore.isDirty) {
			pendingFilePath = path;
			showUnsavedDialog = true;
		} else {
			adapterStore.selectFile(path);
		}
	}

	function handleUnsavedSave() {
		showUnsavedDialog = false;
		adapterStore.saveCurrentFile().then(() => {
			if (pendingFilePath) {
				adapterStore.selectFile(pendingFilePath);
				pendingFilePath = null;
			}
		});
	}

	function handleUnsavedDiscard() {
		showUnsavedDialog = false;
		if (pendingFilePath) {
			adapterStore.selectFile(pendingFilePath);
			pendingFilePath = null;
		}
	}

	function handleUnsavedCancel() {
		showUnsavedDialog = false;
		pendingFilePath = null;
	}

	async function handleCreateFile(path) {
		try {
			await adapterStore.createFile(path);
		} catch {
			// Error is captured in the store
		}
	}

	async function handleDeleteFile(path) {
		if (confirm(`Delete "${path}"? This cannot be undone.`)) {
			try {
				await adapterStore.deleteFile(path);
			} catch {
				// Error is captured in the store
			}
		}
	}

	function handlePublish() {
		const testStatus = adapterStore.testRun?.status;
		if (adapterStore.isDirty) return;

		if (!testStatus || testStatus === 'failed') {
			showForcePublishWarning = true;
		} else {
			showPublishConfirm = true;
		}
	}

	async function confirmPublish(force = false) {
		showPublishConfirm = false;
		showForcePublishWarning = false;
		try {
			await adapterStore.publish(force);
		} catch {
			// Error is captured in the store
		}
	}

	async function handleRollback() {
		showRollbackConfirm = true;
	}

	async function confirmRollback() {
		showRollbackConfirm = false;
		try {
			await adapterStore.rollback();
		} catch {
			// Error is captured in the store
		}
	}

	function handleKeydown(e) {
		// Ctrl/Cmd+S to save
		if ((e.ctrlKey || e.metaKey) && e.key === 's') {
			e.preventDefault();
			if (adapterStore.isDirty) adapterStore.saveCurrentFile();
		}
		// Ctrl/Cmd+Shift+T to run tests
		if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
			e.preventDefault();
			if (!adapterStore.isTestRunning) adapterStore.runTests();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-lg border bg-background">
	{#if adapterStore.isLoading}
		<div class="flex h-full items-center justify-center text-sm text-muted-foreground">
			Loading adapter files...
		</div>
	{:else}
		<PublishBar
			selectedFilePath={adapterStore.selectedFilePath}
			isDirty={adapterStore.isDirty}
			isSaving={adapterStore.isSaving}
			isTestRunning={adapterStore.isTestRunning}
			isPublishing={adapterStore.isPublishing}
			currentVersion={adapterStore.currentVersion}
			canRollback={adapterStore.canRollback}
			onsave={() => adapterStore.saveCurrentFile()}
			onrunTests={() => adapterStore.runTests()}
			onpublish={handlePublish}
			onrollback={handleRollback}
		/>

		{#if adapterStore.error}
			<div class="border-b bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
				{adapterStore.error}
			</div>
		{/if}

		<Resizable.PaneGroup direction="horizontal" class="flex-1">
			<Resizable.Pane defaultSize={20} minSize={15} class="overflow-hidden">
				<FileTree
					tree={adapterStore.fileTree}
					selectedPath={adapterStore.selectedFilePath}
					onselect={handleFileSelect}
					ondelete={handleDeleteFile}
					oncreate={handleCreateFile}
				/>
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane defaultSize={80} minSize={40}>
				<Resizable.PaneGroup direction="vertical">
					<Resizable.Pane defaultSize={70} minSize={30}>
						{#if adapterStore.selectedFilePath}
							<CodeEditor
								value={adapterStore.openFileContent}
								onchange={(content) => adapterStore.updateContent(content)}
							/>
						{:else}
							<div
								class="flex h-full items-center justify-center text-sm text-muted-foreground"
							>
								Select a file to view its contents
							</div>
						{/if}
					</Resizable.Pane>
					<Resizable.Handle />
					<Resizable.Pane defaultSize={30} minSize={10} collapsible={true}>
						<TestPanel
							testRun={adapterStore.testRun}
							isTestStale={adapterStore.isTestStale}
						/>
					</Resizable.Pane>
				</Resizable.PaneGroup>
			</Resizable.Pane>
		</Resizable.PaneGroup>
	{/if}
</div>

<UnsavedDialog
	bind:open={showUnsavedDialog}
	onSave={handleUnsavedSave}
	onDiscard={handleUnsavedDiscard}
	onCancel={handleUnsavedCancel}
/>

<!-- Publish confirmation dialog -->
{#if showPublishConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
		<div class="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
			<h3 class="text-lg font-semibold">Publish Adapter</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				This will make your current adapter code live. Are you sure?
			</p>
			<div class="mt-4 flex justify-end gap-2">
				<button
					class="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
					onclick={() => (showPublishConfirm = false)}
				>
					Cancel
				</button>
				<button
					class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					onclick={() => confirmPublish(false)}
				>
					Publish
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Force publish warning dialog -->
{#if showForcePublishWarning}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
		<div class="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
			<h3 class="text-lg font-semibold text-amber-600">Warning: Tests Not Passing</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				{#if adapterStore.testRun?.status === 'failed'}
					Tests have failed ({adapterStore.testRun.summary.failed} failures). Publishing may
					cause issues for your store.
				{:else}
					Tests have not been run. We recommend running tests before publishing.
				{/if}
			</p>
			<div class="mt-4 flex justify-end gap-2">
				<button
					class="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
					onclick={() => (showForcePublishWarning = false)}
				>
					Cancel
				</button>
				<button
					class="inline-flex h-9 items-center rounded-md bg-amber-600 px-4 text-sm font-medium text-white hover:bg-amber-700"
					onclick={() => confirmPublish(true)}
				>
					Force Publish
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Rollback confirmation dialog -->
{#if showRollbackConfirm}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog">
		<div class="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
			<h3 class="text-lg font-semibold">Rollback Adapter</h3>
			<p class="mt-2 text-sm text-muted-foreground">
				This will restore your adapter to the previous published version ({adapterStore
					.previousVersion?.versionId}). Your current draft changes will be lost.
			</p>
			<div class="mt-4 flex justify-end gap-2">
				<button
					class="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium hover:bg-accent"
					onclick={() => (showRollbackConfirm = false)}
				>
					Cancel
				</button>
				<button
					class="inline-flex h-9 items-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
					onclick={confirmRollback}
				>
					Rollback
				</button>
			</div>
		</div>
	</div>
{/if}
