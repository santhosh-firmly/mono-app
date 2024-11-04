<script>
	// @ts-nocheck
	import { getPrice } from '$lib/browser/cart-helper.js';
	import { sCart } from '$lib/browser/api-manager.js';
	import {
		CartDiscount,
		CartShipping,
		CartStoreCredit,
		CartSubTotal,
		CartTax,
		CartTotal
	} from '$lib/browser/localization.js';
	import ProductCard from '../product/product-card.svelte';
</script>

<div class="flex pb-1 px-4 text-sm rounded-md flex-col divide-divide divide-y bg-gray-100">
	{#if $sCart.line_items}
		{#each $sCart.line_items as line_item (line_item.line_item_id)}
			<ProductCard lineItem={line_item} shopId={$sCart.shop_id} />
		{/each}
	{/if}
	<div class="flex flex-col text-xs gap-2 pt-3">
		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start">{CartSubTotal}</div>
			<div class="flex basis-1/2 justify-end">{getPrice($sCart.sub_total)}</div>
		</div>
		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start">{CartShipping}</div>
			<div class="flex basis-1/2 justify-end text-secondary">
				{getPrice($sCart.shipping_total)}
			</div>
		</div>
		<div class="flex flex-row gap-x-2">
			<div class="flex basis-1/2 justify-start">{CartTax}</div>
			<div class="flex basis-1/2 justify-end text-secondary">{getPrice($sCart.tax)}</div>
		</div>

		{#if $sCart.cart_discount && $sCart.cart_discount.value > 0}
			<div class="flex flex-row gap-x-2">
				<div class="flex basis-1/2 justify-start">{CartDiscount}</div>
				<div class="flex basis-1/2 justify-end font-semibold text-green-600">
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
			<div class="flex basis-1/2 justify-start font-semibold">{CartTotal}</div>
			<div class="flex basis-1/2 justify-end font-semibold">{getPrice($sCart.total)}</div>
		</div>
	</div>
</div>
