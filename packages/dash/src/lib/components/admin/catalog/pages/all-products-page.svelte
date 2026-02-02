<script>
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';
	import Database from 'lucide-svelte/icons/database';
	import Package from 'lucide-svelte/icons/package';
	import Clock from 'lucide-svelte/icons/clock';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Plus from 'lucide-svelte/icons/plus';
	import Play from 'lucide-svelte/icons/play';
	import Search from 'lucide-svelte/icons/search';
	import X from 'lucide-svelte/icons/x';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import {
		StatsGrid,
		SelectionBar,
		WorkflowStatusBadge,
		PageErrorAlert
	} from '../shared/index.js';

	let {
		pdStats = null,
		activeJobs = new SvelteMap(),
		loading = false,
		error = null,
		onRefresh = () => {},
		onAddDomain = async () => {},
		onTriggerJobs = async () => {},
		onClearCompletedJobs = () => {},
		onDismissError = () => {}
	} = $props();

	// Local state
	let selectedDomains = new SvelteSet();
	let searchQuery = $state('');
	let jobStatusFilter = $state('all');
	let newDomain = $state('');
	let addingDomain = $state(false);
	let forceRefresh = $state(false);
	let triggeringJobs = $state(false);

	// Derived stats
	let totalDomains = $derived(pdStats?.total_domains || 0);
	let totalProducts = $derived(pdStats?.aggregate?.total_products || 0);

	// Count running and completed jobs
	let runningCount = $derived(
		Array.from(activeJobs.values()).filter((j) => j.status === 'running').length
	);
	let completedCount = $derived(
		Array.from(activeJobs.values()).filter((j) => j.status !== 'running').length
	);

	// All domains from stats
	let allDomains = $derived.by(() => {
		const domainsFromStats = pdStats?.domains || [];
		const existingKeys = new Set(domainsFromStats.map((d) => `${d.domain}/${d.countryCode}`));

		// Add domains from active jobs that aren't in the stats yet
		const jobDomains = [];
		for (const job of activeJobs.values()) {
			const key = `${job.domain}/${job.countryCode}`;
			if (!existingKeys.has(key)) {
				jobDomains.push({
					domain: job.domain,
					countryCode: job.countryCode,
					total: 0,
					pending: 0,
					success: 0,
					failed: 0,
					permanently_failed: 0,
					completion_percent: 0
				});
			}
		}

		return [...domainsFromStats, ...jobDomains];
	});

	// Smart sorting and filtering
	let sortedAndFilteredDomains = $derived.by(() => {
		let domains = [...allDomains];

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			domains = domains.filter((d) => d.domain.toLowerCase().includes(query));
		}

		// Filter by job status
		if (jobStatusFilter !== 'all') {
			domains = domains.filter((d) => {
				const key = `${d.domain}/${d.countryCode}`;
				const isRunning = activeJobs.has(key) && activeJobs.get(key)?.status === 'running';
				const hasRun = activeJobs.has(key);

				switch (jobStatusFilter) {
					case 'running':
						return isRunning;
					case 'never_run':
						return !hasRun;
					case 'has_run':
						return hasRun;
					default:
						return true;
				}
			});
		}

		// Smart sort: Running -> Recently completed -> Never run
		domains.sort((a, b) => {
			const aKey = `${a.domain}/${a.countryCode}`;
			const bKey = `${b.domain}/${b.countryCode}`;
			const aJob = activeJobs.get(aKey);
			const bJob = activeJobs.get(bKey);
			const aRunning = aJob?.status === 'running';
			const bRunning = bJob?.status === 'running';

			if (aRunning && !bRunning) return -1;
			if (!aRunning && bRunning) return 1;

			if (aJob?.startedAt && bJob?.startedAt) {
				return new Date(bJob.startedAt).getTime() - new Date(aJob.startedAt).getTime();
			}
			if (aJob?.startedAt && !bJob?.startedAt) return -1;
			if (!aJob?.startedAt && bJob?.startedAt) return 1;

			return a.domain.localeCompare(b.domain);
		});

		return domains;
	});

	// Selection stats
	let selectedCount = $derived(selectedDomains.size);

	// Check if all visible domains are selected
	let allVisibleSelected = $derived(
		sortedAndFilteredDomains.length > 0 &&
			sortedAndFilteredDomains.every((d) =>
				selectedDomains.has(`${d.domain}/${d.countryCode}`)
			)
	);

	// Stats for grid
	let overviewStats = $derived([
		{
			icon: Database,
			label: 'Domains',
			value: formatNumber(totalDomains),
			variant: 'default'
		},
		{
			icon: Package,
			label: 'Products',
			value: formatNumber(totalProducts),
			variant: 'blue'
		},
		{
			icon: Clock,
			label: 'Running',
			value: runningCount.toString(),
			variant: 'yellow'
		},
		{
			icon: CheckCircle,
			label: 'Completed',
			value: completedCount.toString(),
			variant: 'green'
		}
	]);

	function toggleSelectAll() {
		if (allVisibleSelected) {
			for (const d of sortedAndFilteredDomains) {
				selectedDomains.delete(`${d.domain}/${d.countryCode}`);
			}
		} else {
			for (const d of sortedAndFilteredDomains) {
				selectedDomains.add(`${d.domain}/${d.countryCode}`);
			}
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

	async function handleTriggerJobs() {
		if (selectedDomains.size === 0) return;
		triggeringJobs = true;

		try {
			await onTriggerJobs(Array.from(selectedDomains), forceRefresh);
			selectedDomains.clear();
		} finally {
			triggeringJobs = false;
		}
	}

	async function handleAddDomain() {
		if (!newDomain.trim()) return;
		addingDomain = true;

		try {
			await onAddDomain(newDomain.trim(), forceRefresh);
			newDomain = '';
		} finally {
			addingDomain = false;
		}
	}

	function getDomainStatus(domain) {
		const key = `${domain.domain}/${domain.countryCode}`;
		const job = activeJobs.get(key);
		if (job) {
			return job.status === 'running' ? 'running' : job.status;
		}
		return 'idle';
	}

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}

	function getStatusBadgeVariant(status) {
		switch (status) {
			case 'running':
				return 'secondary';
			case 'complete':
				return 'default';
			case 'errored':
				return 'destructive';
			default:
				return 'outline';
		}
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<PageHeader
		title="All Products"
		description="Trigger and track getAllProducts workflows across domains"
	/>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	<!-- Stats Overview -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">Overview</h2>
			<Button variant="outline" size="sm" onclick={onRefresh} disabled={loading}>
				<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
				Refresh
			</Button>
		</div>

		<StatsGrid stats={overviewStats} columns={4} {loading} />
	</section>

	<!-- Quick Add Domain -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Add New Domain</Card.Title>
			<Card.Description
				>Start getAllProducts workflow to fetch all products for a domain</Card.Description
			>
		</Card.Header>
		<Card.Content>
			<form
				class="flex gap-3"
				onsubmit={(e) => {
					e.preventDefault();
					handleAddDomain();
				}}
			>
				<Input
					type="text"
					placeholder="Enter domain (e.g., example.com)"
					bind:value={newDomain}
					disabled={addingDomain}
					class="flex-1"
				/>
				<Button type="submit" disabled={addingDomain || !newDomain.trim()}>
					<Plus class="h-4 w-4 mr-2" />
					{addingDomain ? 'Starting...' : 'Start Workflow'}
				</Button>
			</form>
			<label class="flex items-center gap-2 mt-3 text-sm cursor-pointer">
				<input
					type="checkbox"
					bind:checked={forceRefresh}
					class="rounded border-gray-300 text-primary focus:ring-primary"
				/>
				<span>Force refresh</span>
				<span class="text-muted-foreground text-xs">(ignore freshness threshold)</span>
			</label>
		</Card.Content>
	</Card.Root>

	<!-- Running Jobs -->
	{#if activeJobs.size > 0}
		<section>
			<div class="flex items-center justify-between mb-4">
				<h2 class="text-lg font-semibold">
					Active Jobs
					{#if runningCount > 0}
						<span class="font-normal text-muted-foreground">({runningCount} running)</span>
					{/if}
				</h2>
				{#if completedCount > 0}
					<Button variant="outline" size="sm" onclick={onClearCompletedJobs}>
						<X class="h-4 w-4 mr-1" />
						Clear Completed ({completedCount})
					</Button>
				{/if}
			</div>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each Array.from(activeJobs.entries()) as [key, job] (key)}
					<Card.Root>
						<Card.Content class="pt-6">
							<div class="flex items-center justify-between mb-2">
								<span class="font-semibold">{job.domain}</span>
								<Badge variant={getStatusBadgeVariant(job.status)}>
									{job.status === 'running'
										? 'Running'
										: job.status === 'complete'
											? 'Complete'
											: 'Error'}
								</Badge>
							</div>
							<div class="text-xs text-muted-foreground space-y-1">
								<p>Job ID: {job.jobId?.slice(0, 8)}...</p>
								<p>Started: {new Date(job.startedAt).toLocaleString()}</p>
								{#if job.completedAt}
									<p>Completed: {new Date(job.completedAt).toLocaleString()}</p>
								{/if}
							</div>
							{#if job.status === 'errored' && job.error}
								<p class="text-xs text-destructive mt-2">{job.error}</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</section>
	{/if}

	<!-- All Domains Selection -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">All Domains</h2>
			<div class="flex items-center gap-3">
				<div class="relative">
					<Search
						class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
					/>
					<Input
						type="text"
						placeholder="Search domains..."
						bind:value={searchQuery}
						class="pl-9 w-64"
					/>
				</div>
				<select
					bind:value={jobStatusFilter}
					class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
				>
					<option value="all">All Status</option>
					<option value="running">Running</option>
					<option value="has_run">Has Run</option>
					<option value="never_run">Never Run</option>
				</select>
			</div>
		</div>

		<SelectionBar
			selectedCount={selectedCount}
			totalCount={allDomains.length}
			onClear={() => selectedDomains.clear()}
		>
			<Button size="sm" onclick={handleTriggerJobs} disabled={triggeringJobs}>
				<Play class="h-4 w-4 mr-1" />
				{triggeringJobs ? 'Starting...' : 'Start getAllProducts'}
			</Button>
		</SelectionBar>

		<p class="text-sm text-muted-foreground mb-3">
			Showing {sortedAndFilteredDomains.length} of {allDomains.length} domains
			{#if jobStatusFilter !== 'all'}
				- Filtered by: {jobStatusFilter.replace('_', ' ')}
			{/if}
		</p>

		{#if loading}
			<Card.Root>
				<Card.Content class="py-8 text-center text-muted-foreground">
					<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
					Loading domains...
				</Card.Content>
			</Card.Root>
		{:else if sortedAndFilteredDomains.length === 0}
			<Card.Root>
				<Card.Content class="py-8 text-center text-muted-foreground">
					No domains found
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
									checked={allVisibleSelected}
									onchange={toggleSelectAll}
								/>
							</th>
							<th class="p-3 text-left font-medium">Domain</th>
							<th class="p-3 text-left font-medium w-32">Status</th>
							<th class="p-3 text-left font-medium">Products</th>
							<th class="p-3 text-left font-medium">Country</th>
							<th class="p-3 text-left font-medium">Last Job</th>
						</tr>
					</thead>
					<tbody>
						{#each sortedAndFilteredDomains as domain (`${domain.domain}/${domain.countryCode}`)}
							{@const key = `${domain.domain}/${domain.countryCode}`}
							{@const status = getDomainStatus(domain)}
							{@const job = activeJobs.get(key)}
							<tr class="border-b hover:bg-muted/30 transition-colors">
								<td class="p-3 text-center">
									<input
										type="checkbox"
										class="rounded"
										checked={selectedDomains.has(key)}
										onchange={() => toggleDomain(domain.domain, domain.countryCode)}
									/>
								</td>
								<td class="p-3">
									<a
										href="/admin/catalog/product-details/{domain.domain}/{domain.countryCode}"
										class="text-primary hover:underline font-medium"
									>
										{domain.domain}
									</a>
								</td>
								<td class="p-3">
									<WorkflowStatusBadge
										{status}
										lastRunDate={job?.startedAt}
									/>
								</td>
								<td class="p-3 text-muted-foreground">{formatNumber(domain.total)}</td>
								<td class="p-3 text-muted-foreground">{domain.countryCode}</td>
								<td class="p-3 text-muted-foreground">
									{#if job?.startedAt}
										{new Date(job.startedAt).toLocaleDateString()}
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
</div>
