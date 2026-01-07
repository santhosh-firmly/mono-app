<script>
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import DashboardHeader from './dashboard-header.svelte';
	import MetricsGrid from './metrics-grid.svelte';
	import RevenueChartCard from './revenue-chart-card.svelte';
	import OrdersByDestinationCard from './orders-by-destination-card.svelte';
	import DestinationPerformanceCard from './destination-performance-card.svelte';
	import TopProductsCard from './top-products-card.svelte';
	import RecentOrdersCard from './recent-orders-card.svelte';

	let { dashboardData, userName = '' } = $props();
</script>

<div class="space-y-6">
	<DashboardHeader {userName} />

	<MetricsGrid
		summary={dashboardData.summary}
		activeDestinations={dashboardData.activeDestinations}
	/>

	<Tabs.Root value="overview" class="space-y-6">
		<Tabs.List>
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="destinations">Destinations</Tabs.Trigger>
			<Tabs.Trigger value="products">Top Products</Tabs.Trigger>
			<Tabs.Trigger value="orders">Recent Orders</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="overview" class="space-y-6">
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RevenueChartCard revenueChart={dashboardData.revenueChart} />
				<OrdersByDestinationCard destinationChart={dashboardData.destinationChart} />
			</div>
		</Tabs.Content>

		<Tabs.Content value="destinations">
			<DestinationPerformanceCard destinationChart={dashboardData.destinationChart} />
		</Tabs.Content>

		<Tabs.Content value="products">
			<TopProductsCard topProducts={dashboardData.topProducts} />
		</Tabs.Content>

		<Tabs.Content value="orders">
			<RecentOrdersCard recentOrders={dashboardData.recentOrders} />
		</Tabs.Content>
	</Tabs.Root>
</div>
