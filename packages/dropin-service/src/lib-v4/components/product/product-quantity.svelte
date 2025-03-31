<script>
	// @ts-nocheck
	import { cartUpdateSku } from '$lib-v4/browser/api-manager.js';
	import { debounce } from '$lib-v4/browser/dash.js';
	import { ProductQuantity, ProductRemove } from '$lib-v4/browser/localization.js';
	import { onMount } from 'svelte';
	import Button from '../common/button.svelte';
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
	let quantity = 0;

	async function onRemove() {
		await cartUpdateSku(lineItem.sku, 0, lineItem.variant_handles);
	}

	const debUpdate = debounce(async () => {
		await cartUpdateSku(lineItem.sku, quantity, lineItem.variant_handles);
	}, 500);

	async function onAdd() {
		quantity++;
		debUpdate();
	}

	async function onSub() {
		if (quantity > 1) {
			quantity--;
			debUpdate();
		}
	}

	onMount(() => {
		quantity = lineItem?.quantity;
	});
</script>

<div class="text-secondary py-1 text-xs">
	<Button size="xs" color="gray" on:click={onSub}>
		<svg
			width="8"
			height="8"
			aria-hidden="true"
			focusable="false"
			role="presentation"
			viewBox="0 0 22 3"><path fill="currentColor" d="M21.5.5v2H.5v-2z" fill-rule="evenodd" /></svg
		>
	</Button>
	<span class="mx-1 px-2">
		{ProductQuantity}
		{quantity}
	</span>
	<Button size="xs" color="gray" on:click={onAdd}>
		<svg
			width="16"
			height="8"
			aria-hidden="true"
			focusable="false"
			role="presentation"
			viewBox="0 0 22 21"
		>
			<path
				d="M12 11.5h9.5v-2H12V0h-2v9.5H.5v2H10V21h2v-9.5z"
				fill="currentColor"
				fill-rule="evenodd"
			/>
		</svg>
	</Button>
</div>
<button class="text-high cursor-pointer py-1 text-right text-xs" on:click={onRemove}>
	{ProductRemove}
</button>
