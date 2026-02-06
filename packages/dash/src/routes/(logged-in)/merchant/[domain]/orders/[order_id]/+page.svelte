<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Package from 'lucide-svelte/icons/package';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		OrderHeader,
		OrderItemsList,
		OrderSummary,
		CustomerInfoCard,
		ShippingAddressCard,
		BillingAddressCard,
		ShippingMethodCard,
		PaymentInfoCard,
		PartnerInfoCard,
		OrderNavigation
	} from '$lib/components/order/index.js';
	import { adminFetch } from '$lib/utils/fetch.js';

	let domain = $derived($page.params.domain);
	let orderId = $derived($page.params.order_id);

	// State
	let order = $state(null);
	let destinationName = $state('');
	let navigation = $state(null);
	let loading = $state(true);
	let error = $state('');

	// Fetch order on mount
	$effect(() => {
		fetchOrder();
	});

	async function fetchOrder() {
		loading = true;
		error = '';

		try {
			const response = await adminFetch(`/merchant/${domain}/api/orders/${orderId}`);
			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to fetch order');
			}

			order = result.order;
			destinationName = result.destinationName;
			navigation = result.navigation;
		} catch (err) {
			error = err.message;
			order = null;
		} finally {
			loading = false;
		}
	}

	function navigateToOrder(orderNumber) {
		if (orderNumber) {
			goto(`${orderNumber}`);
		}
	}
</script>

<div class="space-y-6">
	{#if loading}
		<div class="flex items-center justify-center py-24">
			<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
		</div>
	{:else if error}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<Package class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
				<h3 class="mb-2 text-lg font-medium">Order not found</h3>
				<p class="mb-4 text-muted-foreground">{error}</p>
				<Button variant="outline" onclick={() => goto('../orders')}>
					<ArrowLeft class="mr-2 h-4 w-4" />
					Back to orders
				</Button>
			</Card.Content>
		</Card.Root>
	{:else if order}
		<!-- Header with navigation -->
		<OrderNavigation
			title="Order Details"
			currentIndex={navigation?.currentIndex}
			totalOrders={navigation?.totalOrders}
			hasPrev={!!navigation?.prevOrder}
			hasNext={!!navigation?.nextOrder}
			onBack={() => goto('../orders')}
			onPrev={() => navigateToOrder(navigation?.prevOrder?.platform_order_number)}
			onNext={() => navigateToOrder(navigation?.nextOrder?.platform_order_number)}
		/>

		<!-- Main content grid -->
		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Left column - Order items and summary -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Order header card -->
				<OrderHeader
					orderNumber={order.platform_order_number}
					status={order.status || 'Completed'}
					createdAt={order.created_dt}
				/>

				<!-- Order items -->
				<OrderItemsList items={order.order_info?.line_items || []} />

				<!-- Order summary -->
				<Card.Root>
					<Card.Header>
						<Card.Title>Order Summary</Card.Title>
					</Card.Header>
					<Card.Content>
						<OrderSummary
							subtotal={order.order_info?.sub_total || 0}
							discount={order.order_info?.cart_discount?.value || 0}
							shipping={order.order_info?.shipping_total || 0}
							tax={order.order_info?.tax || 0}
							total={order.order_info?.total || order.order_total || 0}
							refund={order.order_info?.refund_total}
						/>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Right column - Partner, Customer, shipping, and payment info -->
			<div class="space-y-6">
				<!-- Partner/Destination information -->
				<PartnerInfoCard name={destinationName} />

				<!-- Customer information -->
				<CustomerInfoCard
					email={order.order_info?.shipping_info?.email}
					phone={order.order_info?.shipping_info?.phone}
				/>

				<!-- Shipping information -->
				<ShippingAddressCard address={order.order_info?.shipping_info || {}} />

				<!-- Billing information -->
				{#if order.order_info?.billing_info}
					<BillingAddressCard address={order.order_info?.billing_info} />
				{/if}

				<!-- Shipping method -->
				<ShippingMethodCard
					description={order.order_info?.shipping_method?.description}
					estimatedDelivery={order.order_info?.shipping_method?.estimated_delivery}
					trackingNumber={order.order_info?.shipping_method?.tracking_number}
				/>

				<!-- Payment information -->
				<PaymentInfoCard
					cardType={order.order_info?.payment_summary?.card_type}
					lastFour={order.order_info?.payment_summary?.last_four}
					amount={order.order_info?.payment_summary?.amount}
				/>
			</div>
		</div>
	{/if}
</div>
