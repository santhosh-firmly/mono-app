<script>
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Search from 'lucide-svelte/icons/search';
	import Upload from 'lucide-svelte/icons/upload';
	import Database from 'lucide-svelte/icons/database';
	import CheckCircle from 'lucide-svelte/icons/check-circle';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { PageErrorAlert } from '../shared/index.js';

	// Props
	let {
		stats = null,
		domains = [],
		exportVersions = new Map(),
		selectedDomains = new Set(),
		publishProgress = [],
		activeJobs = new Map(),
		loading = false,
		loadingExports = false,
		publishing = false,
		error = null,
		// Options
		publishTarget = 'elasticsearch',
		gcsEnvironment = 'wizard',
		publishStatusFilter = 'has_export',
		searchQuery = '',
		// Handlers
		onRefresh = () => {},
		onPublish = () => {},
		onToggleDomain = () => {},
		onToggleSelectAll = () => {},
		onClearSelection = () => {},
		onClearCompletedJobs = () => {},
		onPublishTargetChange = () => {},
		onGcsEnvironmentChange = () => {},
		onPublishStatusFilterChange = () => {},
		onSearchQueryChange = () => {},
		onDismissError = () => {}
	} = $props();

	// Derived values
	let allDomains = $derived(stats?.domains || domains);

	let sortedAndFilteredDomains = $derived.by(() => {
		let result = [...allDomains];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter((d) => d.domain.toLowerCase().includes(query));
		}

		// Filter by publish status
		if (publishStatusFilter !== 'all') {
			result = result.filter((d) => {
				const key = `${d.domain}/${d.countryCode}`;
				const isRunning = activeJobs.has(key);
				const hasExport = exportVersions.has(key);

				switch (publishStatusFilter) {
					case 'running':
						return isRunning;
					case 'has_export':
						return hasExport;
					case 'no_export':
						return !hasExport;
					default:
						return true;
				}
			});
		}

		// Smart sort: Running -> Has export -> No export
		result.sort((a, b) => {
			const aKey = `${a.domain}/${a.countryCode}`;
			const bKey = `${b.domain}/${b.countryCode}`;

			const aRunning = activeJobs.has(aKey);
			const bRunning = activeJobs.has(bKey);
			const aHasExport = exportVersions.has(aKey);
			const bHasExport = exportVersions.has(bKey);

			if (aRunning && !bRunning) return -1;
			if (!aRunning && bRunning) return 1;
			if (aHasExport && !bHasExport) return -1;
			if (!aHasExport && bHasExport) return 1;

			return a.domain.localeCompare(b.domain);
		});

		return result;
	});

	let selectedCount = $derived(selectedDomains.size);

	let selectedStats = $derived.by(() => {
		let totalProducts = 0;
		let withExport = 0;
		for (const key of selectedDomains) {
			const [domain, countryCode] = key.split('/');
			const domainData = allDomains.find(
				(d) => d.domain === domain && d.countryCode === countryCode
			);
			if (domainData) {
				totalProducts += domainData.total;
			}
			if (exportVersions.has(key)) {
				withExport++;
			}
		}
		return { totalProducts, withExport };
	});

	let allVisibleSelected = $derived(
		sortedAndFilteredDomains.length > 0 &&
			sortedAndFilteredDomains.every((d) =>
				selectedDomains.has(`${d.domain}/${d.countryCode}`)
			)
	);

	let isIndeterminate = $derived(
		sortedAndFilteredDomains.some((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`)) &&
			!sortedAndFilteredDomains.every((d) =>
				selectedDomains.has(`${d.domain}/${d.countryCode}`)
			)
	);

	let runningCount = $derived(
		Array.from(activeJobs.values()).filter((j) => j.status === 'running').length
	);

	let completedCount = $derived(
		publishProgress.filter((p) => p.status === 'complete' || p.status === 'failed').length
	);

	let domainsWithExport = $derived(
		allDomains.filter((d) => exportVersions.has(`${d.domain}/${d.countryCode}`)).length
	);

	// Helper functions
	function setIndeterminate(node, value) {
		node.indeterminate = value;
		return {
			update(value) {
				node.indeterminate = value;
			}
		};
	}

	function getPublishStatus(domain, countryCode) {
		const key = `${domain}/${countryCode}`;
		if (activeJobs.has(key)) return 'running';
		if (!exportVersions.has(key)) return 'no_export';
		return 'ready';
	}

	function formatDate(dateStr) {
		if (!dateStr) return '-';
		const date = new Date(dateStr);
		if (isNaN(date.getTime())) return '-';
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		return date.toLocaleDateString();
	}

	function getBadgeVariant(status) {
		switch (status) {
			case 'complete':
				return 'default';
			case 'running':
				return 'secondary';
			case 'pending':
				return 'outline';
			case 'failed':
				return 'destructive';
			default:
				return 'outline';
		}
	}

	function handleSearchInput(e) {
		onSearchQueryChange(e.target.value);
	}

	function handlePublishTargetChange(e) {
		onPublishTargetChange(e.target.value);
	}

	function handleGcsEnvironmentChange(e) {
		onGcsEnvironmentChange(e.target.value);
	}

	function handlePublishStatusFilterChange(e) {
		onPublishStatusFilterChange(e.target.value);
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader
			title="Publish"
			description="Publish exported product data to Elasticsearch or Google Cloud Storage"
		/>
		<Button variant="outline" onclick={onRefresh} disabled={loading}>
			<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	<!-- Stats Overview -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<Card.Root>
			<Card.Content class="pt-6">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-primary/10 rounded-lg">
						<Database class="h-5 w-5 text-primary" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Total Domains</p>
						<p class="text-2xl font-bold">
							{loading ? '...' : allDomains.length}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="pt-6">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-green-500/10 rounded-lg">
						<CheckCircle class="h-5 w-5 text-green-600" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">With Exports</p>
						<p class="text-2xl font-bold">
							{loading || loadingExports ? '...' : domainsWithExport}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Content class="pt-6">
				<div class="flex items-center gap-3">
					<div class="p-2 bg-blue-500/10 rounded-lg">
						<Upload class="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Publishing</p>
						<p class="text-2xl font-bold">
							{loading ? '...' : runningCount}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Publish Options -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-lg">Publish Options</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="flex gap-4 flex-wrap">
				<div class="flex flex-col gap-1">
					<span class="text-xs font-medium text-muted-foreground uppercase">Target</span>
					<select
						value={publishTarget}
						onchange={handlePublishTargetChange}
						class="px-3 py-2 text-sm border rounded-md bg-background min-w-[160px]"
					>
						<option value="elasticsearch">Elasticsearch</option>
						<option value="gcs">Google Cloud Storage</option>
						<option value="both">Both</option>
					</select>
				</div>
				{#if publishTarget === 'gcs' || publishTarget === 'both'}
					<div class="flex flex-col gap-1">
						<span class="text-xs font-medium text-muted-foreground uppercase"
							>GCS Environment</span
						>
						<select
							value={gcsEnvironment}
							onchange={handleGcsEnvironmentChange}
							class="px-3 py-2 text-sm border rounded-md bg-background min-w-[160px]"
						>
							<option value="wizard">Wizard (Dev)</option>
							<option value="production">Production</option>
						</select>
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Publish Progress -->
	{#if publishProgress.length > 0}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold">
					Publish Progress
					{#if runningCount > 0}
						<span class="font-normal text-muted-foreground"
							>({runningCount} running)</span
						>
					{/if}
				</h2>
				{#if completedCount > 0}
					<Button variant="outline" size="sm" onclick={onClearCompletedJobs}>
						Clear Completed ({completedCount})
					</Button>
				{/if}
			</div>
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
						{#each publishProgress as item (`${item.domain}/${item.countryCode}`)}
							<div
								class="flex items-center justify-between p-3 border rounded-md bg-background"
							>
								<span class="font-medium text-sm"
									>{item.domain}/{item.countryCode}</span
								>
								<div class="flex items-center gap-2">
									<Badge variant={getBadgeVariant(item.status)}>
										{item.status === 'pending'
											? 'Queued'
											: item.status === 'running'
												? 'Publishing...'
												: item.status === 'complete'
													? 'Complete'
													: 'Failed'}
									</Badge>
									{#if item.status === 'running'}
										<RefreshCw
											class="h-4 w-4 animate-spin text-muted-foreground"
										/>
									{/if}
								</div>
							</div>
							{#if item.error}
								<div class="col-span-full text-destructive text-xs px-3">
									Error: {item.error}
								</div>
							{/if}
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Domain Selection -->
	<div class="space-y-4">
		<div class="flex items-center justify-between flex-wrap gap-4">
			<h2 class="text-lg font-semibold">Select Domains to Publish</h2>
			<div class="flex items-center gap-3 flex-wrap">
				<div class="relative min-w-[200px]">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<Input
						placeholder="Search domains..."
						value={searchQuery}
						oninput={handleSearchInput}
						class="pl-9"
					/>
				</div>
				<select
					value={publishStatusFilter}
					onchange={handlePublishStatusFilterChange}
					class="px-3 py-2 text-sm border rounded-md bg-background"
				>
					<option value="all">All Domains ({allDomains.length})</option>
					<option value="running">Publishing ({runningCount})</option>
					<option value="has_export">
						Has Export {loadingExports ? '(loading...)' : `(${domainsWithExport})`}
					</option>
					<option value="no_export">
						No Export {loadingExports
							? '(loading...)'
							: `(${allDomains.length - domainsWithExport})`}
					</option>
				</select>
			</div>
		</div>

		<!-- Selection bar -->
		{#if selectedCount > 0}
			<div
				class="flex items-center justify-between flex-wrap gap-3 px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg"
			>
				<div class="flex items-center gap-4 text-sm">
					<span class="font-semibold text-primary"
						>{selectedCount} domain{selectedCount !== 1 ? 's' : ''} selected</span
					>
					<span class="text-muted-foreground"
						>({selectedStats.withExport} with exports)</span
					>
				</div>
				<div class="flex items-center gap-2">
					<Button variant="ghost" size="sm" onclick={onClearSelection}>Clear</Button>
					<Button
						size="sm"
						onclick={onPublish}
						disabled={publishing || selectedStats.withExport === 0}
					>
						{#if publishing}
							<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
						{:else}
							<Upload class="h-4 w-4 mr-2" />
						{/if}
						Publish to {publishTarget === 'both'
							? 'ES & GCS'
							: publishTarget === 'elasticsearch'
								? 'Elasticsearch'
								: 'GCS'}
					</Button>
				</div>
			</div>
		{/if}

		<!-- Results info -->
		<p class="text-sm text-muted-foreground">
			{#if publishStatusFilter === 'has_export'}
				Showing {sortedAndFilteredDomains.length} domains with exports available ({allDomains.length}
				total)
			{:else if publishStatusFilter === 'running'}
				Showing {sortedAndFilteredDomains.length} publishing domains ({domainsWithExport} with
				exports out of {allDomains.length} total)
			{:else if publishStatusFilter === 'no_export'}
				Showing {sortedAndFilteredDomains.length} domains without exports ({allDomains.length}
				total)
			{:else}
				Showing {sortedAndFilteredDomains.length} of {allDomains.length} total domains
			{/if}
			{#if loadingExports}
				<span class="ml-2 text-primary inline-flex items-center gap-1">
					<RefreshCw class="h-3 w-3 animate-spin" />
					Loading export info...
				</span>
			{/if}
		</p>

		{#if loading}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
					Loading domains...
				</Card.Content>
			</Card.Root>
		{:else if sortedAndFilteredDomains.length === 0}
			<Card.Root>
				<Card.Content class="py-12 text-center text-muted-foreground">
					<p>No domains found</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root class="overflow-hidden">
				<div class="overflow-x-auto">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="p-3 w-10 text-center">
									<input
										type="checkbox"
										class="w-4 h-4 cursor-pointer"
										checked={sortedAndFilteredDomains.length > 0 &&
											sortedAndFilteredDomains.every((d) =>
												selectedDomains.has(`${d.domain}/${d.countryCode}`)
											)}
										use:setIndeterminate={isIndeterminate}
										onchange={onToggleSelectAll}
									/>
								</th>
								<th class="p-3 text-left font-semibold text-muted-foreground"
									>Domain</th
								>
								<th class="p-3 text-left font-semibold text-muted-foreground w-32"
									>Status</th
								>
								<th class="p-3 text-left font-semibold text-muted-foreground"
									>Export Version</th
								>
								<th class="p-3 text-left font-semibold text-muted-foreground"
									>Export Date</th
								>
								<th class="p-3 text-right font-semibold text-muted-foreground"
									>Products</th
								>
							</tr>
						</thead>
						<tbody>
							{#each sortedAndFilteredDomains as domain (`${domain.domain}/${domain.countryCode}`)}
								{@const key = `${domain.domain}/${domain.countryCode}`}
								{@const status = getPublishStatus(
									domain.domain,
									domain.countryCode
								)}
								{@const exportInfo = exportVersions.get(key)}
								{@const hasExport = !!exportInfo}
								<tr
									class="border-b hover:bg-muted/30 transition-colors {selectedDomains.has(
										key
									)
										? 'bg-primary/5'
										: ''}"
								>
									<td class="p-3 text-center">
										<input
											type="checkbox"
											class="w-4 h-4 {hasExport
												? 'cursor-pointer'
												: 'cursor-not-allowed opacity-50'}"
											checked={selectedDomains.has(key)}
											disabled={!hasExport}
											onchange={() =>
												onToggleDomain(domain.domain, domain.countryCode)}
										/>
									</td>
									<td class="p-3 font-medium">{domain.domain}</td>
									<td class="p-3">
										<div class="flex items-center gap-2">
											<span
												class="w-2 h-2 rounded-full {status === 'running'
													? 'bg-blue-500 animate-pulse'
													: status === 'complete'
														? 'bg-green-500'
														: status === 'ready'
															? 'bg-yellow-500'
															: 'bg-gray-300'}"
											></span>
											<span class="text-xs text-muted-foreground">
												{#if status === 'running'}
													Publishing
												{:else if status === 'complete'}
													Published
												{:else if status === 'ready'}
													Ready
												{:else}
													No Export
												{/if}
											</span>
										</div>
									</td>
									<td class="p-3 text-xs text-muted-foreground">
										{#if exportInfo}
											{exportInfo.versionId.substring(0, 8)}...
										{:else}
											-
										{/if}
									</td>
									<td class="p-3 text-xs text-muted-foreground">
										{#if exportInfo}
											{formatDate(exportInfo.date)}
										{:else}
											-
										{/if}
									</td>
									<td
										class="p-3 text-right text-xs text-muted-foreground tabular-nums"
									>
										{#if exportInfo}
											{exportInfo.products.toLocaleString()}
										{:else}
											-
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Card.Root>
		{/if}
	</div>
</div>
