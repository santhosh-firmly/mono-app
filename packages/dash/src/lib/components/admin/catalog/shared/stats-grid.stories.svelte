<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatsGrid from './stats-grid.svelte';
	import Database from 'lucide-svelte/icons/database';
	import Package from 'lucide-svelte/icons/package';
	import CheckCircle from 'lucide-svelte/icons/check-circle';
	import Clock from 'lucide-svelte/icons/clock';
	import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
	import Percent from 'lucide-svelte/icons/percent';

	const { Story } = defineMeta({
		title: 'Admin/Catalog/Shared/StatsGrid',
		component: StatsGrid,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			columns: {
				control: 'select',
				options: [3, 4, 5, 6]
			},
			loading: {
				control: 'boolean'
			}
		}
	});

	const sixStats = [
		{ icon: Database, label: 'Domains', value: '45', variant: 'default' },
		{ icon: Package, label: 'Products', value: '156,000', variant: 'blue' },
		{ icon: CheckCircle, label: 'Success', value: '142,500', variant: 'green' },
		{ icon: Clock, label: 'Pending', value: '8,500', variant: 'yellow' },
		{ icon: AlertTriangle, label: 'Failed', value: '1,200', variant: 'red' },
		{ icon: Percent, label: 'Completion', value: '94.5%', variant: 'purple' }
	];

	const fourStats = [
		{ icon: Database, label: 'Domains', value: '45', variant: 'default' },
		{ icon: Package, label: 'Products', value: '156,000', variant: 'blue' },
		{ icon: Clock, label: 'Running', value: '3', variant: 'yellow' },
		{ icon: CheckCircle, label: 'Completed', value: '210', variant: 'green' }
	];

	const threeStats = [
		{ icon: Package, label: 'Total', value: '45,000', variant: 'default' },
		{ icon: Clock, label: 'Pending', value: '1,200', variant: 'yellow' },
		{ icon: AlertTriangle, label: 'Errors', value: '34', variant: 'red' }
	];
</script>

{#snippet template(args)}
	<StatsGrid {...args} />
{/snippet}

<Story name="Six Columns" args={{ stats: sixStats, columns: 6 }} {template} />

<Story name="Four Columns" args={{ stats: fourStats, columns: 4 }} {template} />

<Story name="Three Columns" args={{ stats: threeStats, columns: 3 }} {template} />

<Story name="Loading State" args={{ stats: sixStats, columns: 6, loading: true }} {template} />
