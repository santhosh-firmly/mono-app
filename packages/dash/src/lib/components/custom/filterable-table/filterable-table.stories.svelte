<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Table from './filterable-table.svelte';
	import ToolbarButton from './components/toolbar-button.svelte';
	import Eye from 'lucide-svelte/icons/eye';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import UserPlus from 'lucide-svelte/icons/user-plus';
	import Download from 'lucide-svelte/icons/download';
	import Filter from 'lucide-svelte/icons/filter';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Check from 'lucide-svelte/icons/check';
	import X from 'lucide-svelte/icons/x';
	import Shield from 'lucide-svelte/icons/shield';
	import Star from 'lucide-svelte/icons/star';
	import BadgeCheck from 'lucide-svelte/icons/badge-check';

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
		},
		{
			id: 3,
			name: 'Bob Johnson',
			email: 'bob@example.com',
			status: 'active',
			role: 'Developer',
			department: 'Engineering',
			joinDate: '2023-03-10',
			location: 'Austin'
		},
		{
			id: 4,
			name: 'Alice Williams',
			email: 'alice@example.com',
			status: 'active',
			role: 'Designer',
			department: 'Product',
			joinDate: '2022-11-05',
			location: 'Seattle'
		},
		{
			id: 5,
			name: 'Charlie Brown',
			email: 'charlie@example.com',
			status: 'pending',
			role: 'Developer',
			department: 'Engineering',
			joinDate: '2024-01-22',
			location: 'Boston'
		},
		{
			id: 6,
			name: 'Diana Prince',
			email: 'diana@example.com',
			status: 'active',
			role: 'Director',
			department: 'Product',
			joinDate: '2021-08-14',
			location: 'Los Angeles'
		},
		{
			id: 7,
			name: 'Ethan Hunt',
			email: 'ethan@example.com',
			status: 'inactive',
			role: 'Analyst',
			department: 'Marketing',
			joinDate: '2022-04-30',
			location: 'Chicago'
		},
		{
			id: 8,
			name: 'Fiona Gallagher',
			email: 'fiona@example.com',
			status: 'active',
			role: 'Developer',
			department: 'Engineering',
			joinDate: '2023-07-18',
			location: 'Denver'
		},
		{
			id: 9,
			name: 'George Miller',
			email: 'george@example.com',
			status: 'pending',
			role: 'Support',
			department: 'Customer Success',
			joinDate: '2024-02-01',
			location: 'Miami'
		},
		{
			id: 10,
			name: 'Hannah Montana',
			email: 'hannah@example.com',
			status: 'active',
			role: 'Manager',
			department: 'Operations',
			joinDate: '2021-12-12',
			location: 'Portland'
		}
	];

	// Mock data with row actions
	const mockDataWithActions = mockData.map((item) => ({
		...item,
		actions: [
			{
				label: 'View',
				icon: Eye,
				execute: (item) => alert(`Viewing ${item.name}`)
			},
			{
				label: 'Edit',
				icon: Pencil,
				execute: (item) => alert(`Editing ${item.name}`)
			},
			{
				label: 'Delete',
				icon: Trash2,
				execute: (item) => alert(`Deleting ${item.name}`)
			}
		]
	}));

	// Mock data with complex types (non-sortable)
	const mockDataWithComplexTypes = [
		{
			id: 1,
			name: 'Alice Johnson',
			verified: true,
			role: { name: 'Admin', level: 5 },
			permissions: ['read', 'write', 'delete'],
			rating: 4.8,
			tags: ['premium', 'featured']
		},
		{
			id: 2,
			name: 'Bob Smith',
			verified: false,
			role: { name: 'User', level: 1 },
			permissions: ['read'],
			rating: 3.2,
			tags: ['basic']
		},
		{
			id: 3,
			name: 'Carol White',
			verified: true,
			role: { name: 'Manager', level: 3 },
			permissions: ['read', 'write'],
			rating: 4.5,
			tags: ['team-lead', 'verified']
		},
		{
			id: 4,
			name: 'David Brown',
			verified: false,
			role: { name: 'Developer', level: 2 },
			permissions: ['read', 'write'],
			rating: 4.0,
			tags: []
		},
		{
			id: 5,
			name: 'Eve Davis',
			verified: true,
			role: { name: 'Admin', level: 5 },
			permissions: ['read', 'write', 'delete', 'admin'],
			rating: 5.0,
			tags: ['premium', 'verified', 'featured']
		}
	];

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

	const { Story } = defineMeta({
		title: 'Data Display/Filterable Table',
		component: Table,
		argTypes: {
			data: {
				control: 'object',
				description: 'Table data array'
			},
			columns: {
				control: 'object',
				description: 'Column definitions'
			}
		}
	});
