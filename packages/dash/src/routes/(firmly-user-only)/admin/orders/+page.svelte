<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import { formatDate } from 'date-fns';
	import OrderDetails from '$lib/components/custom/order-details.svelte';
	import FilterableTable from '$lib/components/custom/filterable-table/filterable-table.svelte';
	import { onMount } from 'svelte';

	// State
	let orders = $state([]);
	let partners = $state([]);
	let merchants = $state([]);
	let platforms = $state([]);
	let total = $state(0);
	let loading = $state(true);
	let error = $state(null);
	let selectedOrderNumber = $state(null);
	let pagination = $state({ page: 1, pageSize: 10 });
	let filterOptionsMap = $state({});
	let visibleColumns = $state([
		'merchant',
		'partner_display_name',
		'platform_order_number',
		'created_dt',
		'order_total'
	]);

	// Derived state - find by platform_order_number, fallback to first order
	let selectedOrder = $derived(
		orders.find((o) => o.platform_order_number === selectedOrderNumber) || orders[0]
	);

	async function handleFetchData(filterState) {
		loading = true;
		error = null;

		try {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local variable, not reactive state
			const params = new URLSearchParams({
				limit: filterState.pagination.pageSize.toString(),
				offset: (
					(filterState.pagination.page - 1) *
					filterState.pagination.pageSize
				).toString()
			});

			// Global search → API search param
			if (filterState.globalSearch) {
				params.set('search', filterState.globalSearch);
			}

			// Partner filter → API partner param
			const partnerFilter = filterState.filters.find(
				(f) => f.columnId === 'partner_display_name'
			);
			if (partnerFilter?.values?.length) {
				// Map display name back to ID
				const partnerId = partners.find((p) => p.name === partnerFilter.values[0])?.id;
				if (partnerId) params.set('partner', partnerId);
			}

			// Merchant filter → API merchant param
			const merchantFilter = filterState.filters.find((f) => f.columnId === 'merchant');
			if (merchantFilter?.values?.length) {
				params.set('merchant', merchantFilter.values[0]);
			}

			// Platform filter → API platform param
			const platformFilter = filterState.filters.find((f) => f.columnId === 'platform');
			if (platformFilter?.values?.length) {
				params.set('platform', platformFilter.values.join(','));
			}

			// Sort params
			if (filterState.sort) {
				params.set('orderBy', filterState.sort.column);
				params.set('orderDir', filterState.sort.direction);
			}
			const response = await fetch(`/admin/api/orders?${params.toString()}`);

			if (!response.ok) {
				throw new Error('Failed to fetch orders');
			}

			const data = await response.json();
			// Map orders to include computed fields from order_info
			orders = (data.orders || []).map((order) => ({
				...order,
				payment_method: order.order_info?.payment_method?.payment_type || '-',
				items_count: order.order_info?.line_items?.length || 0,
				shipping_city: order.order_info?.shipping_info?.city || '-',
				shipping_state: order.order_info?.shipping_info?.state_name || '-',
				shipping_postal: order.order_info?.shipping_info?.postal_code || '-',
				billing_city: order.order_info?.billing_info?.city || '-',
				billing_state: order.order_info?.billing_info?.state_name || '-',
				billing_postal: order.order_info?.billing_info?.postal_code || '-'
			}));
			partners = data.partners || [];
			merchants = data.merchants || [];
			platforms = data.platforms || [];
			total = data.total || 0;

			// Update filter options for dropdowns
			filterOptionsMap = {
				partner_display_name: partners.map((p) => ({ value: p.name, label: p.name })),
				merchant: merchants.map((m) => ({ value: m.shop_id, label: m.display_name })),
				platform: platforms.map((p) => ({ value: p, label: p }))
			};

			// Select first order if current selection is not in results
			if (orders.length > 0 && !orders.find((o) => o.platform_order_number === selectedOrderNumber)) {
				selectedOrderNumber = orders[0].platform_order_number;
			}
		} catch (err) {
			console.error('Error fetching orders:', err);
			error = err.message || 'An error occurred';
		} finally {
			loading = false;
		}
	}

	// Fetch orders on initial load (only once)
	onMount(() => {
		handleFetchData({
			filters: [],
			globalSearch: '',
			sort: null,
			pagination: { page: pagination.page, pageSize: pagination.pageSize }
		});
	});

	function handleRowClick(item) {
		if (item?.platform_order_number) {
			selectedOrderNumber = item.platform_order_number;
		}
	}

	// Create a reactive rowClass that captures selectedOrderNumber in closure
	// The function needs to be recreated when selectedOrderNumber changes
	let getRowClass = $derived.by(() => {
		const currentSelection = selectedOrderNumber;
		return (item) => {
			return item?.platform_order_number === currentSelection ? 'bg-purple-50 dark:bg-purple-900/30' : '';
		};
	});
