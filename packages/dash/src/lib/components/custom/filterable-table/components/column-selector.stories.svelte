<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ColumnSelector from './column-selector.svelte';

	let visibleColumns = $state(['id', 'name', 'email', 'status']);
	let isOpen = $state(false);

	const mockColumns = [
		{ id: 'id', name: 'ID' },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'status', name: 'Status' },
		{ id: 'role', name: 'Role' },
		{ id: 'department', name: 'Department' },
		{ id: 'joinDate', name: 'Join Date' },
		{ id: 'location', name: 'Location' }
	];

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/ColumnSelector',
		component: ColumnSelector,
		tags: ['autodocs']
	});
</script>

<Story
	name="All Columns Selected"
	args={{
		show: true,
		columns: mockColumns,
		visibleColumns: mockColumns.map((c) => c.id),
		onClose: () => console.log('Close clicked')
	}}
/>

<Story
	name="Some Columns Selected"
	args={{
		show: true,
		columns: mockColumns,
		visibleColumns: ['id', 'name', 'email', 'status'],
		onClose: () => console.log('Close clicked')
	}}
/>

<Story
	name="Few Columns"
	args={{
		show: true,
		columns: mockColumns.slice(0, 4),
		visibleColumns: ['id', 'name', 'email'],
		onClose: () => console.log('Close clicked')
	}}
/>

<Story
	name="Closed State"
	args={{
		show: false,
		columns: mockColumns,
		visibleColumns: ['id', 'name', 'email'],
		onClose: () => console.log('Close clicked')
	}}
/>

<Story name="Interactive Example" asChild>
	<div class="relative flex flex-col gap-4 p-4">
		<div>
			<button
				class="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
				onclick={() => {
					isOpen = !isOpen;
				}}
			>
				Toggle Column Selector
			</button>
		</div>

		<div class="text-sm text-gray-600">
			Selected columns: {visibleColumns.join(', ')}
		</div>

		<div class="relative max-w-56">
			<ColumnSelector
				show={isOpen}
				columns={mockColumns}
				bind:visibleColumns
				onClose={() => {
					isOpen = false;
				}}
			/>
		</div>
	</div>
</Story>