</script>

<Story name="Default" args={{ tableId: 'story-default', data: mockData, columns: basicColumns }} />

<Story
	name="Extended Columns"
	args={{
		tableId: 'story-extended-columns',
		data: mockData,
		columns: extendedColumns,
		title: 'Employee Directory'
	}}
/>

<Story
	name="With Toolbar"
	args={{
		tableId: 'story-with-toolbar',
		data: mockData,
		columns: extendedColumns,
		showToolbar: true,
		title: 'Team Members'
	}}
/>

<Story
	name="Small Dataset"
	args={{ tableId: 'story-small-dataset', data: mockData.slice(0, 3), columns: basicColumns }}
/>

<Story
	name="Empty"
	args={{
		tableId: 'story-empty',
		data: [],
		columns: basicColumns,
		emptyMessage: 'No users found'
	}}
/>

<Story
	name="Loading"
	args={{ tableId: 'story-loading', data: [], columns: basicColumns, loading: true }}
/>

<Story
	name="With Row Actions"
	args={{
		tableId: 'story-with-row-actions',
		data: mockDataWithActions,
		columns: basicColumns,
		showActions: true,
		title: 'Users with Actions'
	}}
></Story>

<Story
	name="With Toolbar and Actions"
	args={{
		tableId: 'story-with-toolbar-and-actions',
		data: mockDataWithActions,
		columns: extendedColumns,
		showActions: true,
		title: 'Full Featured Table'
	}}
/>

