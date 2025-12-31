<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Search from 'lucide-svelte/icons/search';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import { formatDate } from 'date-fns';
	import OrderDetails from '$lib/components/custom/order-details.svelte';

	let selectedOrderIndex = 0;
	export let data;

	let orders = [];
	let searchQuery = '';
	let selectedPartner = undefined;

	$: {
		orders = data?.orders?.results || [];
		searchQuery = data?.search || '';
		selectedPartner = data?.partner
			? { value: data.partner, label: getPartnerLabel(data.partner) }
			: undefined;
	}

	$: pagination = data?.pagination || { page: 1, totalPages: 1, totalOrders: 0 };
	$: partners = data?.partners || [];

	function getPartnerLabel(partnerId) {
		const partner = partners.find((p) => p.id === partnerId);
		return partner ? partner.name : partnerId;
	}

	function handleSearch(event) {
		if (event.key === 'Enter') {
			const params = new URLSearchParams($page.url.searchParams);
			if (searchQuery) {
				params.set('search', searchQuery);
			} else {
				params.delete('search');
			}
			params.set('page', '1');
			goto(`/orders?${params.toString()}`);
		}
	}

	function handlePartnerChange(selected) {
		const params = new URLSearchParams($page.url.searchParams);
		if (selected?.value) {
			params.set('partner', selected.value);
		} else {
			params.delete('partner');
		}
		params.set('page', '1');
		goto(`/orders?${params.toString()}`);
	}

	function goToPage(pageNum) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`/orders?${params.toString()}`);
	}
</script>

<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3">
	<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
		<Card.Root>
			<Card.Header class="px-7">
				<div class="flex items-center justify-between">
					<div>
						<Card.Title>Orders</Card.Title>
						<Card.Description>Recent orders from your store.</Card.Description>
					</div>
					<div class="flex items-center gap-2">
						<Select.Root selected={selectedPartner} onSelectedChange={handlePartnerChange}>
							<Select.Trigger class="h-8 w-[150px]">
								<Select.Value placeholder="All Partners" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="">All Partners</Select.Item>
								{#each partners as partner (partner.id)}
									<Select.Item value={partner.id}>{partner.name}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<div class="relative">
							<Search class="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search orders..."
								class="h-8 w-[150px] pl-8 sm:w-[250px]"
								bind:value={searchQuery}
								on:keydown={handleSearch}
							/>
						</div>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Merchant</Table.Head>
							<Table.Head class="hidden lg:table-cell">Partner</Table.Head>
							<Table.Head class="hidden sm:table-cell">Order ID</Table.Head>
							<Table.Head class="hidden md:table-cell">Date</Table.Head>
							<Table.Head class="text-right">Amount</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each orders as order, index (order.id || index)}
							<Table.Row
								class="cursor-pointer hover:bg-muted/50 {selectedOrderIndex === index ? 'bg-accent' : ''}"
								on:click={() => {
									selectedOrderIndex = index;
								}}
							>
								<Table.Cell>
									<div class="font-medium">
										{order.merchant_display_name || order.shop_id}
									</div>
									<div class="hidden text-sm text-muted-foreground md:inline">
										{order.shop_id}
									</div>
								</Table.Cell>
								<Table.Cell class="hidden lg:table-cell">
									<div class="font-medium">
										{order.partner_display_name || order.app_id || '-'}
									</div>
								</Table.Cell>
								<Table.Cell class="hidden sm:table-cell"
									>{order.platform_order_number}</Table.Cell
								>
								<Table.Cell class="hidden md:table-cell"
									>{order.created_dt ? formatDate(order.created_dt, 'MMM dd, yyyy') : ''}</Table.Cell
								>
								<Table.Cell class="text-right"
									>{formatCurrency(order.order_total)}</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
			<Card.Footer class="flex items-center justify-between border-t px-6 py-4">
				<div class="text-sm text-muted-foreground">
					Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalOrders)} of {pagination.totalOrders} orders
				</div>
				<div class="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						class="h-8 w-8 p-0"
						disabled={pagination.page <= 1}
						on:click={() => goToPage(pagination.page - 1)}
					>
						<ChevronLeft class="h-4 w-4" />
						<span class="sr-only">Previous page</span>
					</Button>
					<div class="text-sm">
						Page {pagination.page} of {pagination.totalPages}
					</div>
					<Button
						variant="outline"
						size="sm"
						class="h-8 w-8 p-0"
						disabled={pagination.page >= pagination.totalPages}
						on:click={() => goToPage(pagination.page + 1)}
					>
						<ChevronRight class="h-4 w-4" />
						<span class="sr-only">Next page</span>
					</Button>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>
	<div>
		{#if orders[selectedOrderIndex]}
			<OrderDetails order={orders[selectedOrderIndex]} />
		{/if}
	</div>
</main>
