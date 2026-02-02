<script>
	import StatsCard from '$lib/components/merchant/stats-card.svelte';
	import { formatCurrency } from '$lib/currency.js';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import ShoppingBag from 'lucide-svelte/icons/shopping-bag';
	import Activity from 'lucide-svelte/icons/activity';
	import Building2 from 'lucide-svelte/icons/building-2';

	let {
		summary,
		activeMerchants = 0,
		activeDestinations = 0,
		comparisonLabel = 'vs last month',
		selectedPresetLabel = 'This month'
	} = $props();

	let entityLabel = $derived(
		selectedPresetLabel === 'Custom'
			? 'Merchants / Destinations this period'
			: `Merchants / Destinations ${selectedPresetLabel.toLowerCase()}`
	);
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
	<StatsCard
		title="Total Revenue"
		value={formatCurrency(summary?.totalRevenue || 0)}
		change={summary?.revenueChange}
		changeLabel={comparisonLabel}
		icon={DollarSign}
		iconBgColor="bg-green-500/10 dark:bg-green-400/10"
		iconColor="text-green-600 dark:text-green-400"
	/>
	<StatsCard
		title="Total Orders"
		value={(summary?.totalOrders || 0).toLocaleString()}
		change={summary?.ordersChange}
		changeLabel={comparisonLabel}
		icon={ShoppingBag}
		iconBgColor="bg-blue-500/10 dark:bg-blue-400/10"
		iconColor="text-blue-600 dark:text-blue-400"
	/>
	<StatsCard
		title="Avg Order Value"
		value={formatCurrency(summary?.aov || 0)}
		change={summary?.aovChange}
		changeLabel={comparisonLabel}
		icon={Activity}
		iconBgColor="bg-primary/10"
		iconColor="text-primary"
	/>
	<StatsCard
		title="Active Entities"
		value={`${activeMerchants} / ${activeDestinations}`}
		change={null}
		changeLabel={entityLabel}
		icon={Building2}
		iconBgColor="bg-orange-500/10 dark:bg-orange-400/10"
		iconColor="text-orange-600 dark:text-orange-400"
	/>
</div>