</script>

<!-- Cell view snippets for custom column rendering -->
{#snippet merchantCell(item)}
	<td
		class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle group-hover:bg-slate-100 dark:border-gray-700 dark:group-hover:bg-gray-800"
	>
		<div class="flex flex-col">
			<span class="font-medium text-gray-900 dark:text-gray-100">{item.merchant_display_name || item.shop_id}</span>
			{#if item.merchant_display_name && item.shop_id}
				<span class="text-xs text-gray-500 dark:text-gray-400">{item.shop_id}</span>
			{/if}
		</div>
	</td>
{/snippet}

{#snippet dateCell(item)}
	<td
		class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle text-nowrap text-ellipsis group-hover:bg-slate-100 dark:border-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-800"
	>
		{item.created_dt ? formatDate(item.created_dt, 'MMM dd, yyyy') : ''}
	</td>
{/snippet}

{#snippet amountCell(item)}
	<td
		class="max-w-64 overflow-hidden border-b border-gray-200 p-2.5 pl-4 align-middle text-right text-nowrap text-ellipsis group-hover:bg-slate-100 dark:border-gray-700 dark:text-gray-300 dark:group-hover:bg-gray-800"
	>
		{formatCurrency(item.order_total)}
	</td>
{/snippet}

<div class="grid items-start gap-4 md:gap-8 lg:grid-cols-3">
	<div class="lg:col-span-2">
		<Card.Root>
			<Card.Header class="px-7">
				<Card.Title>Orders</Card.Title>
				<Card.Description>Recent orders from your store.</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if error}
					<div class="flex items-center justify-center py-8 text-sm text-red-500">
						{error}
					</div>
				{:else}
					<FilterableTable
						tableId="admin-orders"
						data={orders}
						columns={[
							{
								id: 'merchant',
								name: 'Merchant',
								cellView: merchantCell,
								filterable: true,
								filterType: 'select'
							},
							{
								id: 'partner_display_name',
								name: 'Partner',
								hideOnMobile: true,
								filterable: true,
								filterType: 'select'
							},
							{
								id: 'platform_order_number',
								name: 'Order ID',
								hideOnMobile: true
							},
							{
								id: 'created_dt',
								name: 'Date',
								hideOnMobile: true,
								filterType: 'date',
								cellView: dateCell
							},
							{
								id: 'order_total',
								name: 'Amount',
								align: 'right',
								filterType: 'number',
								cellView: amountCell
							},
							{ id: 'platform', name: 'Platform', hideOnMobile: true, filterable: true, filterType: 'select' },
							{ id: 'payment_method', name: 'Payment', hideOnMobile: true },
							{ id: 'items_count', name: 'Items', hideOnMobile: true, align: 'center' },
							{ id: 'shipping_city', name: 'Ship City', hideOnMobile: true },
							{ id: 'shipping_state', name: 'Ship State', hideOnMobile: true },
							{ id: 'shipping_postal', name: 'Ship Postal', hideOnMobile: true },
							{ id: 'billing_city', name: 'Bill City', hideOnMobile: true },
							{ id: 'billing_state', name: 'Bill State', hideOnMobile: true },
							{ id: 'billing_postal', name: 'Bill Postal', hideOnMobile: true },
							{ id: 'utm_source', name: 'UTM Source', hideOnMobile: true },
							{ id: 'utm_campaign', name: 'UTM Campaign', hideOnMobile: true }
						]}
						showToolbar={true}
						showFilters={true}
						showPagination={true}
						serverSide={true}
						applyMode="manual"
						totalItems={total}
						filterOptions={filterOptionsMap}
						bind:pagination
						bind:visibleColumns
						onFetchData={handleFetchData}
						{loading}
						onclick={handleRowClick}
						rowClass={getRowClass}
					/>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
	<div class="sticky top-0 self-start">
		{#if selectedOrder}
			<OrderDetails order={selectedOrder} />
		{/if}
	</div>
</div>
