<script>
	// @ts-nocheck
	import { getPrice } from '$lib-v4/browser/cart-helper.js';
	import { sCart } from '$lib-v4/browser/api-manager.js';
	import {
		CartDiscount,
		CartShipping,
		CartStoreCredit,
		CartSubTotal,
		CartTax,
		CartTotal
	} from '$lib-v4/browser/localization.js';
	import ProductCard from '../product/product-card.svelte';
</script>

<div class="divide-divide flex flex-col divide-y rounded-md bg-gray-100 px-4 pb-1 text-sm">
	{#if $sCart.line_items}
		{#each $sCart.line_items as line_item (line_item.line_item_id)}
			<ProductCard
				lineItem={line_item}
				shopId={$sCart.shop_id}
				data-testid="line-item-{line_item.line_item_id}"
			/>
		{/each}
	{/if}
	<div class="flex flex-col gap-2 pt-3 text-xs">
		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start" data-testid="subtotal-label">{CartSubTotal}</div>
			<div class="flex basis-1/2 justify-end font-semibold" data-testid="subtotal-value">
				{getPrice($sCart.sub_total)}
			</div>
		</div>
		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start">{CartShipping}</div>
			<div class="text-secondary flex basis-1/2 justify-end">
				{getPrice($sCart.shipping_total)}
			</div>
		</div>
		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start">{CartTax}</div>
			<div class="text-secondary flex basis-1/2 justify-end">{getPrice($sCart.tax)}</div>
		</div>

		{#if $sCart.cart_discount && $sCart.cart_discount.value > 0}
			<div class="flex flex-row gap-x-2">
				<div class="flex basis-1/2 justify-start" data-testid="discount-label">{CartDiscount}</div>
				<div
					class="flex basis-1/2 justify-end font-semibold text-green-600"
					data-testid="discount-value"
				>
					-{getPrice($sCart.cart_discount)}
				</div>
			</div>
		{/if}
		{#if $sCart.store_credit && $sCart.store_credit.value > 0}
			<div class="flex flex-row gap-x-2">
				<div class="flex basis-1/2 justify-start">{CartStoreCredit}</div>
				<div class="flex basis-1/2 justify-end font-semibold text-green-600">
					-{getPrice($sCart.store_credit)}
				</div>
			</div>
		{/if}

		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start font-semibold" data-testid="total-label">
				{CartTotal}
			</div>
			<div class="flex basis-1/2 justify-end font-semibold" data-testid="total-value">
				{getPrice($sCart.total)}
			</div>
		</div>
	</div>
</div>
