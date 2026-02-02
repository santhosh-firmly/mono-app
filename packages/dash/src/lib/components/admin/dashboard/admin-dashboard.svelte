<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import MetricsGrid from './metrics-grid.svelte';
	import DashboardFilters from './dashboard-filters.svelte';
	import RevenueChartCard from './revenue-chart-card.svelte';
	import TopMerchantsCard from './top-merchants-card.svelte';
	import TopDestinationsCard from './top-destinations-card.svelte';
	import TopProductsCard from './top-products-card.svelte';
	import { DateRangePicker } from '$lib/components/ui/date-range-picker/index.js';

	/**
	 * @type {{
	 *   dashboardData: object | null,
	 *   loading: boolean,
	 *   error: string,
	 *   dateRange?: { start: Date | null, end: Date | null },
	 *   comparisonLabel?: string,
	 *   selectedPresetLabel?: string,
	 *   selectedMerchants?: string[],
	 *   selectedDestinations?: string[],
	 *   onRefresh?: () => void,
	 *   onDateRangeSelect?: (range: { start: Date | null, end: Date | null }) => void
	 * }}
	 */
	let {
		dashboardData = null,
		loading = false,
		error = '',
		dateRange = { start: null, end: null },
		comparisonLabel = 'vs last month',
		selectedPresetLabel = 'This month',
		selectedMerchants = $bindable([]),
		selectedDestinations = $bindable([]),
		onRefresh,
		onDateRangeSelect
	} = $props();

	function handleRefresh() {
		if (onRefresh) {
			onRefresh();
		}
	}
</script>

<div class="space-y-6">
	<!-- Header row with filters and refresh button -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h2 class="text-lg font-semibold text-foreground">Overview</h2>
			<p class="text-sm text-muted-foreground">
				{#if selectedMerchants.length > 0 || selectedDestinations.length > 0}
					Filtered view
					{#if selectedMerchants.length > 0}
						({selectedMerchants.length} merchant{selectedMerchants.length > 1
							? 's'
							: ''})
					{/if}
					{#if selectedDestinations.length > 0}
						({selectedDestinations.length} destination{selectedDestinations.length > 1
							? 's'
							: ''})
					{/if}
				{:else}
					Showing all merchants and destinations
				{/if}
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if dashboardData}
				<DashboardFilters
					merchants={dashboardData.merchants || []}
					destinations={dashboardData.destinations || []}
					bind:selectedMerchants
					bind:selectedDestinations
				/>
			{/if}
			<Button variant="outline" size="icon" onclick={handleRefresh} disabled={loading}>
				<RefreshCw class={['h-4 w-4', loading ? 'animate-spin' : '']} />
			</Button>
			<DateRangePicker
				value={dateRange}
				maxDate={new Date()}
				showNavigation
				onSelect={(range) => onDateRangeSelect?.(range)}
			/>
		</div>
	</div>

	{#if loading && !dashboardData}
		<div class="flex items-center justify-center py-12">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if error}
		<Card.Root>
			<Card.Content class="py-12 text-center text-red-600">
				{error}
			</Card.Content>
		</Card.Root>
	{:else if dashboardData}
		<!-- Metrics Grid -->
		<MetricsGrid
			summary={dashboardData.summary}
			activeMerchants={dashboardData.activeMerchants}
			activeDestinations={dashboardData.activeDestinations}
			{comparisonLabel}
			{selectedPresetLabel}
		/>

		<!-- Row 1: Revenue Chart + Top Destinations -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<RevenueChartCard revenueChart={dashboardData.revenueChart} />
			<TopDestinationsCard topDestinations={dashboardData.topDestinations} />
		</div>

		<!-- Row 2: Top Merchants + Top Products -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<TopMerchantsCard topMerchants={dashboardData.topMerchants} />
			<TopProductsCard topProducts={dashboardData.topProducts} />
		</div>
	{/if}
</div>
