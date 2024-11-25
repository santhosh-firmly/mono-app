<script lang="ts">
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Copy from 'lucide-svelte/icons/copy';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import File from 'lucide-svelte/icons/file';
	import ListFilter from 'lucide-svelte/icons/list-filter';
	import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	import Truck from 'lucide-svelte/icons/truck';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import OrderDetails from '$lib/components/custom/order-details.svelte';

	let selectedOrderIndex = 0;
	export let data;

	let orders;

	$: {
		orders = data?.orders?.results?.map((o) => ({
			...o,
			order_info: JSON.parse(o.order_info)
		}));

		// if (orders?.length && !selectedOrderIndex) {
		// 	selectedOrderIndex = 0;
		// }
	}
</script>

<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3">
	<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
		<Tabs.Root value="week">
			<div class="flex items-center">
				<Tabs.List>
					<Tabs.Trigger value="week">Week</Tabs.Trigger>
					<Tabs.Trigger value="month">Month</Tabs.Trigger>
					<Tabs.Trigger value="year">Year</Tabs.Trigger>
				</Tabs.List>
				<div class="ml-auto flex items-center gap-2">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild let:builder>
							<Button variant="outline" size="sm" class="h-7 gap-1 text-sm" builders={[builder]}>
								<ListFilter class="h-3.5 w-3.5" />
								<span class="sr-only sm:not-sr-only">Filter</span>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Label>Filter by</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.CheckboxItem checked>Fulfilled</DropdownMenu.CheckboxItem>
							<DropdownMenu.CheckboxItem>Declined</DropdownMenu.CheckboxItem>
							<DropdownMenu.CheckboxItem>Refunded</DropdownMenu.CheckboxItem>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
					<Button size="sm" variant="outline" class="h-7 gap-1 text-sm">
						<File class="h-3.5 w-3.5" />
						<span class="sr-only sm:not-sr-only">Export</span>
					</Button>
				</div>
			</div>
			<Tabs.Content value="week">
				<Card.Root>
					<Card.Header class="px-7">
						<Card.Title>Orders</Card.Title>
						<Card.Description>Recent orders from your store.</Card.Description>
					</Card.Header>
					<Card.Content>
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Merchant</Table.Head>
									<Table.Head class="hidden sm:table-cell">Order ID</Table.Head>
									<Table.Head class="hidden md:table-cell">Date</Table.Head>
									<Table.Head class="text-right">Amount</Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each orders as order, index}
									<Table.Row
										class="{selectedOrderIndex === index ? 'bg-accent' : ''}"
										on:click={() => {
											selectedOrderIndex = index;
										}}
									>
										<Table.Cell>
											<div class="font-medium">{order.display_name || order.shop_id}</div>
											<div class="hidden text-sm text-muted-foreground md:inline">
												{order.shop_id}
											</div>
										</Table.Cell>
										<Table.Cell class="hidden sm:table-cell"
											>{order.platform_order_number}</Table.Cell
										>
										<Table.Cell class="hidden md:table-cell">{order.created_dt}</Table.Cell>
										<Table.Cell class="text-right">{formatCurrency(order.order_total)}</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	</div>
	<div>
		<OrderDetails order={orders[selectedOrderIndex]} />
	</div>
</main>
