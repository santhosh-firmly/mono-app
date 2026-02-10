<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FilterToolbar from './filter-toolbar.svelte';

	const mockColumns = [
		{ id: 'id', name: 'ID' },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'age', name: 'Age' },
		{
			id: 'status',
			name: 'Status',
			filterType: 'select',
			filterOptions: ['active', 'inactive', 'pending']
		},
		{ id: 'department', name: 'Department', filterType: 'select' },
		{ id: 'verified', name: 'Verified' },
		{ id: 'location', name: 'Location' }
	];

	const mockData = [
		{
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
			age: 30,
			status: 'active',
			department: 'Engineering',
			verified: true,
			location: 'New York'
		},
		{
			id: 2,
			name: 'Jane Smith',
			email: 'jane@example.com',
			age: 25,
			status: 'inactive',
			department: 'Sales',
			verified: false,
			location: 'San Francisco'
		},
		{
			id: 3,
			name: 'Bob Johnson',
			email: 'bob@example.com',
			age: 35,
			status: 'active',
			department: 'Engineering',
			verified: true,
			location: 'Austin'
		},
		{
			id: 4,
			name: 'Alice Williams',
			email: 'alice@example.com',
			age: 28,
			status: 'pending',
			department: 'Product',
			verified: false,
			location: 'Seattle'
		},
		{
			id: 5,
			name: 'Charlie Brown',
			email: 'charlie@example.com',
			age: 42,
			status: 'active',
			department: 'Marketing',
			verified: true,
			location: 'Boston'
		}
	];

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/FilterToolbar',
		component: FilterToolbar,
		tags: ['autodocs']
	});
</script>

<script>
	let noFiltersActive = $state([]);
	let noFiltersSearch = $state('');

	let withFiltersActive = $state([
		{
			columnId: 'status',
			columnName: 'Status',
			condition: 'in',
			values: ['active', 'pending']
		},
		{
			columnId: 'age',
			columnName: 'Age',
			condition: 'greater_than',
			value: 25
		}
	]);
	let withFiltersSearch = $state('');

	let searchOnlyActive = $state([]);
	let searchOnlyText = $state('Engineering');

	let combinedActive = $state([
		{
			columnId: 'status',
			columnName: 'Status',
			condition: 'in',
			values: ['active']
		}
	]);
	let combinedSearch = $state('John');

	let manyFiltersActive = $state([
		{
			columnId: 'status',
			columnName: 'Status',
			condition: 'in',
			values: ['active', 'pending']
		},
		{ columnId: 'age', columnName: 'Age', condition: 'greater_than', value: 25 },
		{ columnId: 'verified', columnName: 'Verified', condition: 'equals', value: true },
		{ columnId: 'name', columnName: 'Name', condition: 'contains', value: 'o' }
	]);
	let manyFiltersSearch = $state('');

	let overflowActive = $state([]);
	let overflowSearch = $state('');

	function handleFilterApply(filterData, editingFilter, activeFiltersRef) {
		console.log('Apply filter:', filterData);
		if (editingFilter) {
			return activeFiltersRef.map((f) => (f === editingFilter ? filterData : f));
		} else {
			return [...activeFiltersRef, filterData];
		}
	}

	function handleFilterRemove(filter, activeFiltersRef) {
		console.log('Remove filter:', filter);
		return activeFiltersRef.filter((f) => f !== filter);
	}

	function handleClearAll() {
		console.log('Clear all filters');
		return { filters: [], search: '' };
	}
</script>

<Story name="No Active Filters" asChild>
	<div class="p-4">
		<FilterToolbar
			columns={mockColumns}
			data={mockData}
			bind:activeFilters={noFiltersActive}
			bind:globalSearchText={noFiltersSearch}
			filteredCount={mockData.length}
			totalCount={mockData.length}
			onFilterApply={(filterData, editingFilter) => {
				noFiltersActive = handleFilterApply(filterData, editingFilter, noFiltersActive);
			}}
			onFilterRemove={(filter) => {
				noFiltersActive = handleFilterRemove(filter, noFiltersActive);
			}}
			onClearAll={() => {
				const result = handleClearAll();
				noFiltersActive = result.filters;
				noFiltersSearch = result.search;
			}}
		/>
	</div>
