<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatCard from './stat-card.svelte';
	import Database from 'lucide-svelte/icons/database';
	import Package from 'lucide-svelte/icons/package';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Percent from 'lucide-svelte/icons/percent';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Shared/StatCard',
		component: StatCard,
		tags: ['autodocs'],
		parameters: {
			layout: 'centered'
		},
		argTypes: {
			variant: {
				control: 'select',
				options: ['default', 'blue', 'green', 'yellow', 'red', 'purple']
			},
			loading: {
				control: 'boolean'
			}
		}
	});
</script>

{#snippet template(args)}
	<div class="w-64">
		<StatCard {...args} />
	</div>
{/snippet}

<Story
	name="Default"
	args={{
		icon: Database,
		label: 'Domains',
		value: '45',
		variant: 'default'
	}}
	{template}
/>

<Story
	name="Blue Variant"
	args={{
		icon: Package,
		label: 'Products',
		value: '156,000',
		variant: 'blue'
	}}
	{template}
/>

<Story
	name="Green Variant"
	args={{
		icon: CheckCircle,
		label: 'Success',
		value: '142,500',
		variant: 'green'
	}}
	{template}
/>

<Story
	name="Yellow Variant"
	args={{
		icon: Clock,
		label: 'Pending',
		value: '8,500',
		variant: 'yellow'
	}}
	{template}
/>

<Story
	name="Red Variant"
	args={{
		icon: AlertTriangle,
		label: 'Failed',
		value: '1,200',
		variant: 'red'
	}}
	{template}
/>

<Story
	name="Purple Variant"
	args={{
		icon: Percent,
		label: 'Completion',
		value: '94.5%',
		variant: 'purple'
	}}
	{template}
/>

<Story
	name="Loading State"
	args={{
		icon: Database,
		label: 'Domains',
		value: '45',
		variant: 'default',
		loading: true
	}}
	{template}
/>

<Story
	name="Large Numbers"
	args={{
		icon: Package,
		label: 'Total Products',
		value: '1,234,567',
		variant: 'blue'
	}}
	{template}
/>
