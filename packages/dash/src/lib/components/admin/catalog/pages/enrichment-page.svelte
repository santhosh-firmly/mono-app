<script>
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import Layers from 'lucide-svelte/icons/layers';
	import Globe from 'lucide-svelte/icons/globe';
	import Zap from 'lucide-svelte/icons/zap';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Play from 'lucide-svelte/icons/play';
	import Search from 'lucide-svelte/icons/search';
	import TrendingUp from 'lucide-svelte/icons/trending-up';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';
	import { PageErrorAlert } from '../shared/index.js';

	// Props
	let {
		overview = null,
		jobs = [],
		categories = [],
		domains = [],
		loading = false,
		error = null,
		onRefresh = () => {},
		onTriggerWorkflows = async () => {},
		onDismissError = () => {},
		categoryLinkPrefix = '/admin/catalog/enrichment/category'
	} = $props();

	// Filter state
	let jobStatusFilter = $state('all');
	let searchQuery = $state('');
	let workflowStatusFilter = $state('all');

	// Selection state
	let selectedDomains = new SvelteSet();

	// Workflow state
	let triggering = $state(false);
	let workflowProgress = $state([]);

	// Active jobs being polled
	let activeJobs = new SvelteMap();

	// Last run dates from jobs
	let lastRunDates = new SvelteMap();

	// Extract last run dates from jobs
	$effect(() => {
		lastRunDates.clear();
		for (const job of jobs) {
			if (job.domain && job.status === 'completed' && job.completed_at) {
				const key = `${job.domain}/${job.countryCode || 'US'}`;
				const existing = lastRunDates.get(key);
				if (!existing || new Date(job.completed_at) > new Date(existing)) {
					lastRunDates.set(key, job.completed_at);
				}
			}
		}
	});

	// Get workflow status for a domain
	function getWorkflowStatus(domain, countryCode) {
		const key = `${domain}/${countryCode}`;

		const activeJob = activeJobs.get(key);
		if (activeJob) {
			return {
				status:
					activeJob.status === 'pending'
						? 'pending'
						: activeJob.status === 'running'
							? 'running'
							: activeJob.status === 'completed'
								? 'complete'
								: 'failed',
				jobId: activeJob.id,
				error: activeJob.error_message,
				progress: {
					processed: activeJob.processed_products,
					total: activeJob.total_products
				}
			};
		}

		const progress = workflowProgress.find((p) => `${p.domain}/${p.countryCode}` === key);
		if (progress) {
			return {
				status: progress.status,
				jobId: progress.jobId,
				error: progress.error
			};
		}

		const lastRun = lastRunDates.get(key);
		if (lastRun) {
			return { status: 'has_run', lastRunDate: lastRun };
		}

		return { status: 'idle' };
	}

	// Sorted and filtered domains
	let sortedAndFilteredDomains = $derived.by(() => {
		if (!domains) return [];
		let filtered = [...domains];

		if (workflowStatusFilter === 'running') {
			filtered = filtered.filter((d) => {
				const status = getWorkflowStatus(d.domain, d.countryCode);
				return status.status === 'pending' || status.status === 'running';
			});
		} else if (workflowStatusFilter === 'never_run') {
			filtered = filtered.filter((d) => {
				const status = getWorkflowStatus(d.domain, d.countryCode);
				return status.status === 'idle';
			});
		} else if (workflowStatusFilter === 'has_run') {
			filtered = filtered.filter((d) => {
				const status = getWorkflowStatus(d.domain, d.countryCode);
				return status.status === 'has_run' || status.status === 'complete';
			});
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			filtered = filtered.filter(
				(d) =>
					d.domain.toLowerCase().includes(query) ||
					d.countryCode.toLowerCase().includes(query)
			);
		}

		filtered.sort((a, b) => {
			const aKey = `${a.domain}/${a.countryCode}`;
			const bKey = `${b.domain}/${b.countryCode}`;

			const aRunning = activeJobs.has(aKey);
			const bRunning = activeJobs.has(bKey);

			if (aRunning && !bRunning) return -1;
			if (!aRunning && bRunning) return 1;

			return a.domain.localeCompare(b.domain);
		});

		return filtered;
	});

	// Selection stats
	let selectionStats = $derived.by(() => {
		const selected = sortedAndFilteredDomains.filter((d) =>
			selectedDomains.has(`${d.domain}/${d.countryCode}`)
		);
		return {
			count: selected.length,
			totalProducts: selected.reduce((sum, d) => sum + d.total, 0)
		};
	});

	// Filtered jobs
	let filteredJobs = $derived.by(() => {
		let result = [...jobs];
		if (jobStatusFilter !== 'all') {
			result = result.filter((j) => j.status === jobStatusFilter);
		}
		return result.slice(0, 10);
	});

	// Filtered categories
	let filteredCategories = $derived.by(() => {
		if (!searchQuery.trim()) return categories.slice(0, 12);
		const q = searchQuery.toLowerCase();
		return categories
			.filter(
				(c) =>
					c.name.toLowerCase().includes(q) ||
					c.aliases?.some((a) => a.toLowerCase().includes(q))
			)
			.slice(0, 12);
	});

	function toggleDomain(domain, countryCode) {
		const key = `${domain}/${countryCode}`;
		if (selectedDomains.has(key)) {
			selectedDomains.delete(key);
		} else {
			selectedDomains.add(key);
		}
	}

	function selectAll() {
		sortedAndFilteredDomains.forEach((d) =>
			selectedDomains.add(`${d.domain}/${d.countryCode}`)
		);
	}

	function deselectAll() {
		const filteredKeys = new Set(
			sortedAndFilteredDomains.map((d) => `${d.domain}/${d.countryCode}`)
		);
		for (const key of selectedDomains) {
			if (filteredKeys.has(key)) {
				selectedDomains.delete(key);
			}
		}
	}

	async function triggerWorkflows() {
		if (selectedDomains.size === 0) return;

		triggering = true;
		workflowProgress = [];

		const domainsToTrigger = Array.from(selectedDomains).map((key) => {
			const [domain, countryCode] = key.split('/');
			return { domain, countryCode };
		});

		workflowProgress = domainsToTrigger.map((d) => ({
			domain: d.domain,
			countryCode: d.countryCode,
			status: 'pending'
		}));

		try {
			await onTriggerWorkflows(domainsToTrigger, {
				onProgress: (index, status, jobId, error) => {
					workflowProgress[index].status = status;
					if (jobId) workflowProgress[index].jobId = jobId;
					if (error) workflowProgress[index].error = error;
					workflowProgress = [...workflowProgress];
				},
				onJobStarted: (key, job) => {
					activeJobs.set(key, job);
				}
			});
		} finally {
			triggering = false;
		}
	}

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}

	function formatDate(dateStr) {
		if (!dateStr) return '-';
		try {
			const date = new Date(dateStr);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();
			const diffMins = Math.floor(diffMs / 60000);
			const diffHours = Math.floor(diffMins / 60);
			const diffDays = Math.floor(diffHours / 24);

			if (diffMins < 1) return 'Just now';
			if (diffMins < 60) return `${diffMins}m ago`;
			if (diffHours < 24) return `${diffHours}h ago`;
			if (diffDays < 7) return `${diffDays}d ago`;
			return date.toLocaleDateString();
		} catch {
			return '-';
		}
	}

	function getStatusBadgeClass(status) {
		switch (status) {
			case 'idle':
				return 'bg-gray-100 text-gray-600';
			case 'pending':
			case 'running':
				return 'bg-blue-100 text-blue-700';
			case 'complete':
			case 'has_run':
				return 'bg-green-100 text-green-700';
			case 'failed':
				return 'bg-red-100 text-red-700';
			default:
				return 'bg-gray-100 text-gray-600';
		}
	}

	function getStatusDotClass(status) {
		switch (status) {
			case 'idle':
				return 'bg-gray-400';
			case 'pending':
			case 'running':
				return 'bg-blue-500 animate-pulse';
			case 'complete':
			case 'has_run':
				return 'bg-green-500';
			case 'failed':
				return 'bg-red-500';
			default:
				return 'bg-gray-400';
		}
	}

	let isIndeterminate = $derived(
		sortedAndFilteredDomains.some((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`)) &&
			!sortedAndFilteredDomains.every((d) =>
				selectedDomains.has(`${d.domain}/${d.countryCode}`)
			)
	);

	function setIndeterminate(node, value) {
		node.indeterminate = value;
		return {
			update(value) {
				node.indeterminate = value;
			}
		};
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader
			title="Enrichment"
			description="AI-powered product categorization and type normalization"
		/>
		<Button variant="outline" onclick={onRefresh} disabled={loading}>
			<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading enrichment data...
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Overview Stats -->
		<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-primary/10">
							<Layers class="h-5 w-5 text-primary" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Categories</p>
							<p class="text-xl font-bold">
								{formatNumber(overview?.summary?.totalCategories)}
							</p>
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
							<p class="text-sm text-muted-foreground">Mappings</p>
							<p class="text-xl font-bold">
								{formatNumber(overview?.summary?.totalMappings)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-blue-500/10">
							<Globe class="h-5 w-5 text-blue-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Domains</p>
							<p class="text-xl font-bold">
								{formatNumber(overview?.summary?.uniqueDomains)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-yellow-500/10">
							<Zap class="h-5 w-5 text-yellow-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Total Jobs</p>
							<p class="text-xl font-bold">
								{formatNumber(overview?.summary?.totalJobs)}
							</p>
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
							<p class="text-sm text-muted-foreground">Completed</p>
							<p class="text-xl font-bold">
								{formatNumber(overview?.summary?.completedJobs)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 rounded-lg bg-purple-500/10">
							<Clock class="h-5 w-5 text-purple-500" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Running</p>
							<p class="text-xl font-bold">
								{formatNumber(overview?.summary?.runningJobs)}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Enrichment Stats -->
		{#if overview?.enrichmentStats}
			{@const stats = overview.enrichmentStats}
			{@const totalHits = (stats.totalAliasHits ?? 0) + (stats.totalCacheHits ?? 0)}
			{@const totalCalls = totalHits + (stats.totalAiCalls ?? 0)}
			{@const hitRate = totalCalls > 0 ? ((totalHits / totalCalls) * 100).toFixed(1) : '0.0'}
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<TrendingUp class="h-5 w-5" />
						Enrichment Stats
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex gap-8 flex-wrap">
						<div class="text-center">
							<p class="text-2xl font-bold">{formatNumber(stats.totalAliasHits)}</p>
							<p class="text-xs text-muted-foreground">Alias Hits</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold">{formatNumber(stats.totalCacheHits)}</p>
							<p class="text-xs text-muted-foreground">Cache Hits</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold">{formatNumber(stats.totalAiCalls)}</p>
							<p class="text-xs text-muted-foreground">AI Calls</p>
						</div>
						<div class="text-center">
							<p class="text-2xl font-bold text-green-600">{hitRate}%</p>
							<p class="text-xs text-muted-foreground">Hit Rate</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Domains Section -->
		<section>
			<div class="flex items-center justify-between mb-4 flex-wrap gap-3">
				<h2 class="text-lg font-semibold">Domains ({domains.length})</h2>
				<div class="flex items-center gap-3 flex-wrap">
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">Status:</span>
						<select
							bind:value={workflowStatusFilter}
							class="px-3 py-2 text-sm border rounded-md bg-background"
						>
							<option value="all">All Domains</option>
							<option value="running">Running</option>
							<option value="has_run">Has Run</option>
							<option value="never_run">Never Run</option>
						</select>
					</div>
					<div class="relative">
						<Search
							class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
						/>
						<Input
							type="text"
							placeholder="Search domains..."
							bind:value={searchQuery}
							class="pl-9 w-52"
						/>
					</div>
				</div>
			</div>

			{#if selectedDomains.size > 0}
				<div
					class="flex items-center justify-between p-3 mb-4 bg-primary/5 border border-primary/20 rounded-lg flex-wrap gap-3"
				>
					<div class="flex items-center gap-4">
						<span class="font-semibold text-primary"
							>{selectionStats.count} domains selected</span
						>
						<span class="text-sm text-muted-foreground">
							({formatNumber(selectionStats.totalProducts)} products)
						</span>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="sm" onclick={deselectAll}
							>Clear Selection</Button
						>
						<Button size="sm" disabled={triggering} onclick={triggerWorkflows}>
							{#if triggering}
								<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
							{:else}
								<Play class="h-4 w-4 mr-2" />
							{/if}
							Enrich Selected
						</Button>
					</div>
				</div>
			{/if}

			{#if sortedAndFilteredDomains.length === 0}
				<Card.Root>
					<Card.Content class="py-8 text-center text-muted-foreground">
						No domains found. Sync products from the catalog first.
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="border rounded-lg overflow-hidden">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="w-10 p-3 text-center">
									<input
										type="checkbox"
										class="rounded"
										checked={sortedAndFilteredDomains.length > 0 &&
											sortedAndFilteredDomains.every((d) =>
												selectedDomains.has(`${d.domain}/${d.countryCode}`)
											)}
										use:setIndeterminate={isIndeterminate}
										onchange={() => {
											const allSelected = sortedAndFilteredDomains.every(
												(d) =>
													selectedDomains.has(
														`${d.domain}/${d.countryCode}`
													)
											);
											if (allSelected) {
												deselectAll();
											} else {
												selectAll();
											}
										}}
									/>
								</th>
								<th class="p-3 text-left font-medium">Domain</th>
								<th class="p-3 text-left font-medium">Enrichment Status</th>
								<th class="p-3 text-right font-medium">Total</th>
								<th class="p-3 text-right font-medium">Success</th>
								<th class="p-3 text-right font-medium">Pending</th>
							</tr>
						</thead>
						<tbody>
							{#each sortedAndFilteredDomains as domain (`${domain.domain}/${domain.countryCode}`)}
								{@const key = `${domain.domain}/${domain.countryCode}`}
								{@const isSelected = selectedDomains.has(key)}
								{@const workflowStatus = getWorkflowStatus(
									domain.domain,
									domain.countryCode
								)}
								<tr
									class="border-b hover:bg-muted/30 transition-colors {isSelected
										? 'bg-primary/5'
										: ''}"
								>
									<td class="p-3 text-center">
										<input
											type="checkbox"
											class="rounded"
											checked={isSelected}
											onchange={() =>
												toggleDomain(domain.domain, domain.countryCode)}
										/>
									</td>
									<td class="p-3">
										<span class="font-medium">{domain.domain}</span>
										<span class="text-muted-foreground">
											/ {domain.countryCode}</span
										>
									</td>
									<td class="p-3">
										<span
											class="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium {getStatusBadgeClass(
												workflowStatus.status
											)}"
										>
											<span
												class="w-2 h-2 rounded-full {getStatusDotClass(
													workflowStatus.status
												)}"
											></span>
											{#if workflowStatus.status === 'idle'}
												Never Run
											{:else if workflowStatus.status === 'pending'}
												Queued
											{:else if workflowStatus.status === 'running'}
												Running
											{:else if workflowStatus.status === 'complete'}
												Complete
											{:else if workflowStatus.status === 'has_run'}
												{formatDate(workflowStatus.lastRunDate)}
											{:else if workflowStatus.status === 'failed'}
												Failed
											{:else}
												Unknown
											{/if}
										</span>
									</td>
									<td class="p-3 text-right tabular-nums"
										>{formatNumber(domain.total)}</td
									>
									<td class="p-3 text-right tabular-nums text-green-600"
										>{formatNumber(domain.success)}</td
									>
									<td class="p-3 text-right tabular-nums text-yellow-600"
										>{formatNumber(domain.pending)}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</section>

		<!-- Workflow Progress -->
		{#if workflowProgress.length > 0}
			<section>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Enrichment Progress</h2>
					{#if !triggering}
						<Button variant="ghost" size="sm" onclick={() => (workflowProgress = [])}>
							Clear
						</Button>
					{/if}
				</div>
				<Card.Root>
					<Card.Content class="p-0">
						{#each workflowProgress as item (`${item.domain}/${item.countryCode}`)}
							<div
								class="flex items-center justify-between p-3 border-b last:border-b-0"
							>
								<span class="font-medium">{item.domain}/{item.countryCode}</span>
								<div class="flex items-center gap-2">
									{#if item.error}
										<span class="text-red-600 text-sm">{item.error}</span>
									{/if}
									<Badge
										variant={item.status === 'complete'
											? 'default'
											: item.status === 'failed'
												? 'destructive'
												: 'secondary'}
									>
										{item.status}
									</Badge>
									{#if item.status === 'running' || item.status === 'pending'}
										<RefreshCw
											class="h-4 w-4 animate-spin text-muted-foreground"
										/>
									{/if}
								</div>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			</section>
		{/if}

		<!-- Categories Section -->
		{#if categories.length > 0}
			<section>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Categories ({categories.length})</h2>
				</div>
				<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
					{#each filteredCategories as category (category.name)}
						<a
							href="{categoryLinkPrefix}/{encodeURIComponent(category.name)}"
							class="block p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all"
						>
							<p class="font-semibold">{category.name}</p>
							<p class="text-sm text-muted-foreground">
								{formatNumber(category.product_count)} products
							</p>
							{#if category.aliases?.length > 0}
								<p
									class="text-xs text-muted-foreground mt-2 truncate"
									title={category.aliases.join(', ')}
								>
									Aliases: {category.aliases.slice(0, 3).join(', ')}{category
										.aliases.length > 3
										? '...'
										: ''}
								</p>
							{/if}
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Recent Jobs -->
		{#if jobs.length > 0}
			<section>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Recent Jobs</h2>
					<select
						bind:value={jobStatusFilter}
						class="px-3 py-2 text-sm border rounded-md bg-background"
					>
						<option value="all">All Jobs</option>
						<option value="running">Running</option>
						<option value="completed">Completed</option>
						<option value="failed">Failed</option>
					</select>
				</div>
				<div class="border rounded-lg overflow-hidden">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="p-3 text-left font-medium">Domain</th>
								<th class="p-3 text-left font-medium">Status</th>
								<th class="p-3 text-left font-medium">Progress</th>
								<th class="p-3 text-left font-medium">Started</th>
							</tr>
						</thead>
						<tbody>
							{#each filteredJobs as job (job.id)}
								<tr class="border-b hover:bg-muted/30 transition-colors">
									<td class="p-3 font-medium">{job.domain || 'All Domains'}</td>
									<td class="p-3">
										<Badge
											variant={job.status === 'completed'
												? 'default'
												: job.status === 'failed'
													? 'destructive'
													: 'secondary'}
										>
											{job.status}
										</Badge>
									</td>
									<td class="p-3">
										<div class="flex items-center gap-2 min-w-[120px]">
											<Progress
												value={((job.processed_products || 0) /
													(job.total_products || 1)) *
													100}
												class="w-16 h-2"
											/>
											<span class="text-xs text-muted-foreground">
												{job.processed_products}/{job.total_products}
											</span>
										</div>
									</td>
									<td class="p-3 text-muted-foreground"
										>{formatDate(job.started_at)}</td
									>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</section>
		{/if}
	{/if}
</div>
