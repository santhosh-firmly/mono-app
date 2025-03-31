<script>
	// @ts-nocheck
	import { getPrice } from '$lib-v4/browser/cart-helper';
	import { createEventDispatcher } from 'svelte';
	import Product from '../mk/cart/product.svelte';
	import Radio from '$lib-v4/components/vendor/radio.svelte';

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
	<div class="flex flex-1 flex-col flex-wrap">
		<div class="container">
			<span class="flex p-4 text-lg font-bold" data-testid="merchant-name"
				>{cart.display_name || cart.shop_id}</span
			>

			<div class="flex items-start">
				<div class="flex grid w-1/2 grid-cols-1">
					{#each cart.line_items as item (item.line_item_id)}
						<Product allowModification={false} {item} />
					{/each}
				</div>
				<div class="text-md flex w-1/2">
					<div>
						<span>Choose your delivery option:</span>
						{#each cart.shipping_method_options || [] as shippingMethodOption}
							<div class="mt-2 flex">
								<Radio
									{disabled}
									value={shippingMethodOption.sku}
									role="radio"
									bind:group={deliverySelected}
									on:click={() => onDeliveryChosen(shippingMethodOption.sku, cart)}
									data-testid="shipping-method-{shippingMethodOption.sku}"
								></Radio>
								{#if showShippingMethodSkeleton}
									<div role="status" class="w-full animate-pulse space-y-6">
										<div class="ml-3 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
										<span class="sr-only">Loading...</span>
									</div>
								{:else}
									<div class="ml-3 flex flex-wrap">
										<div class="mr-4" data-testid="shipping-price">
											{getPrice(shippingMethodOption.price)}
										</div>
										<div data-testid="shipping-description">{shippingMethodOption.description}</div>
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
