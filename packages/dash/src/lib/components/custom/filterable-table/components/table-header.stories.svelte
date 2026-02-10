<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TableHeader from './table-header.svelte';

	const basicColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'status', name: 'Status', center: true }
	];

	const extendedColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'role', name: 'Role' },
		{ id: 'department', name: 'Department' },
		{ id: 'status', name: 'Status', center: true },
		{ id: 'joinDate', name: 'Join Date' },
		{ id: 'location', name: 'Location' }
	];

	const mockData = [
		{
			id: 1,
			name: 'John Doe',
			email: 'john@example.com',
			status: 'active',
			role: 'Admin',
			department: 'Engineering',
			joinDate: '2023-01-15',
			location: 'New York'
		},
		{
			id: 2,
			name: 'Jane Smith',
			email: 'jane@example.com',
			status: 'inactive',
			role: 'Manager',
			department: 'Sales',
			joinDate: '2022-06-20',
			location: 'San Francisco'
		}
	];

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/TableHeader',
		component: TableHeader,
		tags: ['autodocs']
	});
</script>

<script>
	let sortColumn = $state(null);
	let sortDirection = $state('asc');

	function handleSort(columnId) {
		if (sortColumn === columnId) {
			if (sortDirection === 'asc') {
				sortDirection = 'desc';
			} else {
				sortColumn = null;
				sortDirection = 'asc';
			}
		} else {
			sortColumn = columnId;
			sortDirection = 'asc';
		}
		console.log('Sorted:', columnId, sortDirection);
	}
</script>

<Story name="Basic Header" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableHeader
				columns={basicColumns}
				data={mockData}
				showActions={false}
				sortColumn={null}
				sortDirection="asc"
				onSort={(columnId) => console.log('Sort:', columnId)}
			/>
		</table>
	</div>
</Story>

<Story name="With Actions Column" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableHeader
				columns={basicColumns}
				data={mockData}
				showActions={true}
				sortColumn={null}
				sortDirection="asc"
				onSort={(columnId) => console.log('Sort:', columnId)}
			/>
		</table>
	</div>
</Story>

<Story name="Sorted by Name (Asc)" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableHeader
				columns={basicColumns}
				data={mockData}
				showActions={false}
				sortColumn="name"
				sortDirection="asc"
				onSort={(columnId) => console.log('Sort:', columnId)}
			/>
		</table>
	</div>
</Story>

<Story name="Sorted by Name (Desc)" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableHeader
				columns={basicColumns}
				data={mockData}
				showActions={false}
				sortColumn="name"
				sortDirection="desc"
				onSort={(columnId) => console.log('Sort:', columnId)}
			/>
		</table>
	</div>
</Story>

<Story name="Extended Columns" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableHeader
				columns={extendedColumns}
				data={mockData}
				showActions={true}
				sortColumn="department"
				sortDirection="asc"
				onSort={(columnId) => console.log('Sort:', columnId)}
			/>
		</table>
	</div>
</Story>

<Story name="Interactive Sorting" asChild>
	<div class="flex flex-col gap-4 p-4">
		<div class="text-sm text-gray-600">
			{#if sortColumn}
				Sorted by: <strong>{sortColumn}</strong> ({sortDirection})
			{:else}
				No sorting applied
			{/if}
		</div>

		<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
			<table class="w-full border-collapse text-left text-sm">
				<TableHeader
					columns={extendedColumns}
					data={mockData}
					showActions={false}
					{sortColumn}
					{sortDirection}
					onSort={handleSort}
				/>
			</table>
		</div>
	</div>
</Story>
