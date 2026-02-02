<script>
	import { onMount } from 'svelte';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Search from 'lucide-svelte/icons/search';
	import Download from 'lucide-svelte/icons/download';
	import FileText from 'lucide-svelte/icons/file-text';
	import Package from 'lucide-svelte/icons/package';
	import Layers from 'lucide-svelte/icons/layers';
	import Clock from 'lucide-svelte/icons/clock';
	import X from 'lucide-svelte/icons/x';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import productDetailsApi from '$lib/api/catalog/product-details-client.js';
	import exportApi from '$lib/api/catalog/export-client.js';

	// State
	let stats = $state(null);
	let loading = $state(true);
	let error = $state(null);

	// Filtering
	let searchQuery = $state('');
	let minSuccessPercent = $state(0);
	let exportStatusFilter = $state('all');

	// Selection
	let selectedDomains = new SvelteSet();

	// Export state
	let exporting = $state(false);
	let exportProgress = $state([]);

	// Active jobs being polled
	let activeJobs = new SvelteMap();
	let pollingInterval = null;

	// LocalStorage key for persisting running job IDs
	const RUNNING_JOBS_KEY = 'export_running_jobs';

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

			// Restore jobs to activeJobs and poll their status
			for (const { key, jobId } of jobs) {
				try {
					const status = await exportApi.jobs.getStatus(jobId);

					// Add to activeJobs if still running
					if (status.status === 'queued' || status.status === 'running') {
						activeJobs.set(key, status);

						// Also add to exportProgress for visibility
						const [domain, countryCode] = key.split('/');
						exportProgress.push({
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

			exportProgress = [...exportProgress];

			// Start polling if we have active jobs
			if (activeJobs.size > 0) {
				exporting = true;
				startPolling();
			}

			// Update localStorage to remove completed jobs
			saveRunningJobs();
		} catch (e) {
			console.error('Failed to load running jobs:', e);
		}
	}

	// Export history modal
	let showHistoryModal = $state(false);
	let historyDomain = $state(null);
	let historyCountryCode = $state(null);
	let exportHistory = $state(null);
	let loadingHistory = $state(false);

	// Status tooltip
	let openTooltip = $state(null);

	// Latest exports cache (domain/countryCode -> latest version info)
	let latestExports = new SvelteMap();
	let loadingLatestExports = $state(false);

	// Get export status for a domain
	function getExportStatus(domain, countryCode) {
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

		// Check export progress (in-session exports)
		const progress = exportProgress.find((p) => `${p.domain}/${p.countryCode}` === key);
		if (progress) {
			return {
				status: progress.status,
				jobId: progress.jobId,
				error: progress.error
			};
		}

		// Check if there's a latest export available
		const latestExport = latestExports.get(key);
		if (latestExport) {
			return {
				status: 'has_export',
				latestExport
			};
		}

		return { status: 'idle' };
	}

	// Load latest exports for all domains
	async function loadLatestExports() {
		if (!stats?.domains || stats.domains.length === 0) return;

		loadingLatestExports = true;
		const newLatestExports = new SvelteMap(latestExports);

		// Load in batches to avoid overwhelming the API
		const batchSize = 5;
		for (let i = 0; i < stats.domains.length; i += batchSize) {
			const batch = stats.domains.slice(i, i + batchSize);
			await Promise.all(
				batch.map(async (domain) => {
					const key = `${domain.domain}/${domain.countryCode}`;
					try {
						const manifest = await exportApi.manifest.getLatest(
							domain.domain,
							domain.countryCode
						);

						// Find the latest version from versions array
						let latestVersion = null;
						if (manifest.versions && manifest.versions.length > 0) {
							if (typeof manifest.latest === 'string') {
								latestVersion =
									manifest.versions.find((v) => v.id === manifest.latest) ||
									manifest.versions[0];
							} else if (manifest.latest && typeof manifest.latest === 'object') {
								latestVersion = manifest.latest;
							} else {
								latestVersion = manifest.versions[0];
							}
						}

						if (latestVersion) {
							const exportInfo = {
								versionId: latestVersion.id || latestVersion.versionId || '',
								createdAt: latestVersion.createdAt || manifest.updatedAt || '',
								totalProducts: latestVersion.totalProducts || 0,
								filesCount:
									latestVersion.fileCount || latestVersion.files?.length || 0,
								totalVersions:
									manifest.totalVersions || manifest.versions?.length || 1
							};
							newLatestExports.set(key, exportInfo);
						}
					} catch {
						// Domain has no exports yet - that's fine
					}
				})
			);
		}

		latestExports = newLatestExports;
		loadingLatestExports = false;
	}

	function toggleTooltip(key) {
		openTooltip = openTooltip === key ? null : key;
	}

	function closeTooltip() {
		openTooltip = null;
	}

	// Filtered domains
	let filteredDomains = $derived.by(() => {
		if (!stats?.domains) return [];
		let domains = stats.domains;

		// Filter by export status
		if (exportStatusFilter === 'has_export') {
			domains = domains.filter((d) => latestExports.has(`${d.domain}/${d.countryCode}`));
		} else if (exportStatusFilter === 'no_export') {
			domains = domains.filter((d) => !latestExports.has(`${d.domain}/${d.countryCode}`));
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

		return domains;
	});

	// Derived stats for selection
	let selectionStats = $derived.by(() => {
		const selected = filteredDomains.filter((d) =>
			selectedDomains.has(`${d.domain}/${d.countryCode}`)
		);
		return {
			count: selected.length,
			totalProducts: selected.reduce((sum, d) => sum + d.success, 0)
		};
	});

	// Export stats derived from latestExports
	let exportStats = $derived.by(() => {
		const exports = Array.from(latestExports.values());
		const domainsWithExports = exports.length;
		const totalExportedProducts = exports.reduce((sum, e) => sum + (e.totalProducts || 0), 0);
		const totalFiles = exports.reduce((sum, e) => sum + (e.filesCount || 0), 0);
		const totalVersions = exports.reduce((sum, e) => sum + (e.totalVersions || 1), 0);

		// Find most recent export
		let mostRecentDate = '';
		for (const exp of exports) {
			if (exp.createdAt && (!mostRecentDate || exp.createdAt > mostRecentDate)) {
				mostRecentDate = exp.createdAt;
			}
		}

		return {
			domainsWithExports,
			totalExportedProducts,
			totalFiles,
			totalVersions,
			mostRecentDate
		};
	});

	onMount(async () => {
		await loadData();
		// Load any previously running jobs from localStorage
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
			stats = await productDetailsApi.crossDomainStats.getStats();
			// Load latest exports in background after stats are loaded
			loadLatestExports();
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
		filteredDomains.forEach((d) => selectedDomains.add(`${d.domain}/${d.countryCode}`));
	}

	function deselectAll() {
		const filteredKeys = new Set(filteredDomains.map((d) => `${d.domain}/${d.countryCode}`));
		for (const key of [...selectedDomains]) {
			if (filteredKeys.has(key)) {
				selectedDomains.delete(key);
			}
		}
	}

	async function triggerExports() {
		if (selectedDomains.size === 0) return;

		exporting = true;
		exportProgress = [];

		const domainsToExport = Array.from(selectedDomains).map((key) => {
			const [domain, countryCode] = key.split('/');
			return { domain, countryCode };
		});

		// Initialize progress
		exportProgress = domainsToExport.map((d) => ({
			domain: d.domain,
			countryCode: d.countryCode,
			status: 'pending'
		}));

		// Trigger exports sequentially
		for (let i = 0; i < domainsToExport.length; i++) {
			const { domain, countryCode } = domainsToExport[i];
			exportProgress[i].status = 'running';
			exportProgress = [...exportProgress];

			try {
				const response = await exportApi.jobs.trigger(domain, countryCode);
				exportProgress[i].jobId = response.jobId;
				exportProgress[i].status = 'running';

				// Add to active jobs for polling
				activeJobs.set(`${domain}/${countryCode}`, {
					jobId: response.jobId,
					status: 'running',
					output: null,
					error: null
				});
			} catch (e) {
				exportProgress[i].status = 'failed';
				exportProgress[i].error = e instanceof Error ? e.message : 'Unknown error';
			}
			exportProgress = [...exportProgress];
		}

		// Save running jobs to localStorage
		saveRunningJobs();

		// Start polling for job status
		if (activeJobs.size > 0) {
			startPolling();
		} else {
			exporting = false;
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
					const status = await exportApi.jobs.getStatus(job.jobId);
					activeJobs.set(key, status);

					// Update progress
					const progressItem = exportProgress.find(
						(p) => `${p.domain}/${p.countryCode}` === key
					);
					if (progressItem) {
						if (status.status === 'complete') {
							progressItem.status = 'complete';
							completedKeys.push(key);
						} else if (status.status === 'errored') {
							progressItem.status = 'failed';
							progressItem.error = status.error || 'Job failed';
							completedKeys.push(key);
						}
						exportProgress = [...exportProgress];
					}
				} catch (e) {
					console.error(`Failed to poll job status for ${key}:`, e);
				}
			}

			// Remove completed jobs
			completedKeys.forEach((key) => activeJobs.delete(key));

			// Save updated running jobs to localStorage
			saveRunningJobs();

			// Stop polling if all done
			if (activeJobs.size === 0 && pollingInterval) {
				clearInterval(pollingInterval);
				pollingInterval = null;
				exporting = false;
			}
		}, 3000);
	}

	async function viewExportHistory(domain, countryCode) {
		historyDomain = domain;
		historyCountryCode = countryCode;
		showHistoryModal = true;
		loadingHistory = true;
		exportHistory = null;

		try {
			exportHistory = await exportApi.manifest.get(domain, countryCode);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load export history';
		} finally {
			loadingHistory = false;
		}
	}

	function closeHistoryModal() {
		showHistoryModal = false;
		historyDomain = null;
		historyCountryCode = null;
		exportHistory = null;
	}

	function downloadFile(domain, countryCode, versionId, fileName) {
		const url = exportApi.manifest.getFileUrl(domain, countryCode, versionId, fileName);
		window.open(url, '_blank');
	}

	function formatBytes(bytes) {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function parseDate(dateStr) {
		if (!dateStr) return null;
		try {
			let date;
			if (typeof dateStr === 'number') {
				date = new Date(dateStr < 10000000000 ? dateStr * 1000 : dateStr);
			} else if (/^\d+$/.test(dateStr)) {
				const ts = parseInt(dateStr, 10);
				date = new Date(ts < 10000000000 ? ts * 1000 : ts);
			} else {
				date = new Date(dateStr);
			}
			if (isNaN(date.getTime())) {
				return null;
			}
			return date;
		} catch {
			return null;
		}
	}

	function formatExportDate(dateStr) {
		const date = parseDate(dateStr);
		if (!date) return 'Available';
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		if (days === 0) return 'Today';
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
		return date.toLocaleDateString();
	}

	// Action to set indeterminate state on checkbox
	function setIndeterminate(node, value) {
		node.indeterminate = value;
		return {
			update(value) {
				node.indeterminate = value;
			}
		};
	}

	// Computed indeterminate state for select-all checkbox
	let isIndeterminate = $derived(
		filteredDomains.some((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`)) &&
			!filteredDomains.every((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`))
	);

	function getStatusBadgeVariant(status) {
		switch (status) {
			case 'complete':
			case 'has_export':
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
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader
			title="Export Data"
			description="Export product data for domains. Select domains and trigger exports to generate JSONL files."
		/>
		<Button variant="outline" onclick={loadData} disabled={loading}>
			<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
			Refresh
		</Button>
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
				Loading domains...
			</Card.Content>
		</Card.Root>
	{:else if stats}
		<!-- Export Stats -->
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-primary/10 rounded-lg">
							<Download class="h-5 w-5 text-primary" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Domains with Exports</p>
							<p class="text-2xl font-bold">
								{loadingLatestExports
									? '...'
									: `${exportStats.domainsWithExports} / ${stats.total_domains}`}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-green-500/10 rounded-lg">
							<Package class="h-5 w-5 text-green-600" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Exported Products</p>
							<p class="text-2xl font-bold">
								{loadingLatestExports
									? '...'
									: exportStats.totalExportedProducts.toLocaleString()}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-blue-500/10 rounded-lg">
							<FileText class="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Export Files</p>
							<p class="text-2xl font-bold">
								{loadingLatestExports
									? '...'
									: exportStats.totalFiles.toLocaleString()}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex items-center gap-3">
						<div class="p-2 bg-purple-500/10 rounded-lg">
							<Layers class="h-5 w-5 text-purple-600" />
						</div>
						<div>
							<p class="text-sm text-muted-foreground">Total Versions</p>
							<p class="text-2xl font-bold">
								{loadingLatestExports
									? '...'
									: exportStats.totalVersions.toLocaleString()}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Last Export Info -->
		{#if exportStats.mostRecentDate}
			<div class="flex items-center gap-2 px-4 py-3 bg-muted rounded-lg text-sm">
				<Clock class="h-4 w-4 text-muted-foreground" />
				<span class="text-muted-foreground">Most recent export:</span>
				<strong>{formatExportDate(exportStats.mostRecentDate)}</strong>
			</div>
		{/if}

		<!-- Domain Selection -->
		<div class="space-y-4">
			<div class="flex items-center justify-between flex-wrap gap-4">
				<h2 class="text-xl font-semibold">Select Domains for Export</h2>
				<div class="flex items-center gap-3 flex-wrap">
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground whitespace-nowrap"
							>Export Status:</span
						>
						<select
							bind:value={exportStatusFilter}
							class="px-3 py-2 text-sm border rounded-md bg-background min-w-[140px]"
						>
							<option value="all">All Domains</option>
							<option value="no_export">No Export</option>
							<option value="has_export">Has Export</option>
						</select>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted-foreground whitespace-nowrap"
							>Min Success %:</span
						>
						<Input
							type="number"
							min={0}
							max={100}
							bind:value={minSuccessPercent}
							class="w-20"
						/>
					</div>
					<div class="relative min-w-[200px]">
						<Search
							class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
						/>
						<Input
							placeholder="Search domains..."
							bind:value={searchQuery}
							class="pl-9"
						/>
					</div>
				</div>
			</div>

			{#if filteredDomains.length !== stats.domains.length || exportStatusFilter !== 'all'}
				<p class="text-sm text-muted-foreground">
					Showing {filteredDomains.length} of {stats.domains.length} domains
					{#if exportStatusFilter === 'no_export'}
						(without exports)
					{:else if exportStatusFilter === 'has_export'}
						(with exports)
					{/if}
					{#if minSuccessPercent > 0}
						{exportStatusFilter !== 'all' ? ', ' : '('}>= {minSuccessPercent}% success{exportStatusFilter ===
						'all'
							? ')'
							: ''}
					{/if}
				</p>
			{/if}

			<!-- Selection Bar -->
			{#if selectedDomains.size > 0}
				<div
					class="flex items-center justify-between flex-wrap gap-3 px-4 py-3 bg-primary/10 rounded-lg"
				>
					<div class="flex items-center gap-4">
						<span class="font-semibold text-primary"
							>{selectionStats.count} domains selected</span
						>
						<span class="text-sm text-muted-foreground">
							({selectionStats.totalProducts.toLocaleString()} successful products)
						</span>
					</div>
					<div class="flex items-center gap-2">
						<Button variant="ghost" size="sm" onclick={deselectAll}
							>Clear Selection</Button
						>
						<Button size="sm" disabled={exporting} onclick={triggerExports}>
							{#if exporting}
								<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
							{:else}
								<Download class="h-4 w-4 mr-2" />
							{/if}
							Export Selected
						</Button>
					</div>
				</div>
			{/if}

			{#if filteredDomains.length === 0}
				<Card.Root>
					<Card.Content class="py-12 text-center text-muted-foreground">
						<h3 class="text-lg font-semibold text-foreground mb-2">No domains found</h3>
						<p>
							{#if searchQuery || minSuccessPercent > 0}
								No domains match your filters. Try adjusting the minimum success
								percentage or search query.
							{:else}
								No domains available. Sync products from the catalog first.
							{/if}
						</p>
					</Card.Content>
				</Card.Root>
			{:else}
				<Card.Root class="overflow-hidden">
					<div class="overflow-x-auto">
						<table class="w-full">
							<thead>
								<tr class="border-b bg-muted/50">
									<th class="p-3 w-10">
										<input
											type="checkbox"
											class="w-4 h-4 cursor-pointer"
											checked={filteredDomains.length > 0 &&
												filteredDomains.every((d) =>
													selectedDomains.has(
														`${d.domain}/${d.countryCode}`
													)
												)}
											use:setIndeterminate={isIndeterminate}
											onchange={() => {
												const allSelected = filteredDomains.every((d) =>
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
									<th
										class="p-3 text-left text-sm font-semibold text-muted-foreground"
										>Domain</th
									>
									<th
										class="p-3 text-left text-sm font-semibold text-muted-foreground"
										>Export Status</th
									>
									<th
										class="p-3 text-left text-sm font-semibold text-muted-foreground"
										>Success %</th
									>
									<th
										class="p-3 text-right text-sm font-semibold text-muted-foreground"
										>Success</th
									>
									<th
										class="p-3 text-right text-sm font-semibold text-muted-foreground"
										>Pending</th
									>
									<th
										class="p-3 text-right text-sm font-semibold text-muted-foreground"
										>Failed</th
									>
									<th
										class="p-3 text-right text-sm font-semibold text-muted-foreground"
										>Actions</th
									>
								</tr>
							</thead>
							<tbody>
								{#each filteredDomains as domain (`${domain.domain}/${domain.countryCode}`)}
									{@const key = `${domain.domain}/${domain.countryCode}`}
									{@const isSelected = selectedDomains.has(key)}
									{@const exportStatus = getExportStatus(
										domain.domain,
										domain.countryCode
									)}
									<tr
										class="border-b hover:bg-muted/30 transition-colors {isSelected
											? 'bg-primary/5'
											: ''}"
									>
										<td class="p-3">
											<input
												type="checkbox"
												class="w-4 h-4 cursor-pointer"
												checked={isSelected}
												onchange={() =>
													toggleDomain(domain.domain, domain.countryCode)}
											/>
										</td>
										<td class="p-3">
											<span class="font-medium">{domain.domain}</span>
											<span class="text-muted-foreground text-sm">
												/ {domain.countryCode}</span
											>
										</td>
										<td class="p-3 relative">
											<button
												type="button"
												class="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium cursor-pointer transition-transform hover:scale-105
                          {exportStatus.status === 'idle'
													? 'bg-muted text-muted-foreground'
													: exportStatus.status === 'running'
														? 'bg-blue-100 text-blue-700'
														: exportStatus.status === 'complete' ||
															  exportStatus.status === 'has_export'
															? 'bg-green-100 text-green-700'
															: exportStatus.status === 'pending'
																? 'bg-yellow-100 text-yellow-700'
																: 'bg-red-100 text-red-700'}"
												onclick={() => toggleTooltip(key)}
												onblur={() => setTimeout(closeTooltip, 200)}
											>
												<span
													class="w-2 h-2 rounded-full {exportStatus.status ===
													'idle'
														? 'bg-gray-400'
														: exportStatus.status === 'running'
															? 'bg-blue-500 animate-pulse'
															: exportStatus.status === 'complete' ||
																  exportStatus.status ===
																		'has_export'
																? 'bg-green-500'
																: exportStatus.status === 'pending'
																	? 'bg-yellow-500'
																	: 'bg-red-500'}"
												></span>
												<span>
													{#if exportStatus.status === 'idle'}
														{loadingLatestExports
															? 'Loading...'
															: 'No Export'}
													{:else if exportStatus.status === 'pending'}
														Queued
													{:else if exportStatus.status === 'running'}
														Running
													{:else if exportStatus.status === 'complete'}
														Complete
													{:else if exportStatus.status === 'has_export'}
														{formatExportDate(
															exportStatus.latestExport?.createdAt
														)}
													{:else if exportStatus.status === 'failed'}
														Failed
													{:else}
														Unknown
													{/if}
												</span>
											</button>
											{#if openTooltip === key && (exportStatus.status !== 'idle' || exportStatus.latestExport)}
												<div
													class="absolute top-full right-0 z-50 bg-background border rounded-lg shadow-lg p-3 min-w-[280px] max-w-[350px] mt-2"
												>
													<div
														class="flex items-center justify-between pb-2 mb-2 border-b text-sm"
													>
														<span class="font-semibold">
															{exportStatus.status === 'has_export'
																? 'Latest Export'
																: 'Export Job Details'}
														</span>
														<Badge
															variant={getStatusBadgeVariant(
																exportStatus.status
															)}
														>
															{exportStatus.status === 'has_export'
																? 'Available'
																: exportStatus.status}
														</Badge>
													</div>
													<div class="text-sm space-y-1">
														{#if exportStatus.jobId}
															<div class="flex justify-between">
																<span class="text-muted-foreground"
																	>Job ID:</span
																>
																<span class="font-mono text-xs"
																	>{exportStatus.jobId}</span
																>
															</div>
														{/if}
														{#if exportStatus.error}
															<div
																class="mt-2 p-2 bg-destructive/10 rounded text-destructive text-xs"
															>
																<strong>Error:</strong>
																{exportStatus.error}
															</div>
														{/if}
														{#if exportStatus.output}
															<div
																class="mt-2 p-2 bg-muted rounded text-xs"
															>
																<div class="font-semibold mb-1">
																	Output
																</div>
																<div class="flex justify-between">
																	<span
																		class="text-muted-foreground"
																		>Total Products:</span
																	>
																	<span class="font-mono"
																		>{exportStatus.output.totalProducts?.toLocaleString() ??
																			'N/A'}</span
																	>
																</div>
																{#if exportStatus.output.versionId}
																	<div
																		class="flex justify-between"
																	>
																		<span
																			class="text-muted-foreground"
																			>Version:</span
																		>
																		<span class="font-mono"
																			>{exportStatus.output
																				.versionId}</span
																		>
																	</div>
																{/if}
																{#if exportStatus.output.files?.length}
																	<div
																		class="flex justify-between"
																	>
																		<span
																			class="text-muted-foreground"
																			>Files:</span
																		>
																		<span class="font-mono"
																			>{exportStatus.output
																				.files.length}</span
																		>
																	</div>
																{/if}
															</div>
														{/if}
														{#if exportStatus.latestExport}
															<div
																class="mt-2 p-2 bg-muted rounded text-xs"
															>
																<div class="font-semibold mb-1">
																	Latest Export
																</div>
																<div class="flex justify-between">
																	<span
																		class="text-muted-foreground"
																		>Date:</span
																	>
																	<span class="font-mono"
																		>{formatExportDate(
																			exportStatus
																				.latestExport
																				.createdAt
																		)}</span
																	>
																</div>
																<div class="flex justify-between">
																	<span
																		class="text-muted-foreground"
																		>Products:</span
																	>
																	<span class="font-mono"
																		>{(
																			exportStatus
																				.latestExport
																				.totalProducts ?? 0
																		).toLocaleString()}</span
																	>
																</div>
																<div class="flex justify-between">
																	<span
																		class="text-muted-foreground"
																		>Files:</span
																	>
																	<span class="font-mono"
																		>{exportStatus.latestExport
																			.filesCount ?? 0}</span
																	>
																</div>
																{#if exportStatus.latestExport.versionId}
																	<div
																		class="flex justify-between"
																	>
																		<span
																			class="text-muted-foreground"
																			>Version:</span
																		>
																		<span class="font-mono"
																			>{exportStatus
																				.latestExport
																				.versionId}</span
																		>
																	</div>
																{/if}
															</div>
														{/if}
														{#if exportStatus.status === 'running'}
															<div
																class="mt-2 text-xs text-blue-600 flex items-center gap-1"
															>
																<RefreshCw
																	class="h-3 w-3 animate-spin"
																/>
																Exporting in progress...
															</div>
														{/if}
													</div>
												</div>
											{/if}
										</td>
										<td class="p-3 min-w-[120px]">
											<div class="space-y-1">
												<Progress
													value={domain.completion_percent}
													class="h-2"
												/>
												<p class="text-xs text-muted-foreground">
													{domain.completion_percent}%
												</p>
											</div>
										</td>
										<td class="p-3 text-right tabular-nums text-green-600">
											{domain.success.toLocaleString()}
										</td>
										<td class="p-3 text-right tabular-nums text-yellow-600">
											{domain.pending.toLocaleString()}
										</td>
										<td class="p-3 text-right tabular-nums text-red-600">
											{(
												domain.failed + domain.permanently_failed
											).toLocaleString()}
										</td>
										<td class="p-3">
											<div class="flex justify-end">
												<Button
													variant="outline"
													size="sm"
													onclick={() =>
														viewExportHistory(
															domain.domain,
															domain.countryCode
														)}
												>
													History
												</Button>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</Card.Root>
			{/if}
		</div>

		<!-- Export Progress -->
		{#if exportProgress.length > 0}
			<div class="space-y-4">
				<div class="flex items-center justify-between">
					<h2 class="text-xl font-semibold">Export Progress</h2>
					{#if !exporting}
						<Button variant="ghost" size="sm" onclick={() => (exportProgress = [])}
							>Clear</Button
						>
					{/if}
				</div>
				<Card.Root>
					{#each exportProgress as item (`${item.domain}/${item.countryCode}`)}
						<div class="flex items-center justify-between p-3 border-b last:border-b-0">
							<span class="font-medium">{item.domain}/{item.countryCode}</span>
							<div class="flex items-center gap-2">
								{#if item.error}
									<span class="text-sm text-destructive">{item.error}</span>
								{/if}
								<Badge variant={getStatusBadgeVariant(item.status)}>
									{item.status}
								</Badge>
								{#if item.status === 'running'}
									<RefreshCw class="h-4 w-4 animate-spin text-muted-foreground" />
								{/if}
							</div>
						</div>
					{/each}
				</Card.Root>
			</div>
		{/if}
	{/if}
</div>

<!-- Export History Modal -->
{#if showHistoryModal}
	<div
		class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
		onclick={closeHistoryModal}
	>
		<div
			class="bg-background rounded-xl max-w-[700px] w-full max-h-[80vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="flex items-center justify-between p-4 border-b">
				<h3 class="text-lg font-semibold">
					Export History - {historyDomain}/{historyCountryCode}
				</h3>
				<Button variant="ghost" size="sm" onclick={closeHistoryModal}>
					<X class="h-4 w-4" />
				</Button>
			</div>
			<div class="p-6 overflow-y-auto">
				{#if loadingHistory}
					<div class="flex items-center justify-center py-12 text-muted-foreground">
						<RefreshCw class="h-5 w-5 animate-spin mr-3" />
						Loading export history...
					</div>
				{:else if exportHistory}
					{#if exportHistory.versions && exportHistory.versions.length > 0}
						{#each exportHistory.versions as version (version.versionId)}
							<div class="border rounded-lg p-4 mb-4 last:mb-0">
								<div class="flex items-center justify-between mb-3">
									<span class="font-mono text-sm text-muted-foreground"
										>{version.versionId}</span
									>
									<span class="text-sm text-muted-foreground">
										{new Date(version.createdAt).toLocaleString()}
									</span>
								</div>
								<div class="text-sm text-muted-foreground mb-3">
									{version.totalProducts.toLocaleString()} products in {version
										.files?.length ?? 0} files
								</div>
								{#if version.files && version.files.length > 0}
									<div class="space-y-2">
										{#each version.files as file (file.fileName)}
											<div
												class="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
											>
												<span class="font-mono">{file.fileName}</span>
												<div
													class="flex items-center gap-3 text-muted-foreground"
												>
													<span>{file.productCount} products</span>
													<span
														>{formatBytes(
															file.gzSizeBytes ?? file.sizeBytes
														)}</span
													>
													<Button
														variant="outline"
														size="sm"
														onclick={() =>
															downloadFile(
																historyDomain,
																historyCountryCode,
																version.versionId,
																file.fileName
															)}
													>
														<Download class="h-3 w-3 mr-1" />
														Download
													</Button>
												</div>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					{:else if exportHistory.latest}
						<div class="border rounded-lg p-4">
							<div class="flex items-center justify-between mb-3">
								<span class="font-mono text-sm text-muted-foreground"
									>{exportHistory.latest.versionId}</span
								>
								<span class="text-sm text-muted-foreground">
									{new Date(exportHistory.latest.createdAt).toLocaleString()}
								</span>
							</div>
							<div class="text-sm text-muted-foreground mb-3">
								{exportHistory.latest.totalProducts.toLocaleString()} products in {exportHistory
									.latest.files?.length ?? 0} files
							</div>
							{#if exportHistory.latest.files && exportHistory.latest.files.length > 0}
								<div class="space-y-2">
									{#each exportHistory.latest.files as file (file.fileName)}
										<div
											class="flex items-center justify-between p-2 bg-muted rounded-md text-sm"
										>
											<span class="font-mono">{file.fileName}</span>
											<div
												class="flex items-center gap-3 text-muted-foreground"
											>
												<span>{file.productCount} products</span>
												<span
													>{formatBytes(
														file.gzSizeBytes ?? file.sizeBytes
													)}</span
												>
												<Button
													variant="outline"
													size="sm"
													onclick={() =>
														downloadFile(
															historyDomain,
															historyCountryCode,
															exportHistory.latest.versionId,
															file.fileName
														)}
												>
													<Download class="h-3 w-3 mr-1" />
													Download
												</Button>
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{:else}
						<div class="text-center py-12 text-muted-foreground">
							<h3 class="text-lg font-semibold text-foreground mb-2">
								No exports found
							</h3>
							<p>This domain has no export history yet.</p>
						</div>
					{/if}
				{:else}
					<div class="text-center py-12 text-muted-foreground">
						<h3 class="text-lg font-semibold text-foreground mb-2">No exports found</h3>
						<p>This domain has no export history yet.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
