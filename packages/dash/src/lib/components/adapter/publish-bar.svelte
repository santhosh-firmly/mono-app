<script>
	import { Save, Play, Upload, Undo2, Loader2, Circle } from 'lucide-svelte';

	let {
		selectedFilePath = null,
		isDirty = false,
		isSaving = false,
		isTestRunning = false,
		isPublishing = false,
		currentVersion = null,
		canRollback = false,
		onsave = () => {},
		onrunTests = () => {},
		onpublish = () => {},
		onrollback = () => {}
	} = $props();
</script>

<div class="flex items-center gap-2 border-b bg-muted/30 px-3 py-1.5">
	<div class="flex min-w-0 flex-1 items-center gap-2">
		{#if selectedFilePath}
			<span class="truncate text-sm font-medium text-foreground">{selectedFilePath}</span>
			{#if isDirty}
				<Circle class="h-2.5 w-2.5 flex-shrink-0 fill-amber-500 text-amber-500" />
			{/if}
		{:else}
			<span class="text-sm text-muted-foreground">No file selected</span>
		{/if}
	</div>

	<div class="flex items-center gap-1.5">
		<button
			class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
			onclick={onsave}
			disabled={!isDirty || isSaving}
			title="Save (Ctrl+S)"
		>
			{#if isSaving}
				<Loader2 class="h-3.5 w-3.5 animate-spin" />
			{:else}
				<Save class="h-3.5 w-3.5" />
			{/if}
			Save
		</button>

		<div class="mx-1 h-4 w-px bg-border"></div>

		<button
			class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
			onclick={onrunTests}
			disabled={isTestRunning}
			title="Run Tests (Ctrl+Shift+T)"
		>
			{#if isTestRunning}
				<Loader2 class="h-3.5 w-3.5 animate-spin" />
			{:else}
				<Play class="h-3.5 w-3.5" />
			{/if}
			Run Tests
		</button>

		<div class="mx-1 h-4 w-px bg-border"></div>

		<button
			class="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
			onclick={onpublish}
			disabled={isDirty || isPublishing}
			title={isDirty ? 'Save changes before publishing' : 'Publish adapter'}
		>
			{#if isPublishing}
				<Loader2 class="h-3.5 w-3.5 animate-spin" />
			{:else}
				<Upload class="h-3.5 w-3.5" />
			{/if}
			Publish
		</button>

		{#if canRollback}
			<button
				class="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
				onclick={onrollback}
				disabled={isPublishing}
				title="Rollback to previous version"
			>
				<Undo2 class="h-3.5 w-3.5" />
				Rollback
			</button>
		{/if}

		{#if currentVersion}
			<div class="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
				<span class="rounded bg-muted px-1.5 py-0.5 font-mono">
					{currentVersion.versionId}
				</span>
				{#if currentVersion.forcePublished}
					<span
						class="rounded bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
					>
						force
					</span>
				{/if}
			</div>
		{:else}
			<span class="ml-2 text-xs text-muted-foreground">Draft</span>
		{/if}
	</div>
</div>
