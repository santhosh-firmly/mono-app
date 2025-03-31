<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */

	import { getPrice } from '$lib-v4/browser/cart-helper.js';
	import { ProductComplimentaryGift, ProductSize } from '$lib-v4/browser/localization.js';
	import ProductQuantity from './product-quantity.svelte';

	// {
	//     "line_item_id": "3fa65f0a-136e-4817-98c0-7a456d448261",
	//     "sku": "136917",
	//     "base_sku": "136917",
	//     "quantity": 1,
	//     "price": {
	//         "currency": "USD",
	//         "value": 36
	//     },
	//     "line_price": {
	//         "currency": "USD",
	//         "value": 36
	//     },
	//     "image": {
	//         "url": "https://www.origins.com/media/export/cms/products/600x600_gray/origins_sku_048E01_600x600_gray_0.jpg"
	//     },
	//     "platform_specific": {
	//         "PRODUCT_SIZE": "8.5 fl. oz.",
	//         "HEX_VALUE": "",
	//         "SHADENAME": ""
	//     },
	//     "requires_shipping": true,
	//     "platform_line_item_id": "SKU136917_10806117367",
	//     "description": "Checks and Balances&#8482;",
	//     "variant_description": "Frothy Face Wash",
	//     "is_sample_or_gift": false
	// }

	export let lineItem;

	let hexValue = '#ffffff00';
	$: {
		if (lineItem.platform_specific?.HEX_VALUE) {
			hexValue = '#' + lineItem.platform_specific?.HEX_VALUE;
		}
	}
</script>

<div class="py-1 text-xs" id="title">{@html lineItem.description}</div>
<div class="pb-2 text-sm font-semibold" id="variant">{lineItem.variant_description || ''}</div>
{#if lineItem.platform_specific?.PRODUCT_SIZE}
	<div class="pb-2 text-sm" id="variant">
		{ProductSize}
		{lineItem.platform_specific.PRODUCT_SIZE || ''}
	</div>
{/if}
{#if lineItem.platform_specific?.SHADENAME}
	<div class="flex items-center pb-2 text-sm" id="variant">
		<span class="mr-2 inline-block h-6 w-6 rounded-full" style:background-color={hexValue} />
		{lineItem.platform_specific.SHADENAME || ''}
	</div>
{/if}
{#if lineItem.is_sample_or_gift}
	<div class="text-secondary py-1 text-sm">{ProductComplimentaryGift}</div>
{:else}
	<div class="flex flex-row">
		<span class="pr-1 text-xs font-semibold" id="price">{getPrice(lineItem.price)}</span>
		{#if lineItem.price.value != lineItem.msrp?.value}
			<span class="text-secondary text-xs font-semibold line-through" id="msrp"
				>{getPrice(lineItem.msrp)}</span
			>
		{/if}
	</div>
{/if}
<ProductQuantity {lineItem} />
