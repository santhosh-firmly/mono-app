<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import OrdersByMerchant from '$lib/components/dashboard-blocks/orders-by-merchant.svelte';
	import { formatCurrency } from '$lib/currency.js';
	import OrdersByDestination from '$lib/components/dashboard-blocks/orders-by-destination.svelte';
	import DebugPopover from '$lib/components/custom/debug-popover.svelte';

	export let data;
</script>

<main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4">
	<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-4">
		<div class="flex flex-wrap gap-4">
			<Card.Root class="min-w-[300px]">
				<Card.Header class="flex flex-row justify-between pb-2">
					<Card.Description>This Week</Card.Description>
					<DebugPopover objToDebug={data.wtd.meta} />
				</Card.Header>
				<Card.Footer>
					<Card.Title class="text-3xl">
						{formatCurrency(Object.values(data.wtd.results[0])[0])}
					</Card.Title>
				</Card.Footer>
			</Card.Root>
			<Card.Root class="min-w-[300px]">
				<Card.Header class="flex flex-row justify-between pb-2">
					<Card.Description>This Month</Card.Description>
					<DebugPopover objToDebug={data.mtd.meta} />
				</Card.Header>
				<Card.Footer>
					<Card.Title class="text-3xl">
						{formatCurrency(Object.values(data.mtd.results[0])[0])}
					</Card.Title>
				</Card.Footer>
			</Card.Root>
			<Card.Root class="min-w-[300px]">
				<Card.Header class="flex flex-row justify-between pb-2">
					<Card.Description>This Year</Card.Description>
					<DebugPopover objToDebug={data.ytd.meta} />
				</Card.Header>
				<Card.Footer>
					<Card.Title class="text-3xl">
						{formatCurrency(Object.values(data.ytd.results[0])[0])}
					</Card.Title>
				</Card.Footer>
			</Card.Root>
			<Card.Root class="min-w-[300px]">
				<Card.Header class="flex flex-row justify-between pb-2">
					<Card.Description>Last Year</Card.Description>
					<DebugPopover objToDebug={data.lytd.meta} />
				</Card.Header>
				<Card.Footer>
					<Card.Title class="text-3xl">
						{formatCurrency(Object.values(data.lytd.results[0])[0])}
					</Card.Title>
				</Card.Footer>
			</Card.Root>
		</div>
	</div>
	<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
		<Tabs.Root value="week">
			<div class="flex items-center">
				<Tabs.List>
					<Tabs.Trigger value="week">Week</Tabs.Trigger>
					<Tabs.Trigger value="month">Month</Tabs.Trigger>
					<Tabs.Trigger value="year">Year</Tabs.Trigger>
					<Tabs.Trigger value="last-year">Last Year</Tabs.Trigger>
				</Tabs.List>
				<div class="ml-auto flex items-center gap-2">
					<!-- <DropdownMenu.Root>
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
					</Button> -->
				</div>
			</div>
			<Tabs.Content value="week">
				<DebugPopover objToDebug={data.ordersByMerchantWtd.meta} />
				<OrdersByMerchant
					ordersByMerchant={data.ordersByMerchantWtd}
					merchants={data.merchants}
				/></Tabs.Content
			>
			<Tabs.Content value="month">
				<DebugPopover objToDebug={data.ordersByMerchantMtd.meta} />
				<OrdersByMerchant
					ordersByMerchant={data.ordersByMerchantMtd}
					merchants={data.merchants}
				/></Tabs.Content
			>
			<Tabs.Content value="year">
				<DebugPopover objToDebug={data.ordersByMerchantYtd.meta} />
				<OrdersByMerchant
					ordersByMerchant={data.ordersByMerchantYtd}
					merchants={data.merchants}
				/></Tabs.Content
			>
			<Tabs.Content value="last-year">
				<DebugPopover objToDebug={data.ordersByMerchantLytd.meta} />
				<OrdersByMerchant
					ordersByMerchant={data.ordersByMerchantLytd}
					merchants={data.merchants}
				/></Tabs.Content
			>
		</Tabs.Root>
	</div>
	<div class="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
		<Tabs.Root value="week">
			<div class="flex items-center">
				<Tabs.List>
					<Tabs.Trigger value="week">Week</Tabs.Trigger>
					<Tabs.Trigger value="month">Month</Tabs.Trigger>
					<Tabs.Trigger value="year">Year</Tabs.Trigger>
					<Tabs.Trigger value="last-year">Last Year</Tabs.Trigger>
				</Tabs.List>
			</div>
			<Tabs.Content value="week">
				<DebugPopover objToDebug={data.ordersByDestinationWtd.meta} />
				<OrdersByDestination
					ordersByDestination={data.ordersByDestinationWtd}
					destinations={data.destinations}
				/></Tabs.Content
			>
			<Tabs.Content value="month">
				<DebugPopover objToDebug={data.ordersByDestinationMtd.meta} />
				<OrdersByDestination
					ordersByDestination={data.ordersByDestinationMtd}
					destinations={data.destinations}
				/></Tabs.Content
			>
			<Tabs.Content value="year">
				<DebugPopover objToDebug={data.ordersByDestinationYtd.meta} />
				<OrdersByDestination
					ordersByDestination={data.ordersByDestinationYtd}
					destinations={data.destinations}
				/></Tabs.Content
			>
			<Tabs.Content value="last-year">
				<DebugPopover objToDebug={data.ordersByDestinationLytd.meta} />
				<OrdersByDestination
					ordersByDestination={data.ordersByDestinationLytd}
					destinations={data.destinations}
				/></Tabs.Content
			>
		</Tabs.Root>
	</div>
</main>
