<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TableBody from './table-body.svelte';
	import Eye from 'lucide-svelte/icons/eye';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash-2';

	const basicColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'status', name: 'Status', center: true }
	];

	const mockData = [
		{ id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
		{ id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
		{ id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'active' }
	];

	const mockDataWithActions = mockData.map((item) => ({
		...item,
		actions: [
			{
				label: 'View',
				icon: Eye,
				execute: (item) => console.log('Viewing', item)
			},
			{
				label: 'Edit',
				icon: Pencil,
				execute: (item) => console.log('Editing', item)
			},
			{
				label: 'Delete',
				icon: Trash2,
				execute: (item) => console.log('Deleting', item)
			}
		]
	}));

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/TableBody',
		component: TableBody,
		tags: ['autodocs']
	});
</script>

<Story name="Basic Rows" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={mockData}
				columns={basicColumns}
				showActions={false}
				loading={false}
				emptyMessage="No data found"
				visibleColumnsCount={4}
				onclick={(item, index) => console.log('Clicked:', item, 'at index', index)}
			/>
		</table>
	</div>
</Story>

<Story name="With Row Actions" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={mockDataWithActions}
				columns={basicColumns}
				showActions={true}
				loading={false}
				emptyMessage="No data found"
				visibleColumnsCount={4}
				onclick={(item, index) => console.log('Clicked:', item, 'at index', index)}
			/>
		</table>
	</div>
</Story>

<Story name="Loading State" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={[]}
				columns={basicColumns}
				showActions={false}
				loading={true}
				emptyMessage="No data found"
				visibleColumnsCount={4}
			/>
		</table>
	</div>
</Story>

<Story name="Empty State" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={[]}
				columns={basicColumns}
				showActions={false}
				loading={false}
				emptyMessage="No users found"
				visibleColumnsCount={4}
			/>
		</table>
	</div>
</Story>

<Story name="Single Row" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={mockData.slice(0, 1)}
				columns={basicColumns}
				showActions={false}
				loading={false}
				emptyMessage="No data found"
				visibleColumnsCount={4}
			/>
		</table>
	</div>
</Story>

<Story name="With Custom Row Class" asChild>
	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={mockData}
				columns={basicColumns}
				showActions={false}
				loading={false}
				emptyMessage="No data found"
				visibleColumnsCount={4}
				rowClass={(item) => {
					return item.status === 'active' ? 'bg-green-50' : 'bg-red-50';
				}}
			/>
		</table>
	</div>
</Story>

<Story name="With Custom Cell View" asChild>
	{#snippet statusCell(item, index, data)}
		<td
			class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 text-center align-middle group-hover:bg-slate-100"
		>
			<span
				class="inline-block rounded-full px-2 py-1 text-xs font-semibold"
				class:bg-green-100={item.status === 'active'}
				class:text-green-800={item.status === 'active'}
				class:bg-red-100={item.status === 'inactive'}
				class:text-red-800={item.status === 'inactive'}
			>
				{item.status}
			</span>
		</td>
	{/snippet}

	{@const columnsWithCustomView = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'status', name: 'Status', center: true, cellView: statusCell }
	]}

	<div class="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
		<table class="w-full border-collapse text-left text-sm">
			<TableBody
				data={mockData}
				columns={columnsWithCustomView}
				showActions={false}
				loading={false}
				emptyMessage="No data found"
				visibleColumnsCount={4}
			/>
		</table>
	</div>
</Story>
