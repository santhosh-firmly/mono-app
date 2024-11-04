<script>
	// @ts-nocheck
	import { getPrice } from '$lib/browser/cart-helper';
	import { createEventDispatcher } from 'svelte';
	import Product from '../mk/cart/product.svelte';
	import Radio from '$lib/components/vendor/radio.svelte';

	const dispatch = createEventDispatcher();

	export let disabled;
	export let cart;
	export let showShippingMethodSkeleton;

	let deliverySelected = cart.shipping_method.sku;

	async function onDeliveryChosen(shippingMethodSku, cart) {
		if (shippingMethodSku !== cart.shipping_method.sku) {
			dispatch('changeDeliveryMethod', {
				shippingMethodSku,
				cart
			});
		}
	}
</script>

{#if cart.cart_status === 'active'}
	<div class="flex flex-wrap flex-1 flex-col">
		<div class="container">
			<span class="flex p-4 font-bold text-lg">{cart.display_name || cart.shop_id}</span>

			<div class="flex items-start">
				<div class="flex w-1/2 grid grid-cols-1">
					{#each cart.line_items as item (item.line_item_id)}
						<Product allowModification={false} {item} />
					{/each}
				</div>

				<div class="flex w-1/2 text-md">
					<div>
						<span>Choose your delivery option:</span>
						{#each cart.shipping_method_options || [] as shippingMethodOption}
							<div class="flex mt-2">
								<Radio
									{disabled}
									value={shippingMethodOption.sku}
									role="radio"
									bind:group={deliverySelected}
									on:click={() => onDeliveryChosen(shippingMethodOption.sku, cart)}
								></Radio>
								{#if showShippingMethodSkeleton}
									<div role="status" class="space-y-6 animate-pulse w-full">
										<div class="ml-3 h-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>
										<span class="sr-only">Loading...</span>
									</div>
								{:else}
									<div class="flex flex-wrap ml-3">
										<div class="mr-4">{getPrice(shippingMethodOption.price)}</div>
										<div>{shippingMethodOption.description}</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		position: relative;
	}
</style>
