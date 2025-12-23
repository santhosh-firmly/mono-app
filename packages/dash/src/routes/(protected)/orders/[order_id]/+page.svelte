<script>
	import { goto } from '$app/navigation';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import CreditCard from 'lucide-svelte/icons/credit-card';
	import Package from 'lucide-svelte/icons/package';
	import User from 'lucide-svelte/icons/user';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import Phone from 'lucide-svelte/icons/phone';
	import Mail from 'lucide-svelte/icons/mail';
	import Truck from 'lucide-svelte/icons/truck';
	import Store from 'lucide-svelte/icons/store';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { formatCurrency } from '$lib/currency.js';
	import { displayFromHash, getProductImage } from '$lib/order-utils.js';
	import { formatDate } from 'date-fns';
	import CopyToClipboard from '$lib/components/custom/copy-to-clipboard.svelte';

	export let data;

	$: order = data?.order;
	$: navigation = data?.navigation;

	let faviconError = false;
	let imageErrors = new Set();

	// Reset favicon error when order changes
	$: if (order) {
		faviconError = false;
		imageErrors = new Set();
	}

	function navigateToOrder(orderId) {
		if (orderId) {
			goto(`/orders/${orderId}`);
		}
	}

	function handleFaviconError() {
		faviconError = true;
	}

	function handleProductImageError(index) {
		imageErrors.add(index);
		imageErrors = imageErrors; // Trigger reactivity
	}
</script>

