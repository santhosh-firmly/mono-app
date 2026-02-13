<script>
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Play from 'lucide-svelte/icons/play';
	import Search from 'lucide-svelte/icons/search';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Database from 'lucide-svelte/icons/database';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import X from 'lucide-svelte/icons/x';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { PageErrorAlert } from '../shared/index.js';

	// Props
	let {
		pdStats = null,
		statusFilter = 'all',
		sortBy = 'pending_desc',
		searchQuery = '',
		loading = false,
		startingBulk = false,
		triggeringDomain = null,
		error = null,
		// Handlers
		onRefresh = () => {},
		onTriggerWorkflow = () => {},
		onStartBulkWorkflows = () => {},
		onStatusFilterChange = () => {},
		onSortByChange = () => {},
		onSearchQueryChange = () => {},
		onDismissError = () => {}
	} = $props();

	const sortOptions = [
		{ value: 'pending_desc', label: 'Most Pending First' },
		{ value: 'pending_asc', label: 'Least Pending First' },
		{ value: 'completion_asc', label: 'Lowest Completion First' },
		{ value: 'completion_desc', label: 'Highest Completion First' },
		{ value: 'total_desc', label: 'Most Products First' },
		{ value: 'total_asc', label: 'Least Products First' },
		{ value: 'domain_asc', label: 'Domain (A-Z)' },
		{ value: 'domain_desc', label: 'Domain (Z-A)' },
		{ value: 'errors_desc', label: 'Most Errors First' }
	];

	// Derived values
	let filteredDomains = $derived.by(() => {
		if (!pdStats?.domains) return [];

		let domains = [...pdStats.domains];

		// Apply search filter
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase().trim();
			domains = domains.filter((d) => d.domain.toLowerCase().includes(query));
		}

		// Apply status filter
		switch (statusFilter) {
			case 'processing':
				domains = domains.filter((d) => d.pending > 0);
				break;
			case 'completed':
				domains = domains.filter((d) => d.completion_percent === 100);
				break;
			case 'with_errors':
				domains = domains.filter((d) => d.failed > 0 || d.permanently_failed > 0);
				break;
			case 'idle':
				domains = domains.filter((d) => d.pending === 0 && d.completion_percent < 100);
				break;
		}

		// Apply sorting
		switch (sortBy) {
			case 'pending_desc':
				domains.sort((a, b) => b.pending - a.pending);
				break;
			case 'pending_asc':
				domains.sort((a, b) => a.pending - b.pending);
				break;
			case 'completion_asc':
				domains.sort((a, b) => a.completion_percent - b.completion_percent);
				break;
			case 'completion_desc':
				domains.sort((a, b) => b.completion_percent - a.completion_percent);
				break;
			case 'total_desc':
				domains.sort((a, b) => b.total - a.total);
				break;
			case 'total_asc':
				domains.sort((a, b) => a.total - b.total);
				break;
			case 'domain_asc':
				domains.sort((a, b) => a.domain.localeCompare(b.domain));
				break;
			case 'domain_desc':
				domains.sort((a, b) => b.domain.localeCompare(a.domain));
				break;
			case 'errors_desc':
				domains.sort(
					(a, b) => b.failed + b.permanently_failed - (a.failed + a.permanently_failed)
				);
				break;
		}

		return domains;
	});

	// Stats
	let processingCount = $derived(pdStats?.domains?.filter((d) => d.pending > 0).length || 0);
	let completedCount = $derived(
		pdStats?.domains?.filter((d) => d.completion_percent === 100).length || 0
	);
	let errorCount = $derived(
		pdStats?.domains?.filter((d) => d.failed > 0 || d.permanently_failed > 0).length || 0
	);

	// Helper functions
	function getStatusVariant(domain) {
		if (domain.failed > 0 || domain.permanently_failed > 0) return 'destructive';
		if (domain.completion_percent === 100) return 'default';
		if (domain.pending > 0) return 'secondary';
		return 'outline';
	}

	function getStatusText(domain) {
		if (domain.pending > 0) return 'Processing';
		if (domain.completion_percent === 100) return 'Completed';
		if (domain.failed > 0 || domain.permanently_failed > 0) return 'Has Errors';
		return 'Idle';
	}

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}

	function handleSearchInput(e) {
		onSearchQueryChange(e.target.value);
	}

	function handleSortByChange(e) {
		onSortByChange(e.target.value);
	}

	function handleStatusFilterChange(e) {
		onStatusFilterChange(e.target.value);
	}

	function toggleStatusFilter(filter) {
		onStatusFilterChange(statusFilter === filter ? 'all' : filter);
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<div class="flex items-center justify-between flex-wrap gap-4">
		<PageHeader title="Workflows" description="Manage product details fetch workflows" />
		<div class="flex gap-3">
			<Button variant="outline" onclick={onRefresh} disabled={loading}>
				<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
				Refresh
			</Button>
			<Button onclick={onStartBulkWorkflows} disabled={startingBulk || processingCount === 0}>
				{#if startingBulk}
					<RefreshCw class="h-4 w-4 mr-2 animate-spin" />
				{:else}
					<Play class="h-4 w-4 mr-2" />
				{/if}
				Trigger All Pending ({processingCount})
			</Button>
		</div>
	</div>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	<!-- Stats Row -->
	<div class="flex gap-4 flex-wrap">
		<div class="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm font-medium">
			<Database class="h-4 w-4" />
			<strong>{pdStats?.total_domains || 0}</strong> Total Domains
		</div>
		<button
			class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all {statusFilter ===
			'processing'
				? 'bg-yellow-500/20 text-yellow-700 ring-2 ring-yellow-500'
				: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20'}"
			onclick={() => toggleStatusFilter('processing')}
		>
			<Clock class="h-4 w-4" />
			<strong>{processingCount}</strong> Processing
			{#if statusFilter === 'processing'}
				<span
					class="ml-1 p-0.5 rounded-full bg-yellow-600 text-white"
					onclick={(e) => {
						e.stopPropagation();
						onStatusFilterChange('all');
					}}
					onkeydown={() => {}}
					role="button"
					tabindex="0"
				>
					<X class="h-3 w-3" />
				</span>
			{/if}
		</button>
		<button
			class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all {statusFilter ===
			'completed'
				? 'bg-green-500/20 text-green-700 ring-2 ring-green-500'
				: 'bg-green-500/10 text-green-600 hover:bg-green-500/20'}"
			onclick={() => toggleStatusFilter('completed')}
		>
			<CheckCircle class="h-4 w-4" />
			<strong>{completedCount}</strong> Completed
			{#if statusFilter === 'completed'}
				<span
					class="ml-1 p-0.5 rounded-full bg-green-600 text-white"
					onclick={(e) => {
						e.stopPropagation();
						onStatusFilterChange('all');
					}}
					onkeydown={() => {}}
					role="button"
					tabindex="0"
				>
					<X class="h-3 w-3" />
				</span>
			{/if}
		</button>
		<button
			class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all {statusFilter ===
			'with_errors'
				? 'bg-red-500/20 text-red-700 ring-2 ring-red-500'
				: 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}"
			onclick={() => toggleStatusFilter('with_errors')}
		>
			<AlertTriangle class="h-4 w-4" />
			<strong>{errorCount}</strong> With Errors
			{#if statusFilter === 'with_errors'}
				<span
					class="ml-1 p-0.5 rounded-full bg-red-600 text-white"
					onclick={(e) => {
						e.stopPropagation();
						onStatusFilterChange('all');
					}}
					onkeydown={() => {}}
					role="button"
					tabindex="0"
				>
					<X class="h-3 w-3" />
				</span>
			{/if}
		</button>
	</div>

	<!-- Filters -->
	<div class="flex gap-4 flex-wrap items-end">
		<div class="flex-1 min-w-[250px]">
			<label class="text-sm text-muted-foreground mb-1.5 block">Search Domains</label>
			<div class="relative">
				<Search
					class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
				/>
				<Input
					type="text"
					placeholder="Type to search..."
					value={searchQuery}
					oninput={handleSearchInput}
					class="pl-9"
				/>
			</div>
		</div>
		<div class="min-w-[200px]">
			<label class="text-sm text-muted-foreground mb-1.5 block">Status</label>
			<select
				value={statusFilter}
				onchange={handleStatusFilterChange}
				class="w-full px-3 py-2 text-sm border rounded-md bg-background"
			>
				<option value="all">All Domains</option>
				<option value="processing">Processing (pending &gt; 0)</option>
				<option value="completed">Completed (100%)</option>
				<option value="with_errors">With Errors</option>
				<option value="idle">Idle (no pending)</option>
			</select>
		</div>
		<div class="min-w-[200px]">
			<label class="text-sm text-muted-foreground mb-1.5 block">Sort By</label>
			<select
				value={sortBy}
				onchange={handleSortByChange}
				class="w-full px-3 py-2 text-sm border rounded-md bg-background"
			>
				{#each sortOptions as option}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if loading}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
				Loading workflows...
			</Card.Content>
		</Card.Root>
	{:else if filteredDomains.length === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center text-muted-foreground">
				<h3 class="text-lg font-semibold text-foreground mb-2">No domains found</h3>
				<p>
					{#if searchQuery || statusFilter !== 'all'}
						Try adjusting your filters.
					{:else}
						No domains have been configured yet.
					{/if}
				</p>
			</Card.Content>
		</Card.Root>
	{:else}
		<p class="text-sm text-muted-foreground">
			Showing {filteredDomains.length} of {pdStats?.total_domains || 0} domains
		</p>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each filteredDomains as domain (`${domain.domain}/${domain.countryCode}`)}
				<Card.Root
					class="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
				>
					<Card.Content class="pt-6">
						<div class="flex items-center justify-between mb-3">
							<div>
								<span class="font-semibold">{domain.domain}</span>
								<span class="text-xs text-muted-foreground ml-2"
									>{domain.countryCode}</span
								>
							</div>
							<Badge variant={getStatusVariant(domain)}>
								{getStatusText(domain)}
							</Badge>
						</div>

						<div class="space-y-1 mb-3">
							<Progress value={domain.completion_percent} class="h-2" />
							<p class="text-xs text-muted-foreground">
								{domain.completion_percent}% complete
							</p>
						</div>

						<div class="grid grid-cols-4 gap-2 text-center text-xs mb-3">
							<div class="p-2 bg-muted rounded-md">
								<p class="font-semibold">{formatNumber(domain.total)}</p>
								<p class="text-muted-foreground">Total</p>
							</div>
							<div class="p-2 bg-muted rounded-md">
								<p class="font-semibold text-green-600">
									{formatNumber(domain.success)}
								</p>
								<p class="text-muted-foreground">Success</p>
							</div>
							<div class="p-2 bg-muted rounded-md">
								<p class="font-semibold text-yellow-600">
									{formatNumber(domain.pending)}
								</p>
								<p class="text-muted-foreground">Pending</p>
							</div>
							<div class="p-2 bg-muted rounded-md">
								<p class="font-semibold text-red-600">
									{formatNumber(domain.failed + domain.permanently_failed)}
								</p>
								<p class="text-muted-foreground">Failed</p>
							</div>
						</div>

						<div class="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onclick={(e) => {
									e.stopPropagation();
									onTriggerWorkflow(domain);
								}}
								disabled={triggeringDomain === domain.domain ||
									domain.pending === 0}
							>
								{#if triggeringDomain === domain.domain}
									<RefreshCw class="h-4 w-4 mr-1 animate-spin" />
								{:else}
									<Play class="h-4 w-4 mr-1" />
								{/if}
								Trigger
							</Button>
							<a
								href="/admin/catalog/product-details/{domain.domain}/{domain.countryCode}"
								onclick={(e) => e.stopPropagation()}
							>
								<Button variant="ghost" size="sm">
									<ExternalLink class="h-4 w-4 mr-1" />
									Details
								</Button>
							</a>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
