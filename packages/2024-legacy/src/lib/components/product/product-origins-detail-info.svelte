<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */

	import { getPrice } from '$lib/browser/cart-helper.js';
	import { ProductComplimentaryGift, ProductSize } from '$lib/browser/localization.js';
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

<div class="text-xs py-1" id="title">{@html lineItem.description}</div>
<div class="text-sm pb-2 font-semibold" id="variant">{lineItem.variant_description || ''}</div>
{#if lineItem.platform_specific?.PRODUCT_SIZE}
	<div class="text-sm pb-2" id="variant">
		{ProductSize}
		{lineItem.platform_specific.PRODUCT_SIZE || ''}
	</div>
{/if}
{#if lineItem.platform_specific?.SHADENAME}
	<div class="flex text-sm pb-2 items-center" id="variant">
		<span class="inline-block h-6 w-6 rounded-full mr-2" style:background-color={hexValue} />
		{lineItem.platform_specific.SHADENAME || ''}
	</div>
{/if}
{#if lineItem.is_sample_or_gift}
	<div class="text-sm py-1 text-secondary">{ProductComplimentaryGift}</div>
{:else}
	<div class="flex flex-row">
		<span class="text-xs font-semibold pr-1" id="price">{getPrice(lineItem.price)}</span>
		{#if lineItem.price.value != lineItem.msrp?.value}
			<span class="text-xs font-semibold line-through text-secondary" id="msrp"
				>{getPrice(lineItem.msrp)}</span
			>
		{/if}
	</div>
{/if}
<ProductQuantity {lineItem} />
