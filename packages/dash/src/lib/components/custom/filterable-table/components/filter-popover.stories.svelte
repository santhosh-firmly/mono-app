<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FilterPopover from './filter-popover.svelte';

	const mockColumns = [
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'age', name: 'Age' },
		{
			id: 'status',
			name: 'Status',
			filterType: 'select',
			filterOptions: [
				'active',
				'inactive',
				'pending',
				'suspended',
				'archived',
				'deleted',
				'draft',
				'published',
				'reviewing',
				'approved'
			]
		},
		{ id: 'verified', name: 'Verified' }
	];

	const mockData = [
		{ name: 'John', email: 'john@example.com', age: 30, status: 'active', verified: true },
		{ name: 'Jane', email: 'jane@example.com', age: 25, status: 'inactive', verified: false },
		{ name: 'Bob', email: 'bob@example.com', age: 35, status: 'pending', verified: true },
		{
			name: 'Alice',
			email: 'alice@example.com',
			age: 28,
			status: 'suspended',
			verified: false
		},
		{
			name: 'Charlie',
			email: 'charlie@example.com',
			age: 42,
			status: 'archived',
			verified: true
		}
	];

	const mockColumnsWithEmpty = [
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'department', name: 'Department', filterType: 'select' }
	];

	const mockDataWithEmptyColumn = [
		{ name: 'John', email: 'john@example.com', department: null },
		{ name: 'Jane', email: 'jane@example.com', department: undefined },
		{ name: 'Bob', email: 'bob@example.com', department: '' },
		{ name: 'Alice', email: 'alice@example.com' }
	];

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table/Components/FilterPopover',
		component: FilterPopover,
		tags: ['autodocs']
	});
</script>

<Story name="String Filter" asChild>
	{@const buttonRef = { offsetLeft: 100 }}
	<div class="relative h-96">
		<FilterPopover
			show={true}
			{buttonRef}
			selectedColumnId="name"
			columns={mockColumns}
			data={mockData}
			filterCondition="equals"
			filterValue="John"
			filterValue2=""
			selectedValues={[]}
			onApply={() => console.log('Apply clicked')}
			onClose={() => console.log('Close clicked')}
		/>
	</div>
</Story>

<Story name="Numeric Filter - Between" asChild>
	{@const buttonRef = { offsetLeft: 100 }}
	<div class="relative h-96">
		<FilterPopover
			show={true}
			{buttonRef}
			selectedColumnId="age"
			columns={mockColumns}
			data={mockData}
			filterCondition="between"
			filterValue="20"
			filterValue2="40"
			selectedValues={[]}
			onApply={() => console.log('Apply clicked')}
			onClose={() => console.log('Close clicked')}
		/>
	</div>
</Story>

<Story name="Multi-Select Filter" asChild>
	{@const buttonRef = { offsetLeft: 100 }}
	<div class="relative h-96">
		<FilterPopover
			show={true}
			{buttonRef}
			selectedColumnId="status"
			columns={mockColumns}
			data={mockData}
			filterCondition="in"
			filterValue=""
			filterValue2=""
			selectedValues={['active', 'pending']}
			onApply={() => console.log('Apply clicked')}
			onClose={() => console.log('Close clicked')}
		/>
	</div>
</Story>

<Story name="Boolean Filter" asChild>
	{@const buttonRef = { offsetLeft: 100 }}
	<div class="relative h-96">
		<FilterPopover
			show={true}
			{buttonRef}
			selectedColumnId="verified"
			columns={mockColumns}
			data={mockData}
			filterCondition="equals"
			filterValue={true}
			filterValue2=""
			selectedValues={[]}
			onApply={() => console.log('Apply clicked')}
			onClose={() => console.log('Close clicked')}
		/>
	</div>
</Story>

<Story name="Closed State" asChild>
	{@const buttonRef = { offsetLeft: 100 }}
	<div class="relative h-96">
		<p class="text-gray-500">Popover is hidden (show=false)</p>
		<FilterPopover
			show={false}
			{buttonRef}
			selectedColumnId="name"
			columns={mockColumns}
			data={mockData}
			filterCondition="equals"
			filterValue=""
			filterValue2=""
			selectedValues={[]}
			onApply={() => console.log('Apply clicked')}
			onClose={() => console.log('Close clicked')}
		/>
	</div>
</Story>

<Story name="Select Filter - All Empty Values" asChild>
	{@const buttonRef = { offsetLeft: 100 }}
	<div class="relative h-96">
		<p class="mb-2 text-sm text-gray-600">Select filter when all rows have null/empty values</p>
		<FilterPopover
			show={true}
			{buttonRef}
			selectedColumnId="department"
			columns={mockColumnsWithEmpty}
			data={mockDataWithEmptyColumn}
			filterCondition="in"
			filterValue=""
			filterValue2=""
			selectedValues={[]}
			onApply={() => console.log('Apply clicked')}
			onClose={() => console.log('Close clicked')}
		/>
	</div>
</Story>
