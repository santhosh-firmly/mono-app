<script>
	// @ts-nocheck

	import { page } from '$app/stores';
	import Header from '$lib/components/mk/header.svelte';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import { onMount } from 'svelte';

	export let orders;

	onMount(() => {
		if (!orders) {
			const orderIds = $page.params.slug.split(',');
			const allOrders = window.firmly.sdk.Orders.getAllOrders();
			orders = allOrders.filter((o) => orderIds.includes(o.platform_order_number));
		}
	});
</script>

<Header logoOnly={true} />
{#if orders && orders?.[0]}
	<div class="flex flex-col w-full items-center">
		<div class="flex flex-col items-center max-w-[800px]">
			<div class="flex flex-col h-full w-full items-center justify-center">
				<div class="p-4 flex flex-col justify-center items-center">
					<LottiePlayer
						width={64}
						height={64}
						src="/thank-you.json"
						autoplay={true}
						loop={false}
						renderer="svg"
						background="transparent"
					/>
					<h1 class="mt-4 text-3xl font-normal">
						Thank you, {orders?.[0]?.billing_info?.first_name}!
					</h1>
				</div>
				<div class="m-2 flex flex-col">
					<span class="text-[#34c759] font-bold text-center">
						Your order is confirmed.<br />
						You’'ll receive confirmation emails from the merchants with your order numbers shortly.
					</span>
				</div>
				<div class="m-4">
					<div>
						<h2 class="font-bold text-lg text-center">Order Confirmation Numbers</h2>
					</div>
					<div class="flex flex-row">
						<table class="w-full m-4">
							{#each orders as order}
								<tr>
									<td><span class="m-4">{order.display_name || order.shop_id}</span></td>
									<td><span class="m-4">{order.platform_order_number}</span></td>
								</tr>
							{/each}
						</table>
					</div>
				</div>
				<div>
					<h2 class="font-bold text-lg">Order details</h2>
				</div>
				<div class="flex flex-row">
					<div class="m-6">
						<h3 class="font-bold">Contact information</h3>
						<div>
							<p class="font-thin my-1">romeo@firmly.ai</p>
						</div>
					</div>
					<div class="m-6">
						<h3 class="font-bold">Payment method</h3>
						<div>
							<div>
								<div>
									<div class="flex flex-row items-center">
										<img
											alt="VISA"
											src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/0169695890db3db16bfe.svg"
											width="38"
											height="24"
										/>
										<p class="font-thin m-1">
											<span
												>{orders?.[0]?.payment_summary?.card_type} •••• {orders?.[0]?.payment_method
													?.last_four || orders?.[0]?.payment_summary?.last_four} - ${orders
													?.reduce?.((acc, o) => acc + o?.total?.value, 0)
													?.toFixed?.(2)}</span
											>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="flex flex-row">
					<div class="m-6">
						<h3 class="font-bold">Shipping address</h3>
						<p></p>
						<address class="font-thin not-italic my-1">
							{orders?.[0]?.shipping_info?.first_name}
							{orders?.[0]?.shipping_info?.last_name}<br />
							{orders?.[0]?.shipping_info?.address1}
							{orders?.[0]?.shipping_info?.address2 || ''}<br />
							{orders?.[0]?.shipping_info?.city}
							{orders?.[0]?.shipping_info?.state_or_province}
							{orders?.[0]?.shipping_info?.postal_code}<br />
							{orders?.[0]?.shipping_info?.country}<br />
							{orders?.[0]?.shipping_info?.phone}
						</address>
					</div>
					<div class="m-6">
						<h3 class="font-bold">Billing address</h3>
						<address class="font-thin not-italic my-1">
							{orders?.[0]?.billing_info?.first_name}
							{orders?.[0]?.billing_info?.last_name}<br />
							{orders?.[0]?.billing_info?.address1}
							{orders?.[0]?.billing_info?.address2 || ''}<br />
							{orders?.[0]?.billing_info?.city}
							{orders?.[0]?.billing_info?.state_or_province}
							{orders?.[0]?.billing_info?.postal_code}<br />
							{orders?.[0]?.billing_info?.country}<br />
							{orders?.[0]?.billing_info?.phone}
						</address>
					</div>
				</div>
			</div>
			<a
				href="/"
				class="m-3 mb-12 border-2 border-[#4c7cec] bg-[#4c7cec] text-white w-full text-center focus:ring-4 focus:outline-none items-center justify-center px-5 py-2 text-white focus:ring-blue-300 rounded-3xl hover:bg-blue-800 uppercase font-semibold text-normal"
				>Continue Shopping
			</a>
		</div>
	</div>
{/if}
