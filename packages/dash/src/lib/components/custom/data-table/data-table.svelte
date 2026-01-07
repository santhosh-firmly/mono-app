<script>
	import { readable } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { Render, Subscribe, createRender, createTable } from 'svelte-headless-table';
	import {
		addColumnFilters,
		addHiddenColumns,
		addPagination,
		addSelectedRows,
		addSortBy,
		addTableFilter
	} from 'svelte-headless-table/plugins';

	import * as Table from '$lib/components/ui/table/index.js';
	import DataTableColumnHeader from './data-table-column-header.svelte';
	import DataTableToolbar from './data-table-toolbar.svelte';
	import DataTablePagination from './data-table-pagination.svelte';
	import DataTableRowActions from './data-table-row-actions.svelte';
	import Merchant from './cells/merchant.svelte';
	import BadgeCell from './cells/badge-cell.svelte';

	function createColumnFilter() {
		return {
			fn: ({ filterValue, value }) => {
				if (!filterValue || !Array.isArray(filterValue) || filterValue.length === 0) {
					return true;
				}

				if (value === undefined || value === null || typeof value !== 'string') {
					return false;
				}

				return filterValue.includes(value);
			},
			initialFilterValue: [],
			render: ({ filterValue }) => {
				return filterValue;
			}
		};
	}

	let { data, columnFilters } = $props();

	const table = createTable(readable(data), {
		select: addSelectedRows(),
		sort: addSortBy({
			toggleOrder: ['asc', 'desc']
		}),
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => {
				return value.toLowerCase().includes(filterValue.toLowerCase());
			}
			// serverSide: true,
		}),
		colFilter: addColumnFilters(),
		hide: addHiddenColumns()
	});

	const columns = table.createColumns([
		table.column({
			id: 'merchant',
			accessor: 'store_id',
			header: 'Merchant',
			cell: ({ row }) => {
				return createRender(Merchant, {
					logoUrl: row.original.edge_small_logo,
					logoSvg: row.original.logo_svg,
					name: row.original.display_name,
					domain: row.original.store_id
				});
			},
			plugins: {
				sort: {
					disable: true
				}
			}
		}),
		table.column({
			id: 'is_disabled',
			accessor: 'is_disabled',
			header: 'State',
			cell: ({ value }) => {
				return createRender(BadgeCell, {
					value: value ? 'Disabled' : 'Enabled'
				});
			},
			plugins: {
				filter: {
					exclude: true
				}
			}
		}),
		table.column({
			id: 'platform_id',
			accessor: 'platform_id',
			header: 'Platform',
			cell: ({ value }) => {
				return createRender(BadgeCell, {
					value
				});
			},
			plugins: {
				filter: {
					exclude: true
				},
				colFilter: createColumnFilter()
			}
		}),
		table.column({
			id: 'psp',
			accessor: 'psp',
			header: 'PSP',
			cell: ({ value }) => {
				return createRender(BadgeCell, {
					value
				});
			},
			plugins: {
				filter: {
					exclude: true
				},
				colFilter: createColumnFilter()
			}
		}),
		table.display({
			id: 'actions',
			header: () => {
				return '';
			},
			cell: ({ row }) => {
				if (row.isData() && row.original) {
					const { store_id } = row.original;

					return createRender(DataTableRowActions, {
						onEdit: () => goto(`merchants/${store_id}/edit`),
						onOpenProducts: () => goto(`merchants/${store_id}/products`)
					});
				}
				return '';
			}
		})
	]);

	const tableModel = table.createViewModel(columns);
	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = tableModel;
</script>

<div class="space-y-4">
	<DataTableToolbar {tableModel} {data} {columnFilters} />
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow, index (index)}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe
									attrs={cell.attrs()}
									let:attrs
									props={cell.props()}
									let:props
								>
									<Table.Head {...attrs}>
										{#if cell.id !== 'select' && cell.id !== 'actions'}
											<DataTableColumnHeader
												{props}
												{tableModel}
												cellId={cell.id}
											>
												<Render of={cell.render()} /></DataTableColumnHeader
											>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#if $pageRows.length}
					{#each $pageRows as row (row.id)}
						<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
							<Table.Row {...rowAttrs}>
								{#each row.cells as cell (cell.id)}
									<Subscribe attrs={cell.attrs()} let:attrs>
										<Table.Cell {...attrs}>
											{#if cell.id === 'task'}
												<div class="w-[80px]">
													<Render of={cell.render()} />
												</div>
											{:else}
												<Render of={cell.render()} />
											{/if}
										</Table.Cell>
									</Subscribe>
								{/each}
							</Table.Row>
						</Subscribe>
					{/each}
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center"
							>No results.</Table.Cell
						>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
	<DataTablePagination {tableModel} />
</div>
