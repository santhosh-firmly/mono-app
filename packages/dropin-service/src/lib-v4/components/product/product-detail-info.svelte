<script>
	// @ts-nocheck
	import { getPrice, getPriceFromValue } from '$lib-v4/browser/cart-helper.js';
	import ProductQuantity from './product-quantity.svelte';

	// {
	//     "sku": "29220738629684",
	//     "base_sku": "3794918441012",
	//     "quantity": 1,
	//     "price": {
	//         "currency": "USD",
	//         "value": 1
	//     },
	//     "line_price": {
	//         "currency": "USD",
	//         "value": 1
	//     },
	//     "requires_shipping": true,
	//     "image": {
	//         "url": "http://cdn.shopify.com/s/files/1/0065/5812/2036/products/White_T-shirt_design-front_small.jpg?v=1565573341"
	//     },
	//     "platform_line_item_id": "6f80133e6a24145362864e74a7c02fda",
	//     "description": "Short Sleeve White T-Shirt",
	//     "variant_description": "S"
	// }

	export let lineItem;

	function getRecurringSuffix() {
		switch (lineItem.recurring) {
			case 'monthly':
				return '/mo';
			case 'quaterly':
				return '/qt';
			case 'yearly':
				return '/yr';
			default:
				return '';
		}
	}
</script>

<div class="py-1 text-sm font-semibold" id="title">{lineItem.description}</div>
<div class="text-secondary pb-1 text-xs" id="variant">{lineItem.variant_description || ''}</div>
<div class="flex flex-row">
	<span class="pr-1 text-xs font-semibold" id="price">
		<!-- Due to adoreme changes to display the VIP discounted price -->
		{lineItem.vip_discount
			? getPriceFromValue(
					lineItem.line_price.value - lineItem.line_discount.value,
					lineItem.line_discount.currency
				)
			: getPrice(lineItem.line_price)}{getRecurringSuffix()}</span
	>
	{#if lineItem.msrp && lineItem.price.value != lineItem.msrp?.value}
		<span class="text-secondary text-xs font-semibold line-through" id="msrp"
			>{getPriceFromValue(lineItem.msrp.value * lineItem.quantity, lineItem.msrp.currency)}</span
		>
	{/if}
</div>
<!-- TODO: Once the information if the product is discounted due to VIP membership is available, use this to enable it. -->
{#if lineItem.vip_discount}
	<div class="my-2">
		<span class="rounded bg-rose-700 px-2 text-xs text-white"> VIP Discount </span>
	</div>
{/if}
{#if !lineItem.fixed_quantity}
	<ProductQuantity {lineItem} />
{/if}
