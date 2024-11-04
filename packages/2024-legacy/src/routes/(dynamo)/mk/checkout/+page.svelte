<script>
	// @ts-nocheck
	import Header from '$lib/components/mk/header.svelte';
	import { sCartHive } from '$lib/browser/storage';
	import ShippingForm from '$lib/components/checkout/shipping-form.svelte';
	import OrderBox from '$lib/components/checkout/order-box.svelte';
	import CreditCardForm from '$lib/components/checkout/credit-card-form.svelte';
	import MerchantsSummary from '$lib/components/checkout/merchants-summary.svelte';
	import CollapsibleComponent from '$lib/components/common/collapsible-component.svelte';
	import CollapsedShippingForm from '$lib/components/checkout/collapsed-shipping-form.svelte';

	let isApiInProgress = false;
	let showCalculatingText = false;
	let showShippingMethodSkeleton = false;
	let isShippingInfoCalled = false;
	let isShippingMethodCalled = false;
	let isPlaceOrderCalled = false;
	let currentBillingInfo;

	$: {
		isApiInProgress = isShippingInfoCalled || isShippingMethodCalled || isPlaceOrderCalled;
		showCalculatingText = isShippingInfoCalled || isShippingMethodCalled;
		showShippingMethodSkeleton = isShippingInfoCalled;
	}

	$: cartsAndOrders = [...($sCartHive?.getAllCarts?.() || []), ...ordersPlaced].sort((a, b) => {
		const aDisplayString = a.display_name || a.shop_id;
		const bDisplayString = b.display_name || b.shop_id;

		if (aDisplayString > bDisplayString) {
			return 1;
		}

		// They will never be equal as carts are always from different merchants
		return -1;
	});

	$: {
		if ($sCartHive?.shipping_info) {
			shippingInfo = $sCartHive?.shipping_info;
			if (shippingInfo) {
				shippingFormExpanded = false;
			}
		}
	}

	let shippingInfo;
	let currentCreditCardInfo = {
		cardNumber: '4111 1111 1111 1111',
		cardName: 'John Smith',
		expiryDate: '03/30',
		cvc: '123'
	};
	let cartsAndOrders = [];
	let ordersPlaced = [];
	let shippingFormExpanded = true;

	async function handleSubmitShipping(event) {
		shippingInfo = event.detail.shippingInfo;
		try {
			isShippingInfoCalled = true;
			await $sCartHive.setShippingInfo(shippingInfo);
		} finally {
			isShippingInfoCalled = false;
		}
	}

	async function handleSubmitDelivery(event) {
		const { shippingMethodSku, cart } = event.detail;
		try {
			isShippingMethodCalled = true;
			await cart.setShippingMethod(shippingMethodSku);
		} finally {
			isShippingMethodCalled = false;
		}
	}

	async function handlePlaceOrder(event) {
		currentCreditCardInfo = event.detail.creditCard;
		currentBillingInfo = event.detail.billingInfo;

		const eDate = currentCreditCardInfo.expiryDate.split('/');
		const year = '20' + eDate[1].trim();
		const month = eDate[0].trim();

		try {
			isPlaceOrderCalled = true;
			const results = await Promise.allSettled(
				$sCartHive.getAllCarts().map((c) => {
					const order = c.placeOrderWithCreditCart(
						{
							name: currentCreditCardInfo.cardName.trim(),
							number: currentCreditCardInfo.cardNumber.replaceAll(' ', ''),
							month: month,
							year: year,
							verification_value: currentCreditCardInfo.cvc
						},
						currentBillingInfo
					);

					ordersPlaced.push(order);

					return order;
				})
			);

			if (results.some((orderPromise) => orderPromise.status !== 'fulfilled')) {
				// TODO: BUGBUG Some order failed. Handle this scenario...
			}

			const orderIds = results
				.filter((orderPromise) => orderPromise.status === 'fulfilled')
				.map((orderPromise) => encodeURIComponent(orderPromise.value.platform_order_number));
			window.location.href = `/mk/thank-you/${orderIds.join(',')}`;
		} finally {
			isPlaceOrderCalled = false;
		}
	}

	function expandShippingForm() {
		shippingFormExpanded = true;
	}
</script>

<Header logoOnly={true} />

<div class="flex flex-col bg-white items-center w-full">
	<div class="flex flex-row max-w-[1224px] w-full">
		<div class="w-full p-4">
			<div class="border rounded-lg divide-y mt-4 p-1">
				<CollapsibleComponent
					disabled={isApiInProgress}
					on:expand={expandShippingForm}
					collapsed={!shippingFormExpanded}
				>
					<div class="w-full" slot="expanded">
						<ShippingForm
							{shippingInfo}
							{cartsAndOrders}
							on:submit={handleSubmitShipping}
							disabled={isApiInProgress}
						/>
					</div>
					<div slot="collapsed">
						<CollapsedShippingForm {shippingInfo} />
					</div>
				</CollapsibleComponent>
			</div>

			{#if $sCartHive?.shipping_info}
				<MerchantsSummary
					{cartsAndOrders}
					on:changeDeliveryMethod={handleSubmitDelivery}
					disabled={isShippingMethodCalled}
					{showShippingMethodSkeleton}
				/>
			{:else}
				<div class="flex flex-wrap flex-1 flex-col border rounded-lg divide-y mt-6">
					<div class="container">
						<span class="flex p-4 font-bold text-lg">Delivery</span>
						<span class="flex px-4 pb-4 text-xs"
							>Enter your shipping address to view available shipping methods.</span
						>
					</div>
				</div>
			{/if}

			<div class="mt-6 p-4 border rounded-lg">
				<CreditCardForm
					on:submit={handlePlaceOrder}
					{...currentCreditCardInfo}
					disabled={isApiInProgress}
					showSpinner={isPlaceOrderCalled}
					canPlaceOrder={!!$sCartHive?.shipping_info}
					cart={$sCartHive}
					{cartsAndOrders}
				/>
			</div>
		</div>
		<div class="p-4 w-5/12">
			<OrderBox showLoading={isApiInProgress} {showCalculatingText} cart={$sCartHive} />
		</div>
	</div>
</div>
