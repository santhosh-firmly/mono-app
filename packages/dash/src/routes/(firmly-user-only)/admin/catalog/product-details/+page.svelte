<script>
	import { onMount } from 'svelte';
	import Database from 'lucide-svelte/icons/database';
	import Package from 'lucide-svelte/icons/package';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Percent from 'lucide-svelte/icons/percent';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Play from 'lucide-svelte/icons/play';
	import Search from 'lucide-svelte/icons/search';
	import Layers from 'lucide-svelte/icons/layers';
	import PackageCheck from 'lucide-svelte/icons/package-check';
	import PackageX from 'lucide-svelte/icons/package-x';
	import History from 'lucide-svelte/icons/history';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import productDetailsApi from '$lib/api/catalog/product-details-client.js';

	// State
	let stats = $state(null);
	let variantStats = $state(null);
	let loading = $state(true);
	let error = $state(null);

	// Filtering
	let searchQuery = $state('');
	let minSuccessPercent = $state(0);
	let workflowStatusFilter = $state('all');

	// Selection
	let selectedDomains = new SvelteSet();

	// Workflow state
	let triggering = $state(false);
	let workflowProgress = $state([]);

	// Active jobs being polled
	let activeJobs = new SvelteMap();
	let pollingInterval = null;

	// Last run dates (domain/countryCode -> date)
	let lastRunDates = new SvelteMap();
	let loadingMetadata = $state(false);

	// LocalStorage key for persisting running job IDs
	const RUNNING_JOBS_KEY = 'pd_running_jobs';

	// Status tooltip
	let openTooltip = $state(null);

	// Save running jobs to localStorage
	function saveRunningJobs() {
		const jobs = [];
		for (const [key, job] of activeJobs) {
			if (job.jobId && job.status !== 'complete' && job.status !== 'errored') {
				jobs.push({ key, jobId: job.jobId });
			}
		}
		if (jobs.length > 0) {
			localStorage.setItem(RUNNING_JOBS_KEY, JSON.stringify(jobs));
		} else {
			localStorage.removeItem(RUNNING_JOBS_KEY);
		}
	}

	// Load running jobs from localStorage and poll them
	async function loadRunningJobs() {
		try {
			const stored = localStorage.getItem(RUNNING_JOBS_KEY);
			if (!stored) return;

			const jobs = JSON.parse(stored);
			if (jobs.length === 0) return;

			for (const { key, jobId } of jobs) {
				try {
					const status = await productDetailsApi.workflows.getJobStatus(jobId);

					if (status.status === 'queued' || status.status === 'running') {
						activeJobs.set(key, status);

						const [domain, countryCode] = key.split('/');
						workflowProgress.push({
							domain,
							countryCode,
							status: status.status === 'queued' ? 'pending' : 'running',
							jobId
						});
					}
				} catch (e) {
					console.error(`Failed to get status for job ${jobId}:`, e);
				}
			}

			workflowProgress = [...workflowProgress];

			if (activeJobs.size > 0) {
				triggering = true;
				startPolling();
			}

			saveRunningJobs();
		} catch (e) {
			console.error('Failed to load running jobs:', e);
		}
	}

	// Load last run dates from metadata
	async function loadLastRunDates() {
		if (!stats?.domains || stats.domains.length === 0) return;

		loadingMetadata = true;
		const newLastRunDates = new SvelteMap(lastRunDates);

		const batchSize = 5;
		for (let i = 0; i < stats.domains.length; i += batchSize) {
			const batch = stats.domains.slice(i, i + batchSize);
			await Promise.all(
				batch.map(async (domain) => {
					const key = `${domain.domain}/${domain.countryCode}`;
					try {
						const metadata = await productDetailsApi.workflows.getMetadata(
							domain.domain,
							domain.countryCode
						);
						if (metadata.metadata?.lastUpdatedAt) {
							newLastRunDates.set(key, metadata.metadata.lastUpdatedAt);
						}
					} catch {
						// Domain has no metadata yet
					}
				})
			);
		}

		lastRunDates = newLastRunDates;
		loadingMetadata = false;
	}

	// Get workflow status for a domain
	function getWorkflowStatus(domain, countryCode) {
		const key = `${domain}/${countryCode}`;

		// Check active jobs first
		const activeJob = activeJobs.get(key);
		if (activeJob) {
			return {
				status:
					activeJob.status === 'queued'
						? 'pending'
						: activeJob.status === 'running'
							? 'running'
							: activeJob.status === 'complete'
								? 'complete'
								: 'failed',
				jobId: activeJob.jobId,
				error: activeJob.error ?? undefined,
				output: activeJob.output
			};
		}

		// Check workflow progress
		const progress = workflowProgress.find((p) => `${p.domain}/${p.countryCode}` === key);
		if (progress) {
			return {
				status: progress.status,
				jobId: progress.jobId,
				error: progress.error
			};
		}

		// Check if has run before
		const lastRun = lastRunDates.get(key);
		if (lastRun) {
			return { status: 'has_run', lastRunDate: lastRun };
		}

		return { status: 'idle' };
	}

	// Smart sorting: running -> recently run -> never run
	let sortedAndFilteredDomains = $derived.by(() => {
		if (!stats?.domains) return [];
		let domains = [...stats.domains];

		// Filter by workflow status
		if (workflowStatusFilter === 'running') {
			domains = domains.filter((d) => {
				const status = getWorkflowStatus(d.domain, d.countryCode);
				return status.status === 'pending' || status.status === 'running';
			});
		} else if (workflowStatusFilter === 'never_run') {
			domains = domains.filter((d) => {
				const status = getWorkflowStatus(d.domain, d.countryCode);
				return status.status === 'idle';
			});
		} else if (workflowStatusFilter === 'has_run') {
			domains = domains.filter((d) => {
				const status = getWorkflowStatus(d.domain, d.countryCode);
				return status.status === 'has_run' || status.status === 'complete';
			});
		}

		// Filter by success percentage
		if (minSuccessPercent > 0) {
			domains = domains.filter((d) => d.completion_percent >= minSuccessPercent);
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			domains = domains.filter(
				(d) =>
					d.domain.toLowerCase().includes(query) ||
					d.countryCode.toLowerCase().includes(query)
			);
		}

		// Sort: running first, then by last run date, then never run
		domains.sort((a, b) => {
			const aKey = `${a.domain}/${a.countryCode}`;
			const bKey = `${b.domain}/${b.countryCode}`;

			const aRunning = activeJobs.has(aKey);
			const bRunning = activeJobs.has(bKey);
			const aLastRun = lastRunDates.get(aKey);
			const bLastRun = lastRunDates.get(bKey);

			// Running jobs first
			if (aRunning && !bRunning) return -1;
			if (!aRunning && bRunning) return 1;

			// Then by last run date (most recent first)
			if (aLastRun && bLastRun) {
				return new Date(bLastRun).getTime() - new Date(aLastRun).getTime();
			}
			if (aLastRun && !bLastRun) return -1;
			if (!aLastRun && bLastRun) return 1;

			// Never run last (alphabetically)
			return a.domain.localeCompare(b.domain);
		});

		return domains;
	});

	// Selection stats
	let selectionStats = $derived.by(() => {
		const selected = sortedAndFilteredDomains.filter((d) =>
			selectedDomains.has(`${d.domain}/${d.countryCode}`)
		);
		return {
			count: selected.length,
			totalProducts: selected.reduce((sum, d) => sum + d.total, 0),
			pendingProducts: selected.reduce((sum, d) => sum + d.pending, 0)
		};
	});

	function toggleTooltip(key) {
		openTooltip = openTooltip === key ? null : key;
	}

	function closeTooltip() {
		openTooltip = null;
	}

	onMount(async () => {
		await loadData();
		await loadRunningJobs();
		return () => {
			if (pollingInterval) {
				clearInterval(pollingInterval);
			}
		};
	});

	async function loadData() {
		loading = true;
		error = null;
		try {
			const [statsData, variantData] = await Promise.all([
				productDetailsApi.crossDomainStats.getStats(),
				productDetailsApi.crossDomainStats.getVariantStats()
			]);
			stats = statsData;
			variantStats = variantData;
			// Load last run dates after stats
			loadLastRunDates();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load data';
		} finally {
			loading = false;
		}
	}

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
		for (const key of [...selectedDomains]) {
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

		// Initialize progress
		workflowProgress = domainsToTrigger.map((d) => ({
			domain: d.domain,
			countryCode: d.countryCode,
			status: 'pending'
		}));

		// Trigger sequentially
		for (let i = 0; i < domainsToTrigger.length; i++) {
			const { domain, countryCode } = domainsToTrigger[i];
			workflowProgress[i].status = 'running';
			workflowProgress = [...workflowProgress];

			try {
				const response = await productDetailsApi.workflows.trigger(domain, countryCode, {
					limit: 'ALL'
				});
				workflowProgress[i].jobId = response.jobId;
				workflowProgress[i].status = 'running';

				activeJobs.set(`${domain}/${countryCode}`, {
					jobId: response.jobId,
					status: 'running',
					output: null,
					error: null
				});
			} catch (e) {
				workflowProgress[i].status = 'failed';
				workflowProgress[i].error = e instanceof Error ? e.message : 'Unknown error';
			}
			workflowProgress = [...workflowProgress];
		}

		saveRunningJobs();

		if (activeJobs.size > 0) {
			startPolling();
		} else {
			triggering = false;
		}
	}

	function startPolling() {
		if (pollingInterval) return;

		pollingInterval = setInterval(async () => {
			const completedKeys = [];

			for (const [key, job] of activeJobs) {
				if (!job.jobId || job.status === 'complete' || job.status === 'errored') {
					completedKeys.push(key);
					continue;
				}

				try {
					const status = await productDetailsApi.workflows.getJobStatus(job.jobId);
					activeJobs.set(key, status);

					const progressItem = workflowProgress.find(
						(p) => `${p.domain}/${p.countryCode}` === key
					);
					if (progressItem) {
						if (status.status === 'complete') {
							progressItem.status = 'complete';
							completedKeys.push(key);
							// Update last run date
							if (status.output?.completedAt) {
								lastRunDates.set(key, status.output.completedAt);
							}
						} else if (status.status === 'errored') {
							progressItem.status = 'failed';
							progressItem.error = status.error || 'Job failed';
							completedKeys.push(key);
						}
						workflowProgress = [...workflowProgress];
					}
				} catch (e) {
					console.error(`Failed to poll job status for ${key}:`, e);
				}
			}

			completedKeys.forEach((key) => activeJobs.delete(key));

			saveRunningJobs();

			if (activeJobs.size === 0 && pollingInterval) {
				clearInterval(pollingInterval);
				pollingInterval = null;
				triggering = false;
				// Refresh data after all jobs complete
				loadData();
			}
		}, 3000);
	}

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}

	function formatDate(dateStr) {
		if (!dateStr) return 'Never';
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
			return 'Never';
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

	// Computed indeterminate state for select-all checkbox
	let isIndeterminate = $derived(
		sortedAndFilteredDomains.some((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`)) &&
			!sortedAndFilteredDomains.every((d) =>
				selectedDomains.has(`${d.domain}/${d.countryCode}`)
			)
	);

	// Action to set indeterminate state on checkbox
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
	<PageHeader
		title="Product Details Dashboard"
		description="Monitor and manage product details fetch workflows across all domains"
	/>

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
				Loading product details stats...
			</Card.Content>
		</Card.Root>
	{:else if stats}
		<!-- Aggregate Stats -->
		<section>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold">Overview</h2>
				<Button variant="outline" size="sm" onclick={loadData} disabled={loading}>
					<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
					{loading ? 'Refreshing...' : 'Refresh'}
				</Button>
			</div>

			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="flex items-center gap-3">
							<div class="p-2 rounded-lg bg-primary/10">
								<Database class="h-5 w-5 text-primary" />
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Domains</p>
								<p class="text-2xl font-bold">
									{formatNumber(stats.total_domains)}
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Content class="pt-6">
						<div class="flex items-center gap-3">
							<div class="p-2 rounded-lg bg-blue-500/10">
								<Package class="h-5 w-5 text-blue-500" />
							</div>
							<div>
								<p class="text-sm text-muted-foreground">Products</p>
								<p class="text-2xl font-bold">
									{formatNumber(stats.aggregate?.total_products)}
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
								<p class="text-sm text-muted-foreground">Success</p>
								<p class="text-2xl font-bold">
									{formatNumber(stats.aggregate?.success)}
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
								<p class="text-2xl font-bold">
									{formatNumber(stats.aggregate?.pending)}
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
								<p class="text-2xl font-bold">
									{formatNumber(stats.aggregate?.failed)}
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
								<p class="text-2xl font-bold">
									{stats.aggregate?.completion_percent ?? 0}%
								</p>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</section>

		<!-- Variant Stats -->
		{#if variantStats && variantStats.total_domains_with_variants > 0}
			<section>
				<h2 class="text-lg font-semibold mb-4">Variant Statistics</h2>
				<Card.Root>
					<Card.Content class="pt-6">
						<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-blue-500/10">
									<Layers class="h-5 w-5 text-blue-500" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Total Variants</p>
									<p class="text-xl font-bold">
										{formatNumber(variantStats.aggregate?.total_variants)}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-green-500/10">
									<PackageCheck class="h-5 w-5 text-green-500" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Available</p>
									<p class="text-xl font-bold">
										{formatNumber(variantStats.aggregate?.available_count)}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-red-500/10">
									<PackageX class="h-5 w-5 text-red-500" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Out of Stock</p>
									<p class="text-xl font-bold">
										{formatNumber(variantStats.aggregate?.out_of_stock_count)}
									</p>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="p-2 rounded-lg bg-purple-500/10">
									<History class="h-5 w-5 text-purple-500" />
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Price Records</p>
									<p class="text-xl font-bold">
										{formatNumber(
											variantStats.aggregate?.price_history_records
										)}
									</p>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</section>
		{/if}

		<!-- Domain List -->
		<section>
			<div class="flex items-center justify-between mb-4 flex-wrap gap-3">
				<h2 class="text-lg font-semibold">Domains ({stats.domains?.length ?? 0})</h2>
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
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground">Min %:</span>
						<Input
							type="number"
							min={0}
							max={100}
							bind:value={minSuccessPercent}
							class="w-20"
						/>
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

			{#if sortedAndFilteredDomains.length !== stats.domains?.length}
				<p class="text-sm text-muted-foreground mb-3">
					Showing {sortedAndFilteredDomains.length} of {stats.domains?.length ?? 0} domains
					{#if workflowStatusFilter !== 'all'}
						({workflowStatusFilter.replace('_', ' ')})
					{/if}
				</p>
			{/if}

			<!-- Selection Bar -->
			{#if selectedDomains.size > 0}
				<div
					class="flex items-center justify-between p-3 mb-4 bg-primary/5 border border-primary/20 rounded-lg flex-wrap gap-3"
				>
					<div class="flex items-center gap-4">
						<span class="font-semibold text-primary"
							>{selectionStats.count} domains selected</span
						>
						<span class="text-sm text-muted-foreground">
							({formatNumber(selectionStats.totalProducts)} products, {formatNumber(
								selectionStats.pendingProducts
							)} pending)
						</span>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="sm" onclick={deselectAll}
							>Clear Selection</Button
						>
						<Button size="sm" disabled={triggering} onclick={triggerWorkflows}>
							{#if triggering}
								<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
								Running...
							{:else}
								<Play class="h-4 w-4 mr-2" />
								Run Selected
							{/if}
						</Button>
					</div>
				</div>
			{/if}

			{#if sortedAndFilteredDomains.length === 0}
				<Card.Root>
					<Card.Content class="py-12 text-center text-muted-foreground">
						<h3 class="text-lg font-semibold text-foreground mb-2">No domains found</h3>
						<p>
							{#if searchQuery || workflowStatusFilter !== 'all'}
								No domains match your filters.
							{:else}
								No domains have been synced yet.
							{/if}
						</p>
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="border rounded-lg overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="w-10 p-3 text-center">
										<input
											type="checkbox"
											class="rounded"
											checked={sortedAndFilteredDomains.length > 0 &&
												sortedAndFilteredDomains.every((d) =>
													selectedDomains.has(
														`${d.domain}/${d.countryCode}`
													)
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
									<th class="p-3 text-left font-medium">Workflow Status</th>
									<th class="p-3 text-left font-medium">Progress</th>
									<th class="p-3 text-right font-medium">Total</th>
									<th class="p-3 text-right font-medium">Success</th>
									<th class="p-3 text-right font-medium">Pending</th>
									<th class="p-3 text-right font-medium">Failed</th>
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
											<a
												href="/admin/catalog/product-details/{domain.domain}/{domain.countryCode}"
												class="text-primary hover:underline font-medium"
											>
												{domain.domain}
												<span class="text-muted-foreground font-normal">
													/ {domain.countryCode}
												</span>
											</a>
										</td>
										<td class="p-3 relative">
											<button
												type="button"
												class="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium transition-transform hover:scale-105 {getStatusBadgeClass(
													workflowStatus.status
												)}"
												onclick={() => toggleTooltip(key)}
												onblur={() => setTimeout(closeTooltip, 200)}
											>
												<span
													class="w-2 h-2 rounded-full {getStatusDotClass(
														workflowStatus.status
													)}"
												></span>
												<span>
													{#if workflowStatus.status === 'idle'}
														{loadingMetadata
															? 'Loading...'
															: 'Never Run'}
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
											</button>

											{#if openTooltip === key && workflowStatus.status !== 'idle'}
												<div
													class="absolute top-full right-0 z-50 mt-2 min-w-[250px] max-w-[320px] bg-background border rounded-lg shadow-lg p-3"
												>
													<div
														class="flex items-center justify-between mb-2 pb-2 border-b font-semibold text-sm"
													>
														Workflow Details
													</div>
													<div class="text-sm space-y-1">
														{#if workflowStatus.jobId}
															<div class="flex justify-between">
																<span class="text-muted-foreground"
																	>Job ID:</span
																>
																<span
																	class="font-medium truncate ml-2"
																	>{workflowStatus.jobId}</span
																>
															</div>
														{/if}
														{#if workflowStatus.lastRunDate}
															<div class="flex justify-between">
																<span class="text-muted-foreground"
																	>Last Run:</span
																>
																<span class="font-medium"
																	>{formatDate(
																		workflowStatus.lastRunDate
																	)}</span
																>
															</div>
														{/if}
														{#if workflowStatus.output}
															<div class="flex justify-between">
																<span class="text-muted-foreground"
																	>Processed:</span
																>
																<span class="font-medium"
																	>{formatNumber(
																		workflowStatus.output
																			.processed
																	)}</span
																>
															</div>
															<div class="flex justify-between">
																<span class="text-muted-foreground"
																	>Success:</span
																>
																<span class="font-medium"
																	>{formatNumber(
																		workflowStatus.output
																			.success
																	)}</span
																>
															</div>
															<div class="flex justify-between">
																<span class="text-muted-foreground"
																	>Failed:</span
																>
																<span class="font-medium"
																	>{formatNumber(
																		workflowStatus.output.failed
																	)}</span
																>
															</div>
														{/if}
														{#if workflowStatus.error}
															<div
																class="mt-2 p-2 bg-red-100 rounded text-red-700 text-xs"
															>
																<strong>Error:</strong>
																{workflowStatus.error}
															</div>
														{/if}
														{#if workflowStatus.status === 'running' || workflowStatus.status === 'pending'}
															<div
																class="mt-2 text-blue-600 text-xs flex items-center gap-1"
															>
																<RefreshCw
																	class="h-3 w-3 animate-spin"
																/>
																Workflow in progress...
															</div>
														{/if}
													</div>
												</div>
											{/if}
										</td>
										<td class="p-3 min-w-[120px]">
											<div class="flex items-center gap-2">
												<Progress
													value={domain.completion_percent}
													class="w-20 h-2"
												/>
												<span class="text-muted-foreground"
													>{domain.completion_percent}%</span
												>
											</div>
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
										<td class="p-3 text-right tabular-nums text-red-600"
											>{formatNumber(
												domain.failed + domain.permanently_failed
											)}</td
										>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</section>

		<!-- Workflow Progress -->
		{#if workflowProgress.length > 0}
			<section>
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold">Workflow Progress</h2>
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
								class="flex items-center justify-between p-3 border-b last:border-b-0 {item.status ===
								'failed'
									? 'bg-red-50'
									: ''}"
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

		<!-- Domains with Errors -->
		{#if stats.domains_with_errors && stats.domains_with_errors.length > 0}
			<section>
				<h2 class="text-lg font-semibold mb-4">
					Domains with Errors ({stats.domains_with_errors.length})
				</h2>
				<div class="space-y-2">
					{#each stats.domains_with_errors as errorDomain (`${errorDomain.domain}/${errorDomain.countryCode}`)}
						<div class="p-3 bg-red-50 rounded-lg text-sm">
							<span class="font-semibold text-red-700"
								>{errorDomain.domain}/{errorDomain.countryCode}</span
							>
							<span class="text-red-600">: {errorDomain.error}</span>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
</div>
