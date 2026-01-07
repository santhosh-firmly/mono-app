<script>
	import MerchantPageHeader from '$lib/components/merchant/merchant-page-header.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import Search from 'lucide-svelte/icons/search';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Package from 'lucide-svelte/icons/package';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import { formatCurrency } from '$lib/currency.js';
	import { formatDate } from 'date-fns';

	/**
	 * @type {{
	 *   orders: Array<{id?: string, platform_order_number: string, app_id?: string, created_dt?: string, order_total: number}>,
	 *   destinations: Array<{key: string, name: string}>,
	 *   total: number,
	 *   loading: boolean,
	 *   error: string,
	 *   searchValue: string,
	 *   currentPage: number,
	 *   limit: number,
	 *   onSearch: (query: string) => void,
	 *   onPageChange: (page: number) => void,
	 *   onViewOrder: (orderId: string) => void
	 * }}
	 */
	let {
		orders = [],
		destinations = [],
		total = 0,
		loading = false,
		error = '',
		searchValue = '',
		currentPage = 1,
		limit = 25,
		onSearch = () => {},
		onPageChange = () => {},
		onViewOrder = () => {}
	} = $props();

	let searchInput = $state(searchValue);
	let searchTimeout;

	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			onSearch(searchInput);
		}, 300);
	}

	function handleSearchKeydown(event) {
		if (event.key === 'Enter') {
			clearTimeout(searchTimeout);
			onSearch(searchInput);
		}
	}

	function getDestinationName(appId) {
		if (!appId) return '-';
		const dest = destinations.find((d) => d.key === appId);
		return dest?.name || appId;
	}

	// Computed pagination
	let totalPages = $derived(Math.ceil(total / limit));
	let showingFrom = $derived((currentPage - 1) * limit + 1);
	let showingTo = $derived(Math.min(currentPage * limit, total));
</script>

<div class="space-y-6">
	<MerchantPageHeader title="Orders" description="View and manage orders from your store." />

	<Card.Root>
		<Card.Header class="px-7">
			<div class="flex items-center justify-between">
				<div>
					<Card.Title>Recent Orders</Card.Title>
					<Card.Description>
						{#if total > 0}
							{total} order{total !== 1 ? 's' : ''} total
						{:else}
							No orders yet
						{/if}
					</Card.Description>
				</div>
				<div class="relative">
					<Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Search by order ID..."
						class="h-8 w-[150px] pl-8 sm:w-[250px]"
						bind:value={searchInput}
						oninput={handleSearchInput}
						onkeydown={handleSearchKeydown}
					/>
				</div>
			</div>
		</Card.Header>
		<Card.Content>
			{#if loading}
				<div class="flex items-center justify-center py-12">
					<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if error}
				<div class="py-12 text-center text-red-600">
					{error}
				</div>
			{:else if orders.length === 0}
				<div class="py-12 text-center">
					<Package class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
					<h3 class="mb-2 text-lg font-medium">No orders found</h3>
					<p class="text-muted-foreground">
						{#if searchValue}
							No orders match your search. Try a different query.
						{:else}
							Orders will appear here once customers make purchases.
						{/if}
					</p>
				</div>
			{:else}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Order ID</Table.Head>
							<Table.Head class="hidden sm:table-cell">Partner</Table.Head>
							<Table.Head class="hidden md:table-cell">Date</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each orders as order (order.id || order.platform_order_number)}
							<Table.Row
								class="cursor-pointer hover:bg-muted/50"
								onclick={() => onViewOrder(order.platform_order_number)}
							>
								<Table.Cell>
									<div class="font-medium">{order.platform_order_number}</div>
								</Table.Cell>
								<Table.Cell class="hidden sm:table-cell">
									<span class="text-sm text-muted-foreground">
										{getDestinationName(order.app_id)}
									</span>
								</Table.Cell>
								<Table.Cell class="hidden md:table-cell">
									{order.created_dt
										? formatDate(order.created_dt, "MMM dd 'at' h:mmaaa")
										: '-'}
								</Table.Cell>
								<Table.Cell class="text-right font-medium">
									{formatCurrency(order.order_total)}
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{/if}
		</Card.Content>
		{#if !loading && orders.length > 0}
			<Card.Footer class="flex items-center justify-between border-t px-6 py-4">
				<div class="text-sm text-muted-foreground">
					Showing {showingFrom}-{showingTo} of {total} orders
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						class="h-8 w-8 p-0"
						disabled={currentPage <= 1}
						onclick={() => onPageChange(currentPage - 1)}
					>
						<ChevronLeft class="h-4 w-4" />
						<span class="sr-only">Previous page</span>
					</Button>
					<div class="text-sm">
						Page {currentPage} of {totalPages}
					</div>
					<Button
						variant="outline"
						size="sm"
						class="h-8 w-8 p-0"
						disabled={currentPage >= totalPages}
						onclick={() => onPageChange(currentPage + 1)}
					>
						<ChevronRight class="h-4 w-4" />
						<span class="sr-only">Next page</span>
					</Button>
				</div>
			</Card.Footer>
		{/if}
	</Card.Root>
</div>
