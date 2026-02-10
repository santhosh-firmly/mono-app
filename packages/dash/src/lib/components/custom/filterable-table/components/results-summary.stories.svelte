<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ResultsSummary from './results-summary.svelte';

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/ResultsSummary',
		component: ResultsSummary,
		tags: ['autodocs']
	});
</script>

<script>
	let totalCount = $state(100);
	let filteredCount = $state(100);
	let hasActiveFilters = $state(false);

	function applyFilter() {
		filteredCount = Math.floor(Math.random() * totalCount);
		hasActiveFilters = true;
	}

	function clearAll() {
		filteredCount = totalCount;
		hasActiveFilters = false;
		console.log('Filters cleared!');
	}
</script>

<Story
	name="All Items Shown (No Filters)"
	args={{
		totalCount: 100,
		filteredCount: 100,
		hasActiveFilters: false,
		onClearAll: () => console.log('Clear all clicked')
	}}
/>

<Story
	name="Filtered Results"
	args={{
		totalCount: 100,
		filteredCount: 25,
		hasActiveFilters: true,
		onClearAll: () => console.log('Clear all clicked')
	}}
/>

<Story
	name="Heavily Filtered"
	args={{
		totalCount: 1000,
		filteredCount: 5,
		hasActiveFilters: true,
		onClearAll: () => console.log('Clear all clicked')
	}}
/>

<Story
	name="No Results"
	args={{
		totalCount: 100,
		filteredCount: 0,
		hasActiveFilters: true,
		onClearAll: () => console.log('Clear all clicked')
	}}
/>

<Story
	name="Single Item"
	args={{
		totalCount: 1,
		filteredCount: 1,
		hasActiveFilters: false,
		onClearAll: () => console.log('Clear all clicked')
	}}
/>

<Story
	name="Small Dataset"
	args={{
		totalCount: 5,
		filteredCount: 3,
		hasActiveFilters: true,
		onClearAll: () => console.log('Clear all clicked')
	}}
/>

<Story name="Interactive Example" asChild>
	<div class="flex flex-col gap-4 p-4">
		<div class="flex gap-2">
			<button
				class="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
				onclick={applyFilter}
			>
				Apply Random Filter
			</button>
			<button
				class="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				onclick={clearAll}
			>
				Clear Manually
			</button>
		</div>

		<ResultsSummary {totalCount} {filteredCount} {hasActiveFilters} onClearAll={clearAll} />
	</div>
</Story>
