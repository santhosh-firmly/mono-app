<script>
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	// import Copy from 'lucide-svelte/icons/copy';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	// import File from 'lucide-svelte/icons/file';
	// import ListFilter from 'lucide-svelte/icons/list-filter';
	// import EllipsisVertical from 'lucide-svelte/icons/ellipsis-vertical';
	// import Truck from 'lucide-svelte/icons/truck';
	// import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	// import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Pagination from '$lib/components/ui/pagination/index.js';
	// import { Progress } from '$lib/components/ui/progress/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	// import * as Table from '$lib/components/ui/table/index.js';
	// import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { formatCurrency } from '$lib/currency.js';
	// import OrderDetails from '$lib/components/custom/order-details.svelte';
	import { formatDate } from 'date-fns';
	import CopyToClipboard from './copy-to-clipboard.svelte';

	function displayFromHash(hashedValue) {
		return hashedValue.replace(/-.*?-/, ' *** ').replace(/-.*?@/, '***@');
	}

	export let order;
</script>

<Card.Root class="overflow-hidden">
	<Card.Header class="flex flex-row items-start bg-muted/50">
		<div class="grid gap-0.5">
			<Card.Title class="group flex items-center gap-2 text-lg">
				Order {order?.platform_order_number}
				<CopyToClipboard value={order?.platform_order_number}></CopyToClipboard>
			</Card.Title>
			<Card.Description>{formatDate(order.created_dt, 'MMMM, dd, yyyy')}</Card.Description>
		</div>
		<!-- <div class="ml-auto flex items-center gap-1">
			<Button size="sm" variant="outline" class="h-8 gap-1">
				<Truck class="h-3.5 w-3.5" />
				<span class="lg:sr-only xl:not-sr-only xl:whitespace-nowrap"> Track Order </span>
			</Button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} size="icon" variant="outline" class="h-8 w-8">
						<EllipsisVertical class="h-3.5 w-3.5" />
						<span class="sr-only">More</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item>Edit</DropdownMenu.Item>
					<DropdownMenu.Item>Export</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Trash</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div> -->
	</Card.Header>
	<Card.Content class="p-6 text-sm">
		<div class="grid gap-3">
			<div class="font-semibold">Order Details</div>
			<ul class="grid gap-3">
				{#each order.order_info.line_items || [] as item, index (index)}
					<li class="flex items-center justify-between">
						<span class="text-ellipsis text-muted-foreground">
							<span class="overflow-hidden">{item.description}</span> x <span>{item.quantity}</span>
						</span>
						<span>{formatCurrency(item.line_price.value)}</span>
					</li>
				{/each}
			</ul>
			<Separator class="my-2" />
			<ul class="grid gap-3">
				<li class="flex items-center justify-between">
					<span class="text-muted-foreground">Subtotal</span>
					<span>{formatCurrency(order.order_info.sub_total)}</span>
				</li>
				{#if order.order_info.cart_discount?.value > 0}
					<li class="flex items-center justify-between">
						<span class="text-muted-foreground">Discount</span>
						<span>{formatCurrency(order.order_info.cart_discount)}</span>
					</li>
				{/if}
				<li class="flex items-center justify-between">
					<span class="text-muted-foreground">Shipping</span>
					<span>{formatCurrency(order.order_info.shipping_total)}</span>
				</li>
				<li class="flex items-center justify-between">
					<span class="text-muted-foreground">Tax</span>
					<span>{formatCurrency(order.order_info.tax)}</span>
				</li>
				<li class="flex items-center justify-between font-semibold">
					<span class="text-muted-foreground">Total</span>
					<span>{formatCurrency(order.order_info.total)}</span>
				</li>
			</ul>
		</div>
		<Separator class="my-4" />
		<div class="grid grid-cols-2 gap-4">
			<div class="grid gap-3">
				<div class="font-semibold">Shipping Information</div>
				<address class="grid gap-0.5 not-italic text-muted-foreground">
					<span
						>{order.order_info.shipping_info.city}, {order.order_info.shipping_info
							.state_or_province}</span
					>
					<span>{order.order_info.shipping_info.postal_code}</span>
				</address>
			</div>
			<div class="grid auto-rows-max gap-3">
				<div class="font-semibold">Billing Information</div>
				{#if order.order_info.billing_info}
					<address class="grid gap-0.5 not-italic text-muted-foreground">
						<span
							>{order.order_info.billing_info?.city}, {order.order_info.billing_info
								?.state_or_province}</span
						>
						<span>{order.order_info.billing_info?.postal_code}</span>
					</address>
				{:else}
					No Billing information
				{/if}
			</div>
			<div class="col-span-2 grid gap-3">
				<div class="font-semibold">Shipping Method</div>
				<address class="grid gap-0.5 not-italic text-muted-foreground">
					<span>{order.order_info.shipping_method.description}</span>
					{#if order.order_info.shipping_method.estimated_delivery}
						<span>{order.order_info.shipping_method.estimated_delivery}</span>
					{/if}
				</address>
			</div>
		</div>
		<Separator class="my-4" />
		<div class="grid gap-3">
			<div class="font-semibold">Customer Information</div>
			<dl class="grid gap-3">
				<div class="flex items-center justify-between">
					<dt class="text-muted-foreground">Email</dt>
					<dd>
						<span>{displayFromHash(order.order_info.shipping_info.email)}</span>
					</dd>
				</div>
				<div class="flex items-center justify-between">
					<dt class="text-muted-foreground">Phone</dt>
					<dd>
						<span>{displayFromHash(order.order_info.shipping_info.phone)}</span>
					</dd>
				</div>
			</dl>
		</div>
		<Separator class="my-4" />
		<div class="grid gap-3">
			<div class="font-semibold">Payment Information</div>
			<dl class="grid gap-3">
				<div class="flex items-center justify-between">
					{#if order.order_info.payment_summary}
						<dt class="flex items-center gap-1 text-muted-foreground">
							<CreditCard class="h-4 w-4" />
							{order.order_info.payment_summary.card_type}
						</dt>
						{#if order.order_info.payment_summary.last_four}
							<dd>**** **** **** {order.order_info.payment_summary.last_four}</dd>
						{/if}
					{:else}
						No Payment Information
					{/if}
				</div>
			</dl>
		</div>
	</Card.Content>
	<Card.Footer class="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
		<div class="text-xs text-muted-foreground"></div>
		<Pagination.Root count={10} class="ml-auto mr-0 w-auto">
			<Pagination.Content>
				<Pagination.Item>
					<Button size="icon" variant="outline" class="h-6 w-6">
						<ChevronLeft class="h-3.5 w-3.5" />
						<span class="sr-only">Previous Order</span>
					</Button>
				</Pagination.Item>
				<Pagination.Item>
					<Button size="icon" variant="outline" class="h-6 w-6">
						<ChevronRight class="h-3.5 w-3.5" />
						<span class="sr-only">Next Order</span>
					</Button>
				</Pagination.Item>
			</Pagination.Content>
		</Pagination.Root>
	</Card.Footer>
</Card.Root>
