<script>
	// @ts-nocheck
	import { getPrice } from '$lib/browser/cart-helper';

	export let cart;
	export let showCalculatingText;
</script>

<aside class="border rounded-lg mt-4">
	<div class="order-summary p-6">
		<div class="flex mb-2">
			<span class="flex text-lg flex-row font-bold">Order Summary</span>
		</div>
		<div class="flex flex-wrap justify-between mt-1 mb-1 text-base">
			<span>Items</span>
			<span>{getPrice(cart?.sub_total)}</span>
		</div>
		<div class="flex flex-wrap justify-between mt-1 mb-1 text-base">
			<span>Shipping</span>
			{#if showCalculatingText}
				<span class="text-sm">Calculating...</span>
			{:else if !cart?.shipping_info}
				<span class="text-sm text-gray-700">Enter shipping address</span>
			{:else}
				<span>{getPrice(cart?.shipping_total)}</span>
			{/if}
		</div>
		<div class="flex flex-wrap justify-between mt-1 mb-1 text-base">
			<span>Tax</span>
			{#if showCalculatingText}
				<span class="text-sm">Calculating...</span>
			{:else}
				<span>{getPrice(cart?.tax)}</span>
			{/if}
		</div>
		<div class="flex flex-wrap justify-between border-b-2 mt-1 mb-1 text-base">
			<span>Discounts</span>
			<span>{getPrice(cart?.cart_discount)}</span>
		</div>
		<div class="flex flex-wrap justify-between mt-1 text-lg font-bold">
			<span>Total</span>
			<span>{getPrice(cart?.total)}</span>
		</div>
	</div>
</aside>
