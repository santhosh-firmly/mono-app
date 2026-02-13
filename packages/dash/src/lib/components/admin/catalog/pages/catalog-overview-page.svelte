<script>
	import { SvelteSet } from 'svelte/reactivity';
	import Database from 'lucide-svelte/icons/database';
	import Package from 'lucide-svelte/icons/package';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Percent from 'lucide-svelte/icons/percent';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Plus from 'lucide-svelte/icons/plus';
	import Play from 'lucide-svelte/icons/play';
	import Search from 'lucide-svelte/icons/search';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import PageHeader from '$lib/components/app/page-header.svelte';

	import { StatsGrid, SelectionBar, DomainTable, PageErrorAlert } from '../shared/index.js';

	let {
		pdStats = null,
		runningWorkflows = null,
		loading = false,
		error = null,
		onRefresh = () => {},
		onAddDomain = async () => {},
		onRunPipeline = async () => {},
		onDismissError = () => {}
	} = $props();

	// Local state
	let newDomain = $state('');
	let addingDomain = $state(false);
	let searchQuery = $state('');
	let selectedDomains = new SvelteSet();

	// Derived stats
	let totalDomains = $derived(pdStats?.total_domains || 0);
	let totalProducts = $derived(pdStats?.aggregate?.total_products || 0);
	let pdPending = $derived(pdStats?.aggregate?.pending || 0);
	let pdSuccess = $derived(pdStats?.aggregate?.success || 0);
	let pdFailed = $derived(pdStats?.aggregate?.failed || 0);
	let pdPermanentlyFailed = $derived(pdStats?.aggregate?.permanently_failed || 0);
	let pdCompletionPercent = $derived(pdStats?.aggregate?.completion_percent || 0);

	// All domains from stats
	let allDomains = $derived(pdStats?.domains || []);

	// Filtered domains
	let filteredDomains = $derived.by(() => {
		if (!searchQuery.trim()) return allDomains;
		const query = searchQuery.toLowerCase();
		return allDomains.filter((d) => d.domain.toLowerCase().includes(query));
	});

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
			icon: CheckCircle,
			label: 'Success',
			value: formatNumber(pdSuccess),
			variant: 'green'
		},
		{
			icon: Clock,
			label: 'Pending',
			value: formatNumber(pdPending),
			variant: 'yellow'
		},
		{
			icon: AlertTriangle,
			label: 'Failed',
			value: formatNumber(pdFailed + pdPermanentlyFailed),
			variant: 'red'
		},
		{
			icon: Percent,
			label: 'Completion',
			value: `${pdCompletionPercent}%`,
			variant: 'purple'
		}
	]);

	async function handleAddDomain() {
		if (!newDomain.trim()) return;
		addingDomain = true;

		try {
			await onAddDomain(newDomain.trim());
			newDomain = '';
		} finally {
			addingDomain = false;
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

	function handleSelectAll() {
		const allSelected =
			filteredDomains.length > 0 &&
			filteredDomains.every((d) => selectedDomains.has(`${d.domain}/${d.countryCode}`));

		if (allSelected) {
			for (const d of filteredDomains) {
				selectedDomains.delete(`${d.domain}/${d.countryCode}`);
			}
		} else {
			for (const d of filteredDomains) {
				selectedDomains.add(`${d.domain}/${d.countryCode}`);
			}
		}
	}

	async function handleRunPipeline() {
		await onRunPipeline(Array.from(selectedDomains));
		selectedDomains.clear();
	}

	function formatNumber(num) {
		return num?.toLocaleString() ?? '0';
	}
</script>

<div class="flex flex-col gap-6 p-4 sm:px-6">
	<PageHeader
		title="Catalog Engine"
		description="Monitor and manage product data pipelines across all domains"
	/>

	<PageErrorAlert {error} onDismiss={onDismissError} />

	<!-- Stats Overview -->
	<section>
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold">Overview</h2>
			<Button variant="outline" size="sm" onclick={onRefresh} disabled={loading}>
				<RefreshCw class="h-4 w-4 mr-2 {loading ? 'animate-spin' : ''}" />
				{loading ? 'Refreshing...' : 'Refresh'}
			</Button>
		</div>

		<StatsGrid stats={overviewStats} columns={6} {loading} />
	</section>

	<!-- Running Workflows -->
	{#if runningWorkflows && runningWorkflows.total > 0}
		<section>
			<h2 class="text-lg font-semibold mb-4">
				Running Workflows
				<span class="font-normal text-muted-foreground"
					>({runningWorkflows.total} active)</span
				>
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each runningWorkflows.workflows as workflow (`${workflow.domain}/${workflow.countryCode}`)}
					<Card.Root class="border-l-4 border-l-primary">
						<Card.Content class="pt-6">
							<div class="flex items-center justify-between mb-3">
								<a
									href="/admin/catalog/product-details/{workflow.domain}/{workflow.countryCode}"
									class="font-semibold text-primary hover:underline"
								>
									{workflow.domain}
								</a>
								<Badge variant="secondary" class="capitalize">
									{workflow.workflow_type?.replace('-', ' ') ?? 'processing'}
								</Badge>
							</div>
							{#if workflow.total_products && workflow.processed !== undefined}
								<div class="space-y-2">
									<div class="flex justify-between text-sm text-muted-foreground">
										<span
											>{formatNumber(workflow.processed)} / {formatNumber(
												workflow.total_products
											)}</span
										>
										<span
											>{Math.round(
												(workflow.processed / workflow.total_products) * 100
											)}%</span
										>
									</div>
									<Progress
										value={(workflow.processed / workflow.total_products) * 100}
									/>
								</div>
							{:else}
								<p class="text-sm text-muted-foreground">Processing...</p>
							{/if}
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Quick Add Domain -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Add New Domain</Card.Title>
			<Card.Description
				>Start a full pipeline: Catalog sync, Product sync, Product details fetch</Card.Description
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
					{addingDomain ? 'Adding...' : 'Add & Start'}
				</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<!-- All Domains -->
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
			</div>
		</div>

		<SelectionBar
			selectedCount={selectedDomains.size}
			totalCount={allDomains.length}
			onClear={() => selectedDomains.clear()}
		>
			<Button variant="secondary" size="sm" onclick={handleRunPipeline}>
				<Play class="h-4 w-4 mr-1" />
				Run Pipeline
			</Button>
		</SelectionBar>

		<p class="text-sm text-muted-foreground mb-3">
			Showing {filteredDomains.length} of {allDomains.length} domains
		</p>

		{#if loading}
			<Card.Root>
				<Card.Content class="py-8 text-center text-muted-foreground">
					<RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2" />
					Loading domains...
				</Card.Content>
			</Card.Root>
		{:else if filteredDomains.length === 0}
			<Card.Root>
				<Card.Content class="py-8 text-center text-muted-foreground">
					No domains found
				</Card.Content>
			</Card.Root>
		{:else}
			<DomainTable
				domains={filteredDomains}
				{selectedDomains}
				onSelect={toggleDomain}
				onSelectAll={handleSelectAll}
				showSelection={true}
				showProgress={true}
			/>
		{/if}
	</section>
</div>
