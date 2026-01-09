<script>
	import { goto } from '$app/navigation';
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
		StoreInfoCard,
		OrderNavigation
	} from '$lib/components/order/index.js';

	export let data;

	$: order = data?.order;
	$: navigation = data?.navigation;

	function navigateToOrder(orderId) {
		if (orderId) {
			goto(`${orderId}`);
		}
	}
</script>

<div class="flex flex-col gap-4 p-4 md:p-6">
	<!-- Header with navigation -->
	<OrderNavigation
		title="Order Details"
		subtitle="Order {navigation?.currentIndex} of {navigation?.totalOrders} from {order?.display_name ||
			order?.shop_id}"
		hasPrev={!!navigation?.prevOrder}
		hasNext={!!navigation?.nextOrder}
		onBack={() => goto('orders')}
		onPrev={() => navigateToOrder(navigation?.prevOrder?.platform_order_number)}
		onNext={() => navigateToOrder(navigation?.nextOrder?.platform_order_number)}
	/>

	<!-- Main content grid -->
	<div class="grid gap-6 lg:grid-cols-3">
		<!-- Left column - Order items and summary -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Order header card -->
			<OrderHeader
				orderNumber={order?.platform_order_number}
				status={order?.status || 'Completed'}
				createdAt={order?.created_dt}
				dateFormat="MMMM dd, yyyy 'at' h:mm a"
			/>

			<!-- Order items -->
			<OrderItemsList items={order?.order_info?.line_items || []} />

			<!-- Order summary -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Order Summary</Card.Title>
				</Card.Header>
				<Card.Content>
					<OrderSummary
						subtotal={order?.order_info?.sub_total || 0}
						discount={order?.order_info?.cart_discount?.value || 0}
						shipping={order?.order_info?.shipping_total || 0}
						tax={order?.order_info?.tax || 0}
						total={order?.order_info?.total || order?.order_total || 0}
					/>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Right column - Store, Customer, shipping, and payment info -->
		<div class="space-y-6">
			<!-- Store information -->
			<StoreInfoCard domain={order?.shop_id} displayName={order?.display_name} />

			<!-- Customer information -->
			<CustomerInfoCard
				email={order?.order_info?.shipping_info?.email}
				phone={order?.order_info?.shipping_info?.phone}
			/>

			<!-- Shipping information -->
			<ShippingAddressCard address={order?.order_info?.shipping_info || {}} />

			<!-- Billing information -->
			{#if order?.order_info?.billing_info}
				<BillingAddressCard address={order?.order_info?.billing_info} />
			{/if}

			<!-- Shipping method -->
			<ShippingMethodCard
				description={order?.order_info?.shipping_method?.description}
				estimatedDelivery={order?.order_info?.shipping_method?.estimated_delivery}
				trackingNumber={order?.order_info?.shipping_method?.tracking_number}
			/>

			<!-- Payment information -->
			<PaymentInfoCard
				cardType={order?.order_info?.payment_summary?.card_type}
				lastFour={order?.order_info?.payment_summary?.last_four}
				amount={order?.order_info?.payment_summary?.amount}
			/>
		</div>
	</div>
</div>
