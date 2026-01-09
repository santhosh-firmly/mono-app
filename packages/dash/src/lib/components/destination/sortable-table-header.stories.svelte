<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SortableTableHeader from './sortable-table-header.svelte';
	import * as Table from '$lib/components/ui/table/index.js';

	const { Story } = defineMeta({
		title: 'Destination/UI/Sortable Table Header',
		component: SortableTableHeader,
		tags: ['autodocs'],
		parameters: {
			layout: 'padded'
		},
		argTypes: {
			label: { control: 'text' },
			sortKey: { control: 'text' },
			currentSortKey: { control: 'text' },
			sortDirection: {
				control: 'select',
				options: ['asc', 'desc', null]
			}
		}
	});
</script>

<Story name="Inactive">
	{#snippet template()}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<SortableTableHeader
						label="Name"
						sortKey="name"
						currentSortKey="date"
						sortDirection={null}
					/>
				</Table.Row>
			</Table.Header>
		</Table.Root>
	{/snippet}
</Story>

<Story name="Active Ascending">
	{#snippet template()}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<SortableTableHeader
						label="Name"
						sortKey="name"
						currentSortKey="name"
						sortDirection="asc"
					/>
				</Table.Row>
			</Table.Header>
		</Table.Root>
	{/snippet}
</Story>

<Story name="Active Descending">
	{#snippet template()}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<SortableTableHeader
						label="Name"
						sortKey="name"
						currentSortKey="name"
						sortDirection="desc"
					/>
				</Table.Row>
			</Table.Header>
		</Table.Root>
	{/snippet}
</Story>

<Story name="Multiple Headers">
	{#snippet template()}
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<SortableTableHeader
						label="Name"
						sortKey="name"
						currentSortKey="date"
						sortDirection={null}
					/>
					<SortableTableHeader
						label="Email"
						sortKey="email"
						currentSortKey="date"
						sortDirection={null}
					/>
					<SortableTableHeader
						label="Date"
						sortKey="date"
						currentSortKey="date"
						sortDirection="desc"
					/>
					<SortableTableHeader
						label="Status"
						sortKey="status"
						currentSortKey="date"
						sortDirection={null}
					/>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				<Table.Row>
					<Table.Cell>John Doe</Table.Cell>
					<Table.Cell>john@example.com</Table.Cell>
					<Table.Cell>2024-01-15</Table.Cell>
					<Table.Cell>Active</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>Jane Smith</Table.Cell>
					<Table.Cell>jane@example.com</Table.Cell>
					<Table.Cell>2024-01-14</Table.Cell>
					<Table.Cell>Pending</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	{/snippet}
</Story>
