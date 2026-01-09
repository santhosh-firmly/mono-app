<script>
	import StatsCard from '$lib/components/merchant/stats-card.svelte';
	import { formatCurrency } from '$lib/currency.js';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import ShoppingBag from 'lucide-svelte/icons/shopping-bag';
	import Activity from 'lucide-svelte/icons/activity';
	import Store from 'lucide-svelte/icons/store';

	let { summary, activeMerchants = 0 } = $props();
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
	<StatsCard
		title="Total Revenue"
		value={formatCurrency(summary?.totalRevenue || 0)}
		change={summary?.revenueChange}
		changeLabel="vs last month"
		icon={DollarSign}
		iconBgColor="bg-green-500/10 dark:bg-green-400/10"
		iconColor="text-green-600 dark:text-green-400"
	/>
	<StatsCard
		title="Total Orders"
		value={(summary?.totalOrders || 0).toLocaleString()}
		change={summary?.ordersChange}
		changeLabel="vs last month"
		icon={ShoppingBag}
		iconBgColor="bg-blue-500/10 dark:bg-blue-400/10"
		iconColor="text-blue-600 dark:text-blue-400"
	/>
	<StatsCard
		title="Avg Order Value"
		value={formatCurrency(summary?.aov || 0)}
		change={summary?.aovChange}
		changeLabel="vs last month"
		icon={Activity}
		iconBgColor="bg-primary/10"
		iconColor="text-primary"
	/>
	<StatsCard
		title="Active Merchants"
		value={activeMerchants.toString()}
		change={null}
		changeLabel="With orders this month"
		icon={Store}
		iconBgColor="bg-orange-500/10 dark:bg-orange-400/10"
		iconColor="text-orange-600 dark:text-orange-400"
	/>
</div>