<Story name="With Custom Toolbar Actions" asChild>
	<Table
		tableId="story-custom-toolbar-actions"
		data={mockData}
		columns={extendedColumns}
		showToolbar={true}
		title="Team Management"
	>
		{#snippet actions()}
			<ToolbarButton tooltipText="Add User" onclick={() => alert('Add new user')}>
				<UserPlus class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Refresh" onclick={() => alert('Refreshing data...')}>
				<RefreshCw class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Export to CSV" onclick={() => alert('Exporting to CSV...')}>
				<Download class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Filter" onclick={() => alert('Opening filter panel...')}>
				<Filter class="h-5 w-5" />
			</ToolbarButton>
		{/snippet}
	</Table>
</Story>

<Story
	name="Clickable Rows"
	args={{
		tableId: 'story-clickable-rows',
		data: mockData,
		columns: basicColumns,
		title: 'Clickable Table',
		onclick: (item, index) => alert(`Clicked on ${item.name} (row ${index})`)
	}}
/>

<Story name="Kitchen Sink" asChild>
	<Table
		tableId="story-kitchen-sink"
		data={mockDataWithActions}
		columns={extendedColumns}
		showToolbar={true}
		showFilters={true}
		showActions={true}
		title="Complete Feature Demo"
		onclick={(item) => console.log('Row clicked:', item)}
	>
		{#snippet actions()}
			<ToolbarButton tooltipText="Add User" onclick={() => alert('Add new user')}>
				<UserPlus class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Refresh" onclick={() => alert('Refreshing data...')}>
				<RefreshCw class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Export" onclick={() => alert('Exporting data...')}>
				<Download class="h-5 w-5" />
			</ToolbarButton>
		{/snippet}
	</Table>
</Story>

<Story
	name="Sortable Columns"
	args={{
		tableId: 'story-sortable-columns',
		data: mockData,
		columns: extendedColumns,
		title: 'Sortable Table (Click column headers to sort)'
	}}
/>

<Story name="Sortable with Mixed Types" asChild>
	{@const mixedColumns = [
		{ id: 'id', name: 'ID (Number)', center: true },
		{ id: 'name', name: 'Name (String)' },
		{ id: 'status', name: 'Status (String)', center: true },
		{ id: 'joinDate', name: 'Join Date (Date)' }
	]}
	<Table
		tableId="story-sortable-mixed-types"
		data={mockData}
		columns={mixedColumns}
		title="Sortable by Type - Numbers, Strings & Dates"
	/>
</Story>

<Story name="Sortable vs Non-Sortable Columns" asChild>
	{#snippet verifiedCell(item)}
		<td
			class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle text-center group-hover:bg-slate-100"
		>
			{#if item.verified}
				<Check class="h-5 w-5 inline-block text-green-600" />
			{:else}
				<X class="h-5 w-5 inline-block text-red-600" />
			{/if}
		</td>
	{/snippet}

	{#snippet roleCell(item)}
		<td
			class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle group-hover:bg-slate-100"
		>
			<div class="flex items-center gap-1.5">
				<Shield class="h-4 w-4 text-blue-600" />
				<span
					>{item.role.name}
					<span class="text-xs text-gray-500">(Level {item.role.level})</span></span
				>
			</div>
		</td>
	{/snippet}

	{#snippet ratingCell(item)}
		<td
			class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle text-center group-hover:bg-slate-100"
		>
			<div class="flex items-center justify-center gap-1">
				<Star class="h-4 w-4 text-yellow-500" />
				<span class="font-medium">{item.rating.toFixed(1)}</span>
			</div>
		</td>
	{/snippet}

	{#snippet permissionsCell(item)}
		<td
			class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle group-hover:bg-slate-100"
		>
			<div class="flex gap-1 flex-wrap">
				{#each item.permissions as perm}
					<span
						class="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-medium"
					>
						{perm}
					</span>
				{/each}
			</div>
		</td>
	{/snippet}

	{#snippet tagsCell(item)}
		<td
			class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle group-hover:bg-slate-100"
		>
			{#if item.tags.length === 0}
				<span class="text-gray-400 text-xs">No tags</span>
			{:else}
				<div class="flex gap-1 flex-wrap">
					{#each item.tags as tag}
						<span
							class="px-2 py-0.5 text-xs rounded bg-gray-200 text-gray-700 inline-flex items-center gap-1"
						>
							<BadgeCheck class="h-3 w-3" />
							{tag}
						</span>
					{/each}
				</div>
			{/if}
		</td>
	{/snippet}

	<Table
		tableId="story-sortable-vs-nonsortable"
		data={mockDataWithComplexTypes}
		columns={[
			{ id: 'id', name: 'ID', center: true },
			{ id: 'name', name: 'Name' },
			{ id: 'verified', name: 'Verified', center: true, cellView: verifiedCell },
			{ id: 'role', name: 'Role', cellView: roleCell },
			{ id: 'rating', name: 'Rating', center: true, cellView: ratingCell },
			{ id: 'permissions', name: 'Permissions', cellView: permissionsCell },
			{ id: 'tags', name: 'Tags', cellView: tagsCell }
		]}
		title="Sortable vs Non-Sortable (ID, Name, Rating are sortable)"
	/>
</Story>

<Story
	name="With Filters"
	args={{
		tableId: 'story-with-filters',
		data: mockData,
		columns: extendedColumns,
		showFilters: true,
		title: 'Filterable Table (Click + to add filters)'
	}}
/>

<Story name="Filters and Sorting Combined" asChild>
	<Table
		tableId="story-filters-sorting-combined"
		data={mockData}
		columns={extendedColumns}
		showFilters={true}
		title="Filters + Sorting + Toolbar"
		showToolbar={true}
	>
		{#snippet actions()}
			<ToolbarButton tooltipText="Refresh" onclick={() => alert('Refreshing data...')}>
				<RefreshCw class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Export" onclick={() => alert('Exporting data...')}>
				<Download class="h-5 w-5" />
			</ToolbarButton>
		{/snippet}
	</Table>
</Story>

<Story name="Complete Feature Demo with Filters" asChild>
	<Table
		tableId="story-complete-feature-demo"
		data={mockDataWithActions}
		columns={extendedColumns}
		showFilters={true}
		showToolbar={true}
		showActions={true}
		title="All Features: Filters, Sorting, Toolbar, Actions"
		onclick={(item) => console.log('Row clicked:', item)}
	>
		{#snippet actions()}
			<ToolbarButton tooltipText="Add User" onclick={() => alert('Add new user')}>
				<UserPlus class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Export" onclick={() => alert('Exporting data...')}>
				<Download class="h-5 w-5" />
			</ToolbarButton>
		{/snippet}
	</Table>
</Story>

<Story name="Numeric Filters Demo" asChild>
	{@const numericData = mockDataWithComplexTypes}
	{@const numericColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{ id: 'rating', name: 'Rating', center: true }
	]}
	<Table
		tableId="story-numeric-filters"
		data={numericData}
		columns={numericColumns}
		showFilters={true}
		title="Numeric Filtering (ID & Rating support: equals, greater than, less than, between)"
	/>
</Story>

<Story name="Multi-Select Filters (Explicit Options)" asChild>
	{@const statusColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{
			id: 'status',
			name: 'Status',
			center: true,
			filterType: 'select',
			filterOptions: ['active', 'inactive', 'pending']
		},
		{
			id: 'department',
			name: 'Department',
			filterType: 'select',
			filterOptions: [
				{ value: 'Engineering', label: 'Engineering' },
				{ value: 'Sales', label: 'Sales' },
				{ value: 'Product', label: 'Product' },
				{ value: 'Marketing', label: 'Marketing' },
				{ value: 'Customer Success', label: 'Customer Success' },
				{ value: 'Operations', label: 'Operations' }
			]
		}
	]}
	<Table
		tableId="story-multiselect-explicit"
		data={mockData}
		columns={statusColumns}
		showFilters={true}
		showToolbar={true}
		title="Multi-Select Filters (Click Status or Department to filter)"
	/>
</Story>

<Story name="Multi-Select with Auto-Detection" asChild>
	{@const autoDetectColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{
			id: 'status',
			name: 'Status',
			center: true,
			filterType: 'select'
		},
		{
			id: 'role',
			name: 'Role',
			filterType: 'select'
		}
	]}
	<Table
		tableId="story-multiselect-autodetect"
		data={mockData}
		columns={autoDetectColumns}
		showFilters={true}
		title="Auto-Detected Multi-Select (Status & Role auto-detect unique values)"
	/>
</Story>

<Story name="Mixed Filter Types" asChild>
	{@const mixedColumns = [
		{ id: 'id', name: 'ID (Number)', center: true },
		{ id: 'name', name: 'Name (String)' },
		{
			id: 'status',
			name: 'Status (Select)',
			center: true,
			filterType: 'select',
			filterOptions: ['active', 'inactive', 'pending']
		},
		{ id: 'email', name: 'Email (String)' },
		{
			id: 'department',
			name: 'Department (Select)',
			filterType: 'select'
		}
	]}
	<Table
		tableId="story-mixed-filter-types"
		data={mockData}
		columns={mixedColumns}
		showFilters={true}
		showToolbar={true}
		showActions={false}
		title="All Filter Types: String, Number, and Multi-Select"
	/>
</Story>

<Story name="Global Search" asChild>
	<Table
		tableId="story-global-search"
		data={mockData}
		columns={extendedColumns}
		showFilters={true}
		showToolbar={true}
		title="Global Search (Type in search box to filter across all string columns)"
	>
		{#snippet actions()}
			<ToolbarButton tooltipText="Refresh" onclick={() => alert('Refreshing data...')}>
				<RefreshCw class="h-5 w-5" />
			</ToolbarButton>
		{/snippet}
	</Table>
</Story>

<Story name="Global Search + Column Filters + Sorting" asChild>
	{@const combinedColumns = [
		{ id: 'id', name: 'ID', center: true },
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{
			id: 'status',
			name: 'Status',
			center: true,
			filterType: 'select',
			filterOptions: ['active', 'inactive', 'pending']
		},
		{
			id: 'department',
			name: 'Department',
			filterType: 'select'
		},
		{ id: 'location', name: 'Location' }
	]}
	<Table
		tableId="story-complete-filtering"
		data={mockData}
		columns={combinedColumns}
		showFilters={true}
		showToolbar={true}
		title="Complete Filtering Demo: Global Search + Column Filters + Sorting"
	>
		{#snippet actions()}
			<ToolbarButton tooltipText="Add User" onclick={() => alert('Add new user')}>
				<UserPlus class="h-5 w-5" />
			</ToolbarButton>
			<ToolbarButton tooltipText="Export" onclick={() => alert('Exporting data...')}>
				<Download class="h-5 w-5" />
			</ToolbarButton>
		{/snippet}
	</Table>
</Story>
