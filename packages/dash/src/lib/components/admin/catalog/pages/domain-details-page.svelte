<script>
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Play from 'lucide-svelte/icons/play';
	import Settings from 'lucide-svelte/icons/settings';
	import Download from 'lucide-svelte/icons/download';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertCircle from 'lucide-svelte/icons/alert-circle';
	import X from 'lucide-svelte/icons/x';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { PageErrorAlert } from '../shared/index.js';

	let {
		domain = '',
		stats = null,
		workflows = [],
		latestExport = null,
		loading = false,
		error = null,
		onRefresh = () => {},
		onStartWorkflow = async () => {},
		onOpenConfig = () => {},
		onSaveConfig = async () => {},
		onViewWorkflow = () => {},
		onDownloadExport = () => {},
		onDismissError = () => {}
	} = $props();

	// Local state
	let startingWorkflow = $state(false);
	let showWorkflowModal = $state(false);
	let selectedWorkflow = $state(null);
	let showConfigModal = $state(false);
	let config = $state(null);
	let savingConfig = $state(false);

	// Derived
	let latestWorkflow = $derived(workflows[0]);
	let runningWorkflow = $derived(workflows.find((w) => w.status === 'running'));

	async function handleStartWorkflow() {
		startingWorkflow = true;
		try {
			await onStartWorkflow(domain);
		} finally {
			startingWorkflow = false;
		}
	}

	async function handleOpenConfig() {
		showConfigModal = true;
		config = await onOpenConfig(domain);
	}

	async function handleSaveConfig() {
		if (!config) return;
		savingConfig = true;
		try {
			await onSaveConfig(domain, config);
			showConfigModal = false;
		} finally {
			savingConfig = false;
		}
	}

	function handleViewWorkflow(workflow) {
		selectedWorkflow = workflow;
		showWorkflowModal = true;
		onViewWorkflow(workflow);
	}

	function handleDownloadExport(filename) {
		onDownloadExport(domain, latestExport?.workflowId, filename);
	}

	function getStatusVariant(status) {
		switch (status) {
			case 'completed':
				return 'default';
			case 'running':
				return 'secondary';
			case 'failed':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getStatusIcon(status) {
		switch (status) {
			case 'completed':
				return CheckCircle;
			case 'running':
				return RefreshCw;
			case 'failed':
				return AlertCircle;
			default:
				return Clock;
		}
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<div class="flex items-center gap-3">
			<PageHeader title={domain} />
			{#if runningWorkflow}
				<Badge variant="secondary">
					<RefreshCw class="h-3 w-3 mr-1 animate-spin" />
					Running
				</Badge>
			{:else if latestWorkflow}
				<Badge variant={getStatusVariant(latestWorkflow.status)}>
					{latestWorkflow.status}
				</Badge>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			<Button variant="outline" onclick={handleOpenConfig}>
				<Settings class="h-4 w-4 mr-2" />
				Configure
			</Button>
			<Button onclick={handleStartWorkflow} disabled={startingWorkflow}>
				{#if startingWorkflow}
					<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
				{:else}
					<Play class="h-4 w-4 mr-2" />
				{/if}
				Start Workflow
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
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Total Products</div>
					<div class="text-2xl font-bold">
						{stats.totalProducts?.toLocaleString() || 0}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Normalized</div>
					<div class="text-2xl font-bold text-green-600">
						{stats.normalizationStats?.normalized?.toLocaleString() || 0}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Unnormalized</div>
					<div class="text-2xl font-bold text-yellow-600">
						{stats.normalizationStats?.unnormalized?.toLocaleString() || 0}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase mb-1">Categories</div>
					<div class="text-2xl font-bold">{stats.byNormalizedType?.length || 0}</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Two Column Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Categories -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Categories</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if stats.byNormalizedType && stats.byNormalizedType.length > 0}
						<div class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
							{#each stats.byNormalizedType as cat (cat.category)}
								<div
									class="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
								>
									<span class="text-muted-foreground"
										>{cat.category || 'Uncategorized'}</span
									>
									<span class="font-semibold">{cat.count?.toLocaleString()}</span>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-4">No categories found</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Top Vendors -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Top Vendors</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if stats.byVendor && stats.byVendor.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each stats.byVendor.slice(0, 15) as vendor (vendor.vendor)}
								<Badge variant="outline">
									{vendor.vendor} ({vendor.count})
								</Badge>
							{/each}
						</div>
					{:else}
						<p class="text-center text-muted-foreground py-4">No vendors found</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Recent Workflows -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title class="text-base">Recent Workflows</Card.Title>
				<a href="/admin/catalog/workflows" class="text-sm text-primary hover:underline"
					>View all</a
				>
			</Card.Header>
			<Card.Content>
				{#if workflows.length > 0}
					<div class="flex flex-col gap-3">
						{#each workflows.slice(0, 5) as workflow (workflow.workflow_id)}
							<button
								class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left w-full"
								onclick={() => handleViewWorkflow(workflow)}
							>
								<div class="flex items-center gap-3">
									<svelte:component
										this={getStatusIcon(workflow.status)}
										class="h-5 w-5 {workflow.status === 'running'
											? 'animate-spin text-blue-500'
											: workflow.status === 'completed'
												? 'text-green-500'
												: workflow.status === 'failed'
													? 'text-destructive'
													: 'text-muted-foreground'}"
									/>
									<div>
										<div class="font-mono text-sm truncate max-w-[200px]">
											{workflow.workflow_id}
										</div>
										<div class="text-xs text-muted-foreground">
											{new Date(workflow.created_at).toLocaleString()}
										</div>
									</div>
								</div>
								<Badge variant={getStatusVariant(workflow.status)}>
									{workflow.status}
								</Badge>
							</button>
						{/each}
					</div>
				{:else}
					<p class="text-center text-muted-foreground py-4">
						No workflows yet. Start one to begin fetching products.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Latest Export -->
		{#if latestExport}
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between">
					<Card.Title class="text-base">Latest Export</Card.Title>
					<span class="text-sm text-muted-foreground">
						{new Date(latestExport.createdAt).toLocaleString()}
					</span>
				</Card.Header>
				<Card.Content>
					<p class="text-muted-foreground mb-4">
						{latestExport.totalProducts?.toLocaleString()} products in {latestExport
							.files?.length || 0} files
					</p>
					<div class="flex flex-col gap-2">
						{#each latestExport.files || [] as file (file.filename)}
							<div class="flex items-center justify-between p-3 bg-muted/50 rounded">
								<div>
									<div class="font-medium text-sm">{file.filename}</div>
									<div class="text-xs text-muted-foreground">
										{file.productCount} products · {(
											file.gzSizeBytes / 1024
										).toFixed(1)} KB
									</div>
								</div>
								<Button
									size="sm"
									variant="outline"
									onclick={() => handleDownloadExport(file.filename)}
								>
									<Download class="h-3 w-3 mr-1" />
									Download
								</Button>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>

<!-- Workflow Modal -->
{#if showWorkflowModal && selectedWorkflow}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) showWorkflowModal = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') showWorkflowModal = false;
		}}
		role="dialog"
		tabindex="-1"
	>
		<div class="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="font-semibold">Workflow Details</h2>
				<Button variant="ghost" size="sm" onclick={() => (showWorkflowModal = false)}>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="flex-1 overflow-auto p-4">
				<div class="mb-4">
					<div class="font-mono text-sm text-muted-foreground">
						{selectedWorkflow.workflow_id}
					</div>
					<div class="flex items-center gap-2 mt-2">
						<Badge variant={getStatusVariant(selectedWorkflow.status)}>
							{selectedWorkflow.status}
						</Badge>
						<span class="text-sm text-muted-foreground">
							Started {new Date(selectedWorkflow.created_at).toLocaleString()}
						</span>
					</div>
				</div>

				{#if selectedWorkflow.steps}
					<div class="flex flex-col gap-2">
						{#each selectedWorkflow.steps as step, i (i)}
							<div
								class="flex items-center gap-3 p-3 border rounded {i ===
								selectedWorkflow.current_step
									? 'border-primary bg-primary/5'
									: ''}"
							>
								<div
									class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium {step.status ===
									'completed'
										? 'bg-green-500 text-white'
										: step.status === 'running'
											? 'bg-blue-500 text-white'
											: step.status === 'failed'
												? 'bg-destructive text-white'
												: 'bg-muted text-muted-foreground'}"
								>
									{i + 1}
								</div>
								<div class="flex-1">
									<div class="font-medium text-sm">{step.name}</div>
									{#if step.productsProcessed}
										<div class="text-xs text-muted-foreground">
											{step.productsProcessed.toLocaleString()} products processed
										</div>
									{/if}
								</div>
								<Badge
									variant={step.status === 'completed'
										? 'default'
										: step.status === 'running'
											? 'secondary'
											: step.status === 'failed'
												? 'destructive'
												: 'outline'}
								>
									{step.status}
								</Badge>
							</div>
						{/each}
					</div>
				{/if}

				{#if selectedWorkflow.error_message}
					<div class="mt-4 p-3 bg-destructive/10 text-destructive rounded text-sm">
						{selectedWorkflow.error_message}
					</div>
				{/if}
			</div>

			<div class="flex justify-end p-4 border-t">
				<Button variant="secondary" onclick={() => (showWorkflowModal = false)}
					>Close</Button
				>
			</div>
		</div>
	</div>
{/if}

<!-- Config Modal -->
{#if showConfigModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) showConfigModal = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') showConfigModal = false;
		}}
		role="dialog"
		tabindex="-1"
	>
		<div class="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="font-semibold">Configure {domain}</h2>
				<Button variant="ghost" size="sm" onclick={() => (showConfigModal = false)}>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="flex-1 overflow-auto p-4">
				{#if config}
					<div class="grid grid-cols-2 gap-4">
						<div>
							<Label for="platform_id">Platform ID</Label>
							<Input id="platform_id" bind:value={config.platform_id} />
						</div>
						<div>
							<Label for="catalog_strategy">Catalog Strategy</Label>
							<select
								id="catalog_strategy"
								bind:value={config.catalog_strategy}
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
							>
								<option value="shopify">Shopify</option>
								<option value="sitemap">Sitemap</option>
							</select>
						</div>
						<div>
							<Label for="products_per_hour">Products per Hour</Label>
							<Input
								id="products_per_hour"
								type="number"
								bind:value={config.products_per_hour}
							/>
						</div>
						<div>
							<Label for="max_parallel">Max Parallel</Label>
							<Input
								id="max_parallel"
								type="number"
								bind:value={config.max_parallel}
							/>
						</div>
						<div>
							<Label for="batch_size">Batch Size</Label>
							<Input id="batch_size" type="number" bind:value={config.batch_size} />
						</div>
						<div>
							<Label for="cache_ttl_hours">Cache TTL (hours)</Label>
							<Input
								id="cache_ttl_hours"
								type="number"
								bind:value={config.cache_ttl_hours}
							/>
						</div>
					</div>
				{:else}
					<div class="flex items-center justify-center py-8 text-muted-foreground">
						<RefreshCw class="h-5 w-5 animate-spin mr-2" />
						Loading config...
					</div>
				{/if}
			</div>

			<div class="flex justify-end gap-3 p-4 border-t">
				<Button variant="outline" onclick={() => (showConfigModal = false)}>Cancel</Button>
				<Button onclick={handleSaveConfig} disabled={savingConfig || !config}>
					{#if savingConfig}
						<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
					{/if}
					Save
				</Button>
			</div>
		</div>
	</div>
{/if}
