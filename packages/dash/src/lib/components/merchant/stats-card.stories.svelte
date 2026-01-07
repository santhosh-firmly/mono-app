<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatsCard from './stats-card.svelte';
	import DollarSign from 'lucide-svelte/icons/dollar-sign';
	import ShoppingBag from 'lucide-svelte/icons/shopping-bag';
	import Activity from 'lucide-svelte/icons/activity';
	import Store from 'lucide-svelte/icons/store';

	const { Story } = defineMeta({
		title: 'Merchant/Dashboard/Stats Card',
		component: StatsCard,
		tags: ['autodocs'],
		argTypes: {
			title: { control: 'text' },
			value: { control: 'text' },
			change: { control: 'number' },
			changeLabel: { control: 'text' },
			iconBgColor: { control: 'text' },
			iconColor: { control: 'text' }
		}
	});
</script>

<Story
	name="Positive Change"
	args={{
		title: 'Total Revenue',
		value: '$12,450.00',
		change: 12.5,
		changeLabel: 'vs last month',
		icon: DollarSign,
		iconBgColor: 'bg-green-100',
		iconColor: 'text-green-600'
	}}
/>

<Story
	name="Negative Change"
	args={{
		title: 'Total Orders',
		value: '156',
		change: -8.3,
		changeLabel: 'vs last month',
		icon: ShoppingBag,
		iconBgColor: 'bg-blue-100',
		iconColor: 'text-blue-600'
	}}
/>

<Story
	name="Zero Change (Neutral)"
	args={{
		title: 'Avg Order Value',
		value: '$43.00',
		change: 0,
		changeLabel: 'vs last month',
		icon: Activity,
		iconBgColor: 'bg-purple-100',
		iconColor: 'text-purple-600'
	}}
/>

<Story
	name="No Change Data"
	args={{
		title: 'Active Destinations',
		value: '5',
		change: null,
		changeLabel: 'Platforms with orders',
		icon: Store,
		iconBgColor: 'bg-orange-100',
		iconColor: 'text-orange-600'
	}}
/>

<Story name="All Variants">
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
		<StatsCard
			title="Total Revenue"
			value="$12,450.00"
			change={12.5}
			changeLabel="vs last month"
			icon={DollarSign}
			iconBgColor="bg-green-100"
			iconColor="text-green-600"
		/>
		<StatsCard
			title="Total Orders"
			value="156"
			change={-8.3}
			changeLabel="vs last month"
			icon={ShoppingBag}
			iconBgColor="bg-blue-100"
			iconColor="text-blue-600"
		/>
		<StatsCard
			title="Avg Order Value"
			value="$43.00"
			change={0}
			changeLabel="vs last month"
			icon={Activity}
			iconBgColor="bg-purple-100"
			iconColor="text-purple-600"
		/>
		<StatsCard
			title="Active Destinations"
			value="5"
			change={null}
			changeLabel="Platforms with orders"
			icon={Store}
			iconBgColor="bg-orange-100"
			iconColor="text-orange-600"
		/>
	</div>
</Story>