</Story>

<Story name="With Active Filters" asChild>
	<div class="p-4">
		<FilterToolbar
			columns={mockColumns}
			data={mockData}
			bind:activeFilters={withFiltersActive}
			bind:globalSearchText={withFiltersSearch}
			filteredCount={3}
			totalCount={mockData.length}
			onFilterApply={(filterData, editingFilter) => {
				withFiltersActive = handleFilterApply(filterData, editingFilter, withFiltersActive);
			}}
			onFilterRemove={(filter) => {
				withFiltersActive = handleFilterRemove(filter, withFiltersActive);
			}}
			onClearAll={() => {
				const result = handleClearAll();
				withFiltersActive = result.filters;
				withFiltersSearch = result.search;
			}}
		/>
	</div>
</Story>

<Story name="With Global Search" asChild>
	<div class="p-4">
		<FilterToolbar
			columns={mockColumns}
			data={mockData}
			bind:activeFilters={searchOnlyActive}
			bind:globalSearchText={searchOnlyText}
			filteredCount={2}
			totalCount={mockData.length}
			onFilterApply={(filterData, editingFilter) => {
				searchOnlyActive = handleFilterApply(filterData, editingFilter, searchOnlyActive);
			}}
			onFilterRemove={(filter) => {
				searchOnlyActive = handleFilterRemove(filter, searchOnlyActive);
			}}
			onClearAll={() => {
				const result = handleClearAll();
				searchOnlyActive = result.filters;
				searchOnlyText = result.search;
			}}
		/>
	</div>
</Story>

<Story name="Combined: Search + Filters" asChild>
	<div class="p-4">
		<FilterToolbar
			columns={mockColumns}
			data={mockData}
			bind:activeFilters={combinedActive}
			bind:globalSearchText={combinedSearch}
			filteredCount={1}
			totalCount={mockData.length}
			onFilterApply={(filterData, editingFilter) => {
				combinedActive = handleFilterApply(filterData, editingFilter, combinedActive);
			}}
			onFilterRemove={(filter) => {
				combinedActive = handleFilterRemove(filter, combinedActive);
			}}
			onClearAll={() => {
				const result = handleClearAll();
				combinedActive = result.filters;
				combinedSearch = result.search;
			}}
		/>
	</div>
</Story>

<Story name="Many Active Filters" asChild>
	<div class="p-4">
		<FilterToolbar
			columns={mockColumns}
			data={mockData}
			bind:activeFilters={manyFiltersActive}
			bind:globalSearchText={manyFiltersSearch}
			filteredCount={1}
			totalCount={mockData.length}
			onFilterApply={(filterData, editingFilter) => {
				manyFiltersActive = handleFilterApply(filterData, editingFilter, manyFiltersActive);
			}}
			onFilterRemove={(filter) => {
				manyFiltersActive = handleFilterRemove(filter, manyFiltersActive);
			}}
			onClearAll={() => {
				const result = handleClearAll();
				manyFiltersActive = result.filters;
				manyFiltersSearch = result.search;
			}}
		/>
	</div>
</Story>

<Story name="Narrow Container (Overflow)" asChild>
	<div class="max-w-md p-4">
		<p class="mb-4 text-sm text-gray-600">
			Notice how filter buttons overflow into "More Filters" dropdown
		</p>
		<FilterToolbar
			columns={mockColumns}
			data={mockData}
			bind:activeFilters={overflowActive}
			bind:globalSearchText={overflowSearch}
			filteredCount={mockData.length}
			totalCount={mockData.length}
			onFilterApply={(filterData, editingFilter) => {
				overflowActive = handleFilterApply(filterData, editingFilter, overflowActive);
			}}
			onFilterRemove={(filter) => {
				overflowActive = handleFilterRemove(filter, overflowActive);
			}}
			onClearAll={() => {
				const result = handleClearAll();
				overflowActive = result.filters;
				overflowSearch = result.search;
			}}
		/>
	</div>
</Story>
