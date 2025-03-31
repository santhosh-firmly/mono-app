<script>
	// @ts-nocheck
	/* eslint-disable svelte/no-at-html-tags */
	import MerchantLogo from '$lib-v4/components/mk/merchant-logo.svelte';
	import { logos } from '$lib-v4/components/mk/data.js';
	import Product from './product.svelte';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import { getCurrency } from '$lib-v4/utils.js';

	export let cartHive;
	export let addingToCart = false;
</script>

<div class="flex h-full w-full shrink grow flex-col overflow-scroll">
	{#if cartHive?.getAllCarts?.().length > 0}
		{#each cartHive.getAllCarts() as merchantCart (merchantCart.shop_id)}
			{@const logo = logos.find((l) => l.store_id === merchantCart.shop_id)}
			<div class="merchant flex flex-col">
				<button
					on:click={() => (merchantCart.collapsed = !merchantCart.collapsed)}
					class="flex w-full flex-row items-center justify-stretch bg-gray-100 px-4 py-2"
				>
					<MerchantLogo
						name={merchantCart.display_name || merchantCart.shop_id}
						logoUrl={logo?.logoUrl}
						logoBg={logo?.logoBg}
					/>
					<div class="flex flex-col items-start p-4">
						<span class="text-sm font-semibold" data-testid="merchant-name">
							{merchantCart.display_name || merchantCart.shop_id}
						</span>
						<span class="text-sm" data-testid="item-count">
							{merchantCart.getTotalItemCount()}
							item{merchantCart.getTotalItemCount() > 1 ? 's' : ''}</span
						>
					</div>
					<span class="grow" />
					<span class="font-bold" data-testid="merchant-subtotal"
						>{@html getCurrency(merchantCart.sub_total)}</span
					>
					<div class="pl-4">
						<svg
							class="arrow h-3 w-3 text-blue-500 hover:ring-blue-200 dark:bg-blue-400 dark:hover:ring-blue-600"
							class:down={!merchantCart.collapsed}
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 10 6"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m1 1 4 4 4-4"
							/>
						</svg>
					</div>
				</button>
				{#if !merchantCart.collapsed}
					{#each merchantCart.line_items as item (item.line_item_id)}
						<Product {item} />
					{/each}
				{/if}
			</div>
		{/each}
	{:else if addingToCart}
		<div class="flex h-full w-full grow flex-col items-center justify-center">
			<LottiePlayer
				width={96}
				height={96}
				src="/add-to-cart.json"
				autoplay={true}
				loop={true}
				renderer="svg"
				background="transparent"
			/>
			<div class="relative my-8 text-center">
				<span
					class="empty-cart-text text-center text-xl font-medium text-[#4c7cec]"
					data-testid="adding-to-cart-message"
				>
					We are adding the product to your cart...
				</span>
			</div>
		</div>
	{:else}
		<div class="flex h-full w-full grow flex-col items-center justify-center">
			<LottiePlayer
				src="/sad-cart-2.json"
				autoplay={true}
				loop={true}
				renderer="svg"
				background="transparent"
			/>
			<div class="relative my-8">
				<span
					class="empty-cart-text text-center text-2xl font-medium text-[#4c7cec]"
					data-testid="empty-cart-message">Oops! Your cart is empty!</span
				>
			</div>
			<span class="w-1/2 pb-8 text-center text-lg font-medium" data-testid="empty-cart-description"
				>Looks like you didn't add anything to your cart yet.</span
			>
		</div>
	{/if}
</div>

<style>
	.arrow {
		transition: all 1s ease;
	}

	.down {
		transform: rotateZ(-180deg);
	}
</style>
