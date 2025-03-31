<script>
	// @ts-nocheck
	import { getPrice } from '$lib-v4/browser/cart-helper';

	export let cart;
	export let showCalculatingText;
</script>

<aside class="mt-4 rounded-lg border" data-testid="order-summary-box">
	<div class="order-summary p-6">
		<div class="mb-2 flex">
			<span class="flex flex-row text-lg font-bold" data-testid="order-summary-title"
				>Order Summary</span
			>
		</div>
		<div class="mt-1 mb-1 flex flex-wrap justify-between text-base">
			<span data-testid="items-label">Items</span>
			<span data-testid="items-value">{getPrice(cart?.sub_total)}</span>
		</div>
		<div class="mt-1 mb-1 flex flex-wrap justify-between text-base">
			<span data-testid="shipping-label">Shipping</span>
			{#if showCalculatingText}
				<span class="text-sm" data-testid="shipping-calculating">Calculating...</span>
			{:else if !cart?.shipping_info}
				<span class="text-sm text-gray-700" data-testid="shipping-address-needed"
					>Enter shipping address</span
				>
			{:else}
				<span data-testid="shipping-value">{getPrice(cart?.shipping_total)}</span>
			{/if}
		</div>
		<div class="mt-1 mb-1 flex flex-wrap justify-between text-base">
			<span data-testid="tax-label">Tax</span>
			{#if showCalculatingText}
				<span class="text-sm" data-testid="tax-calculating">Calculating...</span>
			{:else}
				<span data-testid="tax-value">{getPrice(cart?.tax)}</span>
			{/if}
		</div>
		<div class="mt-1 mb-1 flex flex-wrap justify-between border-b-2 text-base">
			<span data-testid="discounts-label">Discounts</span>
			<span data-testid="discounts-value">{getPrice(cart?.cart_discount)}</span>
		</div>
		<div class="mt-1 flex flex-wrap justify-between text-lg font-bold">
			<span data-testid="total-label">Total</span>
			<span data-testid="total-value">{getPrice(cart?.total)}</span>
		</div>
	</div>
</aside>
