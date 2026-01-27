<script>
	import { onMount } from 'svelte';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import X from 'lucide-svelte/icons/x';
	import Database from 'lucide-svelte/icons/database';
	import CheckCircle from 'lucide-svelte/icons/check-circle';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Progress from '$lib/components/ui/progress/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { catalogApi } from '$lib/api/catalog/index.js';

	let stats = $state([]);
	let loading = $state(true);
	let error = $state(null);
	let migratingDomain = $state(null);

	// Results modal
	let showResultsModal = $state(false);
	let migrationResult = $state(null);

	// Bulk migration
	let migratingAll = $state(false);

	let totalV2 = $derived(stats.reduce((sum, s) => sum + (s.v2Count || 0), 0));
	let totalV3 = $derived(stats.reduce((sum, s) => sum + (s.v3Count || 0), 0));
	let overallProgress = $derived(
		totalV2 + totalV3 > 0 ? (totalV3 / (totalV2 + totalV3)) * 100 : 100
	);

	let pendingDomains = $derived(
		stats.filter((s) => s.status === 'pending' || s.status === 'partial')
	);
	let completedDomains = $derived(stats.filter((s) => s.status === 'migrated'));
	let errorDomains = $derived(stats.filter((s) => s.status === 'error'));

	onMount(async () => {
		await loadStats();
	});

	async function loadStats() {
		loading = true;
		error = null;
		try {
			stats = await catalogApi.migration.getStats();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load migration stats';
		} finally {
			loading = false;
		}
	}

	async function migrateDomain(domain, dryRun = false) {
		migratingDomain = domain;
		try {
			const result = await catalogApi.migration.migrate(domain, dryRun);
			migrationResult = result;
			showResultsModal = true;
			if (!dryRun) {
				await loadStats();
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Migration failed';
		} finally {
			migratingDomain = null;
		}
	}

	async function migrateAll() {
		migratingAll = true;

		for (const stat of pendingDomains) {
			try {
				await catalogApi.migration.migrate(stat.domain, false);
			} catch {
				// Ignore individual errors during bulk migration
			}
		}

		migratingAll = false;
		await loadStats();
	}

	function getStatusVariant(status) {
		switch (status) {
			case 'migrated':
				return 'default';
			case 'partial':
				return 'secondary';
			case 'error':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function getStatusLabel(status) {
		switch (status) {
			case 'migrated':
				return 'Migrated';
			case 'partial':
				return 'Partial';
			case 'pending':
				return 'Pending';
			case 'error':
				return 'Error';
			case 'empty':
				return 'Empty';
			default:
				return status;
		}
	}

	function getDomainProgress(stat) {
		return stat.v2Count + stat.v3Count > 0
			? (stat.v3Count / (stat.v2Count + stat.v3Count)) * 100
			: 0;
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader title="Storage Migration" description="Migrate products from V2 to V3 format" />
		<div class="flex items-center gap-4">
			<Button variant="outline" onclick={loadStats} disabled={loading}>
				<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
				Refresh
			</Button>
			{#if pendingDomains.length > 0}
				<Button onclick={migrateAll} disabled={migratingAll}>
					{#if migratingAll}
						<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
					{/if}
					Migrate All ({pendingDomains.length})
				</Button>
			{/if}
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
				Loading migration stats...
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Stats Grid -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase tracking-wide mb-1">
						V2 Products (Legacy)
					</div>
					<div class="text-2xl font-bold text-yellow-600">{totalV2.toLocaleString()}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase tracking-wide mb-1">
						V3 Products (Current)
					</div>
					<div class="text-2xl font-bold text-green-600">{totalV3.toLocaleString()}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Content class="p-4">
					<div class="text-xs text-muted-foreground uppercase tracking-wide mb-2">
						Overall Progress
					</div>
					<div class="flex items-center gap-3">
						<Progress.Root value={overallProgress} class="flex-1">
							<Progress.Indicator
								class={overallProgress === 100 ? 'bg-green-500' : 'bg-primary'}
							/>
						</Progress.Root>
						<span class="text-sm font-medium">{Math.round(overallProgress)}%</span>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Pending Section -->
		{#if pendingDomains.length > 0}
			<section>
				<div class="flex items-center gap-2 mb-4">
					<h2 class="text-lg font-semibold">Pending Migration</h2>
					<Badge variant="secondary">{pendingDomains.length}</Badge>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each pendingDomains as stat (stat.domain)}
						<Card.Root>
							<Card.Content class="p-4">
								<div class="flex flex-col gap-3">
									<div class="flex items-center justify-between">
										<span class="font-semibold">{stat.domain}</span>
										<Badge variant={getStatusVariant(stat.status)}>
											{getStatusLabel(stat.status)}
										</Badge>
									</div>

									{#if stat.v2Count > 0 || stat.v3Count > 0}
										<div class="flex gap-4 text-sm text-muted-foreground">
											<span>
												V2: <span class="font-semibold text-yellow-600"
													>{stat.v2Count?.toLocaleString()}</span
												>
											</span>
											<span>
												V3: <span class="font-semibold text-green-600"
													>{stat.v3Count?.toLocaleString()}</span
												>
											</span>
										</div>

										<div class="flex items-center gap-2">
											<Progress.Root
												value={getDomainProgress(stat)}
												class="flex-1 h-2"
											>
												<Progress.Indicator
													class={stat.status === 'migrated'
														? 'bg-green-500'
														: stat.status === 'error'
															? 'bg-destructive'
															: 'bg-yellow-500'}
												/>
											</Progress.Root>
											<span class="text-xs text-muted-foreground"
												>{Math.round(getDomainProgress(stat))}%</span
											>
										</div>
									{/if}

									{#if stat.error}
										<div
											class="text-xs text-destructive bg-destructive/10 p-2 rounded"
										>
											{stat.error}
										</div>
									{/if}

									<div class="flex justify-end gap-2 mt-2">
										<Button
											size="sm"
											onclick={() => migrateDomain(stat.domain)}
											disabled={migratingDomain === stat.domain}
										>
											{#if migratingDomain === stat.domain}
												<RefreshCw class="h-3 w-3 mr-1 animate-spin" />
											{/if}
											{stat.status === 'partial' ? 'Continue' : 'Start'} Migration
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Errors Section -->
		{#if errorDomains.length > 0}
			<section>
				<div class="flex items-center gap-2 mb-4">
					<h2 class="text-lg font-semibold">Errors</h2>
					<Badge variant="destructive">{errorDomains.length}</Badge>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each errorDomains as stat (stat.domain)}
						<Card.Root class="border-destructive/30">
							<Card.Content class="p-4">
								<div class="flex flex-col gap-3">
									<div class="flex items-center justify-between">
										<span class="font-semibold">{stat.domain}</span>
										<Badge variant="destructive">Error</Badge>
									</div>

									{#if stat.v2Count > 0 || stat.v3Count > 0}
										<div class="flex gap-4 text-sm text-muted-foreground">
											<span>
												V2: <span class="font-semibold text-yellow-600"
													>{stat.v2Count?.toLocaleString()}</span
												>
											</span>
											<span>
												V3: <span class="font-semibold text-green-600"
													>{stat.v3Count?.toLocaleString()}</span
												>
											</span>
										</div>
									{/if}

									{#if stat.error}
										<div
											class="text-xs text-destructive bg-destructive/10 p-2 rounded"
										>
											{stat.error}
										</div>
									{/if}

									<div class="flex justify-end gap-2 mt-2">
										<Button
											size="sm"
											variant="outline"
											onclick={() => migrateDomain(stat.domain)}
											disabled={migratingDomain === stat.domain}
										>
											{#if migratingDomain === stat.domain}
												<RefreshCw class="h-3 w-3 mr-1 animate-spin" />
											{/if}
											Retry
										</Button>
									</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Completed Section -->
		{#if completedDomains.length > 0}
			<section>
				<div class="flex items-center gap-2 mb-4">
					<h2 class="text-lg font-semibold">Completed</h2>
					<Badge>{completedDomains.length}</Badge>
				</div>
				<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{#each completedDomains as stat (stat.domain)}
						<Card.Root class="border-green-500/30">
							<Card.Content class="p-4">
								<div class="flex flex-col gap-3">
									<div class="flex items-center justify-between">
										<span class="font-semibold">{stat.domain}</span>
										<Badge class="bg-green-500">
											<CheckCircle class="h-3 w-3 mr-1" />
											Migrated
										</Badge>
									</div>

									{#if stat.v3Count > 0}
										<div class="flex gap-4 text-sm text-muted-foreground">
											<span>
												V3: <span class="font-semibold text-green-600"
													>{stat.v3Count?.toLocaleString()}</span
												> products
											</span>
										</div>

										<div class="flex items-center gap-2">
											<Progress.Root value={100} class="flex-1 h-2">
												<Progress.Indicator class="bg-green-500" />
											</Progress.Root>
											<span class="text-xs text-muted-foreground">100%</span>
										</div>
									{/if}
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Empty State -->
		{#if stats.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					<Database class="h-8 w-8 mx-auto mb-2 opacity-50" />
					<p>No domains found. Add domains first to check migration status.</p>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>

<!-- Results Modal -->
{#if showResultsModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={(e) => {
			if (e.target === e.currentTarget) showResultsModal = false;
		}}
		onkeydown={(e) => {
			if (e.key === 'Escape') showResultsModal = false;
		}}
		role="dialog"
		tabindex="-1"
	>
		<div class="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
			<div class="flex items-center justify-between p-4 border-b">
				<h2 class="font-semibold">Migration Results</h2>
				<Button variant="ghost" size="sm" onclick={() => (showResultsModal = false)}>
					<X class="h-4 w-4" />
				</Button>
			</div>

			<div class="flex-1 overflow-auto p-4">
				{#if migrationResult}
					<div class="mb-4 space-y-1 text-sm">
						<p><strong>Domain:</strong> {migrationResult.domain}</p>
						<p><strong>Version:</strong> {migrationResult.version}</p>
						<p><strong>Dry Run:</strong> {migrationResult.dryRun ? 'Yes' : 'No'}</p>
					</div>

					<div class="grid grid-cols-3 gap-4 mb-4">
						<Card.Root>
							<Card.Content class="p-3 text-center">
								<div class="text-xs text-muted-foreground uppercase">Migrated</div>
								<div class="text-xl font-bold text-green-600">
									{migrationResult.migrated}
								</div>
							</Card.Content>
						</Card.Root>
						<Card.Root>
							<Card.Content class="p-3 text-center">
								<div class="text-xs text-muted-foreground uppercase">Skipped</div>
								<div class="text-xl font-bold">{migrationResult.skipped}</div>
							</Card.Content>
						</Card.Root>
						<Card.Root>
							<Card.Content class="p-3 text-center">
								<div class="text-xs text-muted-foreground uppercase">Errors</div>
								<div class="text-xl font-bold text-destructive">
									{migrationResult.errors}
								</div>
							</Card.Content>
						</Card.Root>
					</div>

					{#if migrationResult.results?.length > 0}
						<h4 class="font-medium mb-2">Details</h4>
						<div class="max-h-[300px] overflow-auto border rounded">
							{#each migrationResult.results as result (result.pdpUrl)}
								<div
									class="flex items-center justify-between p-2 border-b last:border-b-0 text-xs"
								>
									<span class="font-mono break-all pr-2">{result.pdpUrl}</span>
									<Badge
										variant={result.status === 'migrated' ||
										result.status === 'would_migrate'
											? 'default'
											: result.status === 'error'
												? 'destructive'
												: 'secondary'}
										class={result.status === 'migrated' ||
										result.status === 'would_migrate'
											? 'bg-green-500'
											: ''}
									>
										{result.status}
									</Badge>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>

			<div class="flex justify-end p-4 border-t">
				<Button variant="secondary" onclick={() => (showResultsModal = false)}>Close</Button
				>
			</div>
		</div>
	</div>
{/if}