<div class="flex flex-col gap-4 p-4 md:p-6">
	<!-- Header with navigation -->
	<div class="flex items-center gap-4">
		<Button
			variant="ghost"
			size="icon"
			on:click={() => goto('/orders')}
			class="h-8 w-8"
		>
			<ArrowLeft class="h-4 w-4" />
			<span class="sr-only">Back to orders</span>
		</Button>
		<div class="flex-1">
			<h1 class="text-2xl font-bold">Order Details</h1>
			<p class="text-sm text-muted-foreground">
				Order {navigation?.currentIndex} of {navigation?.totalOrders} from {order?.display_name || order?.shop_id}
			</p>
		</div>
		<div class="flex gap-2">
			<Button
				variant="outline"
				size="icon"
				disabled={!navigation?.prevOrder}
				on:click={() => navigateToOrder(navigation?.prevOrder?.platform_order_number)}
			>
				<ChevronLeft class="h-4 w-4" />
				<span class="sr-only">Previous order</span>
			</Button>
			<Button
				variant="outline"
				size="icon"
				disabled={!navigation?.nextOrder}
				on:click={() => navigateToOrder(navigation?.nextOrder?.platform_order_number)}
			>
				<ChevronRight class="h-4 w-4" />
				<span class="sr-only">Next order</span>
			</Button>
		</div>
	</div>

	<!-- Main content grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Left column - Order items and summary -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Order header card -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-start justify-between">
						<div>
							<Card.Title class="flex items-center gap-2">
								Order #{order?.platform_order_number}
								<CopyToClipboard value={order?.platform_order_number} />
							</Card.Title>
							<Card.Description>
								Placed on {formatDate(order?.created_dt, 'MMMM dd, yyyy \'at\' h:mm a')}
							</Card.Description>
						</div>
						<Badge variant="outline">
							{order?.status || 'Completed'}
						</Badge>
					</div>
				</Card.Header>
			</Card.Root>

			<!-- Order items card -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Package class="h-5 w-5" />
						Order Items
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						{#each order?.order_info?.line_items || [] as item, index (index)}
							<div class="flex gap-4 p-4 rounded-lg border bg-card">
								<!-- Product image -->
								{#if getProductImage(item) && !imageErrors.has(index)}
									<div class="flex-shrink-0">
										<img
											src={getProductImage(item)}
											alt={item.description || item.name || 'Product'}
											class="w-20 h-20 object-cover rounded-md border"
											on:error={() => handleProductImageError(index)}
										/>
									</div>
								{:else}
									<div class="flex-shrink-0 w-20 h-20 bg-muted rounded-md border flex items-center justify-center">
										<Package class="h-8 w-8 text-muted-foreground" />
									</div>
								{/if}

								<!-- Product details -->
								<div class="flex-1 min-w-0">
									<h4 class="font-medium text-sm truncate">
										{item.description || item.name || 'Item'}
									</h4>
									{#if item.sku}
										<p class="text-xs text-muted-foreground mt-1">
											SKU: {item.sku}
										</p>
									{/if}
									{#if item.variant || item.options}
										<p class="text-xs text-muted-foreground mt-1">
											{item.variant || item.options}
										</p>
									{/if}
									<div class="flex items-center justify-between mt-2">
										<span class="text-sm text-muted-foreground">
											Qty: {item.quantity}
										</span>
										<div class="text-right">
											<p class="text-sm font-medium">
												{formatCurrency(item.line_price?.value || item.line_price || 0)}
											</p>
											{#if item.unit_price}
												<p class="text-xs text-muted-foreground">
													{formatCurrency(item.unit_price?.value || item.unit_price || 0)} each
												</p>
											{/if}
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>

					<Separator class="my-6" />

					<!-- Order summary -->
					<div class="space-y-2">
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Subtotal</span>
							<span>{formatCurrency(order?.order_info?.sub_total || 0)}</span>
						</div>
						{#if order?.order_info?.cart_discount?.value > 0}
							<div class="flex justify-between text-sm">
								<span class="text-muted-foreground">Discount</span>
								<span class="text-green-600">
									-{formatCurrency(order?.order_info?.cart_discount || 0)}
								</span>
							</div>
						{/if}
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Shipping</span>
							<span>{formatCurrency(order?.order_info?.shipping_total || 0)}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Tax</span>
							<span>{formatCurrency(order?.order_info?.tax || 0)}</span>
						</div>
						<Separator class="my-2" />
						<div class="flex justify-between font-semibold">
							<span>Total</span>
							<span>{formatCurrency(order?.order_info?.total || order?.order_total || 0)}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right column - Customer, shipping, and payment info -->
		<div class="space-y-6">
			<!-- Store information -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Store class="h-4 w-4" />
						Store Information
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center gap-3">
						{#if !faviconError}
							<img
								src={`https://www.google.com/s2/favicons?sz=64&domain_url=${order?.shop_id}`}
								alt={order?.display_name || order?.shop_id}
								class="w-12 h-12 rounded-md border object-cover"
								on:error={handleFaviconError}
							/>
						{:else}
							<div class="w-12 h-12 rounded-md border bg-muted flex items-center justify-center">
								<Store class="h-6 w-6 text-muted-foreground" />
							</div>
						{/if}
						<div class="flex-1 min-w-0">
							<p class="font-medium text-sm">
								{order?.display_name || 'Store'}
							</p>
							<div class="flex items-center gap-2">
								<p class="text-sm text-muted-foreground truncate">
									{order?.shop_id}
								</p>
								<CopyToClipboard value={order?.shop_id} />
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Customer information -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<User class="h-4 w-4" />
						Customer Information
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-3">
					<div class="flex items-center gap-2 text-sm">
						<Mail class="h-4 w-4 text-muted-foreground" />
						<span class="truncate">
							{displayFromHash(order?.order_info?.shipping_info?.email)}
						</span>
					</div>
					<div class="flex items-center gap-2 text-sm">
						<Phone class="h-4 w-4 text-muted-foreground" />
						<span>{displayFromHash(order?.order_info?.shipping_info?.phone)}</span>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Shipping information -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<MapPin class="h-4 w-4" />
						Shipping Address
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<address class="not-italic text-sm space-y-1">
						{#if order?.order_info?.shipping_info?.name}
							<p class="font-medium">{order.order_info.shipping_info.name}</p>
						{/if}
						{#if order?.order_info?.shipping_info?.address_line_1}
							<p>{order.order_info.shipping_info.address_line_1}</p>
						{/if}
						{#if order?.order_info?.shipping_info?.address_line_2}
							<p>{order.order_info.shipping_info.address_line_2}</p>
						{/if}
						<p>
							{order?.order_info?.shipping_info?.city},
							{order?.order_info?.shipping_info?.state_or_province}
							{order?.order_info?.shipping_info?.postal_code}
						</p>
						{#if order?.order_info?.shipping_info?.country}
							<p>{order.order_info.shipping_info.country}</p>
						{/if}
					</address>
				</Card.Content>
			</Card.Root>

			<!-- Billing information -->
			{#if order?.order_info?.billing_info}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex items-center gap-2 text-base">
							<CreditCard class="h-4 w-4" />
							Billing Address
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<address class="not-italic text-sm space-y-1">
							{#if order?.order_info?.billing_info?.name}
								<p class="font-medium">{order.order_info.billing_info.name}</p>
							{/if}
							{#if order?.order_info?.billing_info?.address_line_1}
								<p>{order.order_info.billing_info.address_line_1}</p>
							{/if}
							{#if order?.order_info?.billing_info?.address_line_2}
								<p>{order.order_info.billing_info.address_line_2}</p>
							{/if}
							<p>
								{order?.order_info?.billing_info?.city},
								{order?.order_info?.billing_info?.state_or_province}
								{order?.order_info?.billing_info?.postal_code}
							</p>
							{#if order?.order_info?.billing_info?.country}
								<p>{order.order_info.billing_info.country}</p>
							{/if}
						</address>
					</Card.Content>
				</Card.Root>
			{/if}

			<!-- Shipping method -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<Truck class="h-4 w-4" />
						Shipping Method
					</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2">
					<p class="text-sm font-medium">
						{order?.order_info?.shipping_method?.description || 'Standard Shipping'}
					</p>
					{#if order?.order_info?.shipping_method?.estimated_delivery}
						<p class="text-sm text-muted-foreground">
							Estimated delivery: {order.order_info.shipping_method.estimated_delivery}
						</p>
					{/if}
					{#if order?.order_info?.shipping_method?.tracking_number}
						<div class="flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Tracking:</span>
							<span class="text-sm font-mono">
								{order.order_info.shipping_method.tracking_number}
							</span>
							<CopyToClipboard value={order.order_info.shipping_method.tracking_number} />
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<!-- Payment information -->
			<Card.Root>
				<Card.Header>
					<Card.Title class="flex items-center gap-2 text-base">
						<CreditCard class="h-4 w-4" />
						Payment Information
					</Card.Title>
				</Card.Header>
				<Card.Content>
					{#if order?.order_info?.payment_summary}
						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<Badge variant="secondary" class="text-xs">
									{order.order_info.payment_summary.card_type || 'Card'}
								</Badge>
								{#if order?.order_info?.payment_summary?.last_four}
									<span class="text-sm font-mono">
										•••• {order.order_info.payment_summary.last_four}
									</span>
								{/if}
							</div>
							{#if order?.order_info?.payment_summary?.amount}
								<p class="text-sm text-muted-foreground">
									Amount: {formatCurrency(order.order_info.payment_summary.amount)}
								</p>
							{/if}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No payment information available</p>
					{/if}
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
