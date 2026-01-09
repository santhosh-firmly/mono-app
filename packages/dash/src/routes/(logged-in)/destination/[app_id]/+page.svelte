<script>
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card/index.js';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		MetricsGrid,
		TopMerchantsCard,
		RevenueChartCard,
		MerchantFilter
	} from '$lib/components/destination/dashboard/index.js';

	let { data } = $props();
	let appId = $derived($page.params.app_id);

	let dashboardData = $state(null);
	let loading = $state(true);
	let error = $state('');
	let selectedMerchant = $state(null);

	$effect(() => {
		fetchDashboardData();
	});

	async function fetchDashboardData() {
		loading = true;
		error = '';

		try {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- URLSearchParams used for fetch URL building, not reactive state
			const params = new URLSearchParams();
			if (selectedMerchant) {
				params.set('merchant', selectedMerchant);
			}
			const queryString = params.toString();
			const url = `/destination/${appId}/api/dashboard${queryString ? `?${queryString}` : ''}`;

			const response = await fetch(url);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch dashboard data');
			}

			dashboardData = result;
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}

	function handleMerchantChange(merchant) {
		selectedMerchant = merchant;
		fetchDashboardData();
	}

	function handleRefresh() {
		fetchDashboardData();
	}

	// Greeting based on time of day
	function getGreeting() {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	}
</script>

<div class="space-y-6">
	<!-- Header with greeting and filter -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-foreground">
				{getGreeting()}{data.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}
			</h1>
			<p class="text-muted-foreground">
				{#if selectedMerchant && dashboardData?.merchants}
					{@const merchantName =
						dashboardData.merchants.find((m) => m.domain === selectedMerchant)
							?.displayName || selectedMerchant}
					Viewing metrics for {merchantName}
				{:else}
					Here's an overview of your destination's performance
				{/if}
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if dashboardData?.merchants?.length > 0}
				<MerchantFilter
					merchants={dashboardData.merchants}
					{selectedMerchant}
					onchange={handleMerchantChange}
				/>
			{/if}
			<Button variant="outline" size="icon" onclick={handleRefresh} disabled={loading}>
				<RefreshCw class={['h-4 w-4', loading ? 'animate-spin' : '']} />
			</Button>
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
		<MetricsGrid
			summary={dashboardData.summary}
			activeMerchants={dashboardData.activeMerchants}
		/>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<RevenueChartCard revenueChart={dashboardData.revenueChart} />
			<TopMerchantsCard topMerchants={dashboardData.topMerchants} {appId} />
		</div>
	{/if}
</div>
