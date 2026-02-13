<script>
	import Package from 'lucide-svelte/icons/package';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Percent from 'lucide-svelte/icons/percent';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Play from 'lucide-svelte/icons/play';
	import Settings from 'lucide-svelte/icons/settings';
	import Layers from 'lucide-svelte/icons/layers';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import History from 'lucide-svelte/icons/history';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Database from 'lucide-svelte/icons/database';
	import Pencil from 'lucide-svelte/icons/pencil';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { PageErrorAlert } from '../shared/index.js';

	// Props
	let {
		domain = '',
		countryCode = '',
		stats = null,
		config = null,
		products = null,
		variantStats = null,
		priceChanges = null,
		availabilityChanges = null,
		loading = false,
		error = null,
		// Action states
		syncing = false,
		triggering = false,
		migrating = false,
		savingConfig = false,
		// Handlers
		onRefresh = () => {},
		onSync = () => {},
		onTriggerWorkflow = () => {},
		onMigrate = () => {},
		onSaveConfig = () => {},
		onFilterChange = () => {},
		onPageChange = () => {},
		onDismissError = () => {}
	} = $props();

	// Local state
	let statusFilter = $state('');
	let editingConfig = $state(false);
	let editBatchSize = $state(5);
	let editDelayMs = $state(4000);
	let editFreshnessHours = $state(48);
	let editMaxRetries = $state(3);

	// Initialize config edit values when config changes
	$effect(() => {
		if (config?.config) {
			editBatchSize = config.config.batchSize;
			editDelayMs = config.config.delayBetweenBatchesMs;
			editFreshnessHours = config.config.freshnessThresholdHours;
			editMaxRetries = config.config.maxRetryAttempts;
		}
	});

	// Derived values
	let totalProducts = $derived(
		stats?.stats?.total ??
			(stats?.stats?.active
				? (stats.stats.active.pending || 0) +
					(stats.stats.active.success || 0) +
					(stats.stats.active.failed || 0) +
					(stats.stats.active.permanently_failed || 0)
				: 0)
	);

	let completionPercent = $derived(
		totalProducts > 0 && stats?.stats?.active
			? Math.round((stats.stats.active.success / totalProducts) * 100)
			: 0
	);

	function handleFilterChange(newFilter) {
		statusFilter = newFilter;
		onFilterChange(newFilter, 1);
	}

	function handlePageChange(newPage) {
		onPageChange(statusFilter, newPage);
	}

	function handleSaveConfig() {
		onSaveConfig({
			batchSize: editBatchSize,
			delayBetweenBatchesMs: editDelayMs,
			freshnessThresholdHours: editFreshnessHours,
			maxRetryAttempts: editMaxRetries
		});
		editingConfig = false;
	}

	function getStatusBadgeVariant(status) {
		switch (status) {
			case 'success':
				return 'default';
			case 'pending':
				return 'secondary';
			case 'failed':
			case 'permanently_failed':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<!-- Header -->
	<div>
		<nav class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
			<a href="/admin/catalog/product-details" class="text-primary hover:underline"
				>Product Details</a
			>
			<span>/</span>
			<span>{domain}</span>
			<span>/</span>
			<span>{countryCode}</span>
		</nav>
		<h1 class="text-2xl font-bold">
			{domain} <span class="text-muted-foreground font-normal">/ {countryCode}</span>
		</h1>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	<!-- Actions Bar -->
	<div class="flex gap-3 flex-wrap">
		<Button variant="outline" onclick={onRefresh} disabled={loading}>
			<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
		<Button variant="outline" disabled={syncing} onclick={onSync}>
			{#if syncing}
				<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
			{:else}
				<Database class="h-4 w-4 mr-2" />
			{/if}
			Sync Products
		</Button>
		<Button disabled={triggering} onclick={onTriggerWorkflow}>
			{#if triggering}
				<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
			{:else}
				<Play class="h-4 w-4 mr-2" />
			{/if}
			Run Workflow
		</Button>
		<Button variant="outline" disabled={migrating} onclick={onMigrate}>
			{#if migrating}
				<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
			{:else}
				<Settings class="h-4 w-4 mr-2" />
			{/if}
			Run Migration
		</Button>
	</div>

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading domain data...
			</Card.Content>
		</Card.Root>
	{:else if stats}
		<!-- Stats Overview -->
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-blue-500/10">
							<Package class="h-5 w-5 text-blue-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Total Products</p>
							<p class="text-xl font-bold">{formatNumber(totalProducts)}</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-green-500/10">
							<CheckCircle class="h-5 w-5 text-green-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Success</p>
							<p class="text-xl font-bold">
								{formatNumber(stats.stats?.active?.success)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-yellow-500/10">
							<Clock class="h-5 w-5 text-yellow-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Pending</p>
							<p class="text-xl font-bold">
								{formatNumber(stats.stats?.active?.pending)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-red-500/10">
							<AlertTriangle class="h-5 w-5 text-red-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Failed</p>
							<p class="text-xl font-bold">
								{formatNumber(
									(stats.stats?.active?.failed || 0) +
										(stats.stats?.active?.permanently_failed || 0)
								)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-purple-500/10">
							<Percent class="h-5 w-5 text-purple-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Completion</p>
							<p class="text-xl font-bold">{completionPercent}%</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Progress Bar -->
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span class="text-muted-foreground">Progress</span>
						<span class="font-medium">{completionPercent}%</span>
					</div>
					<Progress value={completionPercent} class="h-3" />
				</div>
			</Card.Content>
		</Card.Root>

		<div class="grid md:grid-cols-2 gap-4">
			<!-- Configuration -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Settings class="h-5 w-5" />
						Configuration
					</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if editingConfig}
						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="batchSize">Batch Size</Label>
								<Input
									type="number"
									id="batchSize"
									bind:value={editBatchSize}
									min={1}
									max={50}
								/>
							</div>
							<div class="space-y-2">
								<Label for="delayMs">Delay (ms)</Label>
								<Input
									type="number"
									id="delayMs"
									bind:value={editDelayMs}
									min={0}
									step={1000}
								/>
							</div>
							<div class="space-y-2">
								<Label for="freshnessHours">Freshness (hours)</Label>
								<Input
									type="number"
									id="freshnessHours"
									bind:value={editFreshnessHours}
									min={1}
								/>
							</div>
							<div class="space-y-2">
								<Label for="maxRetries">Max Retries</Label>
								<Input
									type="number"
									id="maxRetries"
									bind:value={editMaxRetries}
									min={1}
									max={10}
								/>
							</div>
						</div>
						<div class="flex gap-2 mt-4">
							<Button size="sm" disabled={savingConfig} onclick={handleSaveConfig}>
								{#if savingConfig}
									<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
								{/if}
								Save
							</Button>
							<Button
								variant="outline"
								size="sm"
								onclick={() => (editingConfig = false)}
							>
								Cancel
							</Button>
						</div>
					{:else if config?.config}
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm text-muted-foreground">Batch Size</p>
								<p class="font-semibold">{config.config.batchSize}</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Delay Between Batches</p>
								<p class="font-semibold">{config.config.delayBetweenBatchesMs}ms</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Freshness Threshold</p>
								<p class="font-semibold">
									{config.config.freshnessThresholdHours} hours
								</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Max Retry Attempts</p>
								<p class="font-semibold">{config.config.maxRetryAttempts}</p>
							</div>
						</div>
						<div class="mt-4">
							<Button
								variant="outline"
								size="sm"
								onclick={() => (editingConfig = true)}
							>
								<Pencil class="h-4 w-4 mr-2" />
								Edit
							</Button>
						</div>
					{:else}
						<p class="text-muted-foreground">No configuration available</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Variant Stats -->
			{#if variantStats}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<Layers class="h-5 w-5" />
							Variant Statistics
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<p class="text-sm text-muted-foreground">Total Variants</p>
								<p class="font-semibold">
									{formatNumber(variantStats.total_variants)}
								</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Available</p>
								<p class="font-semibold text-green-600">
									{formatNumber(variantStats.available_count)}
								</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Out of Stock</p>
								<p class="font-semibold text-red-600">
									{formatNumber(variantStats.out_of_stock_count)}
								</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Price Range</p>
								<p class="font-semibold">
									${variantStats.min_price} - ${variantStats.max_price}
								</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Average Price</p>
								<p class="font-semibold">${variantStats.avg_price}</p>
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Price History Records</p>
								<p class="font-semibold">
									{formatNumber(variantStats.price_history_records)}
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<div class="grid md:grid-cols-2 gap-4">
			<!-- Recent Price Changes -->
			{#if priceChanges?.changes && priceChanges.changes.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<DollarSign class="h-5 w-5" />
							Recent Price Changes
						</Card.Title>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="max-h-[300px] overflow-y-auto">
							{#each priceChanges.changes as change (change.id || change.variant_sku + change.recorded_at)}
								<div class="p-3 border-b last:border-b-0 hover:bg-muted/30">
									<p class="font-medium text-sm">{change.variant_sku}</p>
									<p class="text-sm text-muted-foreground truncate">
										{change.title}
									</p>
									<p class="text-sm">
										New price: <strong>${change.new_price}</strong>
										{#if change.new_msrp}
											<span class="text-muted-foreground"
												>(MSRP: ${change.new_msrp})</span
											>
										{/if}
									</p>
									<p class="text-xs text-muted-foreground mt-1">
										{new Date(change.recorded_at).toLocaleString()}
									</p>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Recent Availability Changes -->
			{#if availabilityChanges?.changes && availabilityChanges.changes.length > 0}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<History class="h-5 w-5" />
							Recent Availability Changes
						</Card.Title>
					</Card.Header>
					<Card.Content class="p-0">
						<div class="max-h-[300px] overflow-y-auto">
							{#each availabilityChanges.changes as change (change.id || change.variant_sku + change.recorded_at)}
								<div class="p-3 border-b last:border-b-0 hover:bg-muted/30">
									<p class="font-medium text-sm">{change.variant_sku}</p>
									<p class="text-sm text-muted-foreground truncate">
										{change.title}
									</p>
									<p class="text-sm">
										Status: <strong
											class={change.available
												? 'text-green-600'
												: 'text-red-600'}
										>
											{change.available ? 'In Stock' : 'Out of Stock'}
										</strong>
									</p>
									<p class="text-xs text-muted-foreground mt-1">
										{new Date(change.recorded_at).toLocaleString()}
									</p>
								</div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>

		<!-- Products List -->
		<section>
			<h2 class="text-lg font-semibold mb-4">Products</h2>

			<div class="flex gap-2 mb-4 flex-wrap">
				<button
					class="px-3 py-1.5 text-sm border rounded-md transition-colors {statusFilter ===
					''
						? 'bg-primary/10 border-primary text-primary'
						: 'bg-background hover:bg-muted'}"
					onclick={() => handleFilterChange('')}
				>
					All
				</button>
				<button
					class="px-3 py-1.5 text-sm border rounded-md transition-colors {statusFilter ===
					'pending'
						? 'bg-primary/10 border-primary text-primary'
						: 'bg-background hover:bg-muted'}"
					onclick={() => handleFilterChange('pending')}
				>
					Pending
				</button>
				<button
					class="px-3 py-1.5 text-sm border rounded-md transition-colors {statusFilter ===
					'success'
						? 'bg-primary/10 border-primary text-primary'
						: 'bg-background hover:bg-muted'}"
					onclick={() => handleFilterChange('success')}
				>
					Success
				</button>
				<button
					class="px-3 py-1.5 text-sm border rounded-md transition-colors {statusFilter ===
					'failed'
						? 'bg-primary/10 border-primary text-primary'
						: 'bg-background hover:bg-muted'}"
					onclick={() => handleFilterChange('failed')}
				>
					Failed
				</button>
				<button
					class="px-3 py-1.5 text-sm border rounded-md transition-colors {statusFilter ===
					'permanently_failed'
						? 'bg-primary/10 border-primary text-primary'
						: 'bg-background hover:bg-muted'}"
					onclick={() => handleFilterChange('permanently_failed')}
				>
					Permanently Failed
				</button>
			</div>

			<Card.Root>
				{#if products?.products && products.products.length > 0}
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="p-3 text-left font-medium">Handle</th>
									<th class="p-3 text-left font-medium">PDP URL</th>
									<th class="p-3 text-left font-medium">Status</th>
									<th class="p-3 text-right font-medium">Attempts</th>
									<th class="p-3 text-left font-medium">Updated</th>
								</tr>
							</thead>
							<tbody>
								{#each products.products as product (product.handle || product.pdp_url)}
									<tr class="border-b hover:bg-muted/30 transition-colors">
										<td class="p-3 font-medium">{product.handle}</td>
										<td class="p-3">
											<a
												href={product.pdp_url}
												target="_blank"
												rel="noopener"
												class="text-primary hover:underline flex items-center gap-1 max-w-[300px] truncate"
												title={product.pdp_url}
											>
												{product.pdp_url}
												<ExternalLink class="h-3 w-3 flex-shrink-0" />
											</a>
										</td>
										<td class="p-3">
											<Badge variant={getStatusBadgeVariant(product.status)}>
												{product.status}
											</Badge>
										</td>
										<td class="p-3 text-right tabular-nums"
											>{product.attempts}</td
										>
										<td class="p-3 text-muted-foreground">
											{new Date(product.updated_at).toLocaleString()}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					{#if products.pagination}
						<div class="flex items-center justify-between p-3 border-t">
							<p class="text-sm text-muted-foreground">
								Showing {(products.pagination.page - 1) * products.pagination.size +
									1} - {Math.min(
									products.pagination.page * products.pagination.size,
									products.pagination.total
								)} of {formatNumber(products.pagination.total)}
							</p>
							<div class="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={products.pagination.page <= 1}
									onclick={() => handlePageChange(products.pagination.page - 1)}
								>
									<ChevronLeft class="h-4 w-4 mr-1" />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={products.pagination.page >=
										products.pagination.totalPages}
									onclick={() => handlePageChange(products.pagination.page + 1)}
								>
									Next
									<ChevronRight class="h-4 w-4 ml-1" />
								</Button>
							</div>
						</div>
					{/if}
				{:else}
					<Card.Content class="py-8 text-center text-muted-foreground">
						No products found
					</Card.Content>
				{/if}
			</Card.Root>
		</section>
	{/if}
</div>
