<script>
	import Cross2 from 'svelte-radix/Cross2.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import DataTableViewOptions from './data-table-view-options.svelte';

	export let tableModel;
	export let columnFilters;
	export let data;

	const counts = data.reduce(
		(acc, { platform_id, psp }) => {
			acc.platform[platform_id] = (acc.platform[platform_id] || 0) + 1;
			acc.psp[psp] = (acc.psp[psp] || 0) + 1;
			return acc;
		},
		{
			platform: {},
			psp: {}
		}
	);

	const { pluginStates } = tableModel;
	const { filterValue } = pluginStates.filter;

	const { filterValues } = pluginStates.colFilter;

	$: showReset = Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0);
</script>

<div class="flex items-center justify-between">
	<div class="flex flex-1 items-center space-x-2">
		<Input
			placeholder="Filter merchants..."
			class="h-8 w-[150px] lg:w-[250px]"
			type="search"
			bind:value={$filterValue}
		/>

		<DataTableFacetedFilter
			bind:filterValues={$filterValues.platform}
			title="Platform"
			options={columnFilters.platform_id}
			counts={counts.platform}
		/>
		<DataTableFacetedFilter
			bind:filterValues={$filterValues.psp}
			title="PSP"
			options={columnFilters.psp}
			counts={counts.psp}
		/>
		{#if showReset}
			<Button
				on:click={() => {
					$filterValue = '';
					$filterValues.platform = [];
					$filterValues.psp = [];
				}}
				variant="ghost"
				class="h-8 px-2 lg:px-3"
			>
				Reset
				<Cross2 class="ml-2 h-4 w-4" />
			</Button>
		{/if}
	</div>

	<DataTableViewOptions {tableModel} />
</div>
