<script>
	// @ts-nocheck

	import ProductDetailInfo from './product-detail-info.svelte';
	import ProductOriginsDetailInfo from './product-origins-detail-info.svelte';

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
	export let shopId = null;
	let component = ProductDetailInfo;
	switch (shopId) {
		case 'origins.com':
			component = ProductOriginsDetailInfo;
			break;
		default:
			component = ProductDetailInfo;
			break;
	}
</script>

<div class="flex flex-row py-1">
	<div class="flex basis-2/5 overflow-hidden px-1">
		{#if shopId === 'adoreme.com'}
			<div
				id="image"
				class="aspect-square h-full w-full bg-contain bg-center bg-no-repeat bg-origin-border"
				style="background-image: url('{lineItem.image.url}'); transform: scale(1.35);"
			/>
		{:else}
			<div
				id="image"
				class="aspect-square h-full w-full bg-contain bg-center bg-no-repeat bg-origin-border"
				style="background-image: url('{lineItem.image.url}');"
			/>
		{/if}
	</div>
	<div class="px-0:sm flex basis-3/5 flex-col px-1">
		<svelte:component this={component} {lineItem} />
	</div>
</div>
