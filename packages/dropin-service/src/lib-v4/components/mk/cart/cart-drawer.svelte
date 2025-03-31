<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ProgressIcon from '$lib-v4/components/common/svg/api-progress-icon-2.svelte';
	import Cart from './cart.svelte';
	import { getCurrency } from '$lib-v4/utils.js';
	import { CloseButton } from 'flowbite-svelte';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
	import { slide } from 'svelte/transition';

	/**
	 * Cart Hive to be drawn to the drawer
	 */
	export let cartHive;

	/**
	 * External control to open/close the drawer
	 */
	export let drawerOpen = false;

	/**
	 * Whether or not to show the adding to cart animation
	 */
	export let addingToCart = false;

	/**
	 * Whether or not to show the loading spinner
	 */
	export let apiInProgress = false;

	/**
	 * Should block the scrolling at the body level
	 */
	export let blockScrolling = true;

	let isDrawerOpen;

	$: isDrawerOpen = drawerOpen;

	$: {
		if (typeof document !== 'undefined' && document.body && blockScrolling) {
			if (isDrawerOpen) {
				document.body.classList.add('overflow-hidden');
			} else {
				document.body.classList.remove('overflow-hidden');
			}
		}
	}

	function handleKeyDown(event) {
		if (isDrawerOpen && event.key === 'Escape') {
			event.preventDefault();
			window.firmly.sdk.CartUI.closeCart();
		}
	}

	function slideFunction(node, options) {
		return {
			duration: options.duration,
			css: (t) => {
				return `right: ${t * node.offsetWidth - node.offsetWidth}px;`;
			}
		};
	}

	let currentAnimationResolver;

	const animationEnd = () => {
		if (currentAnimationResolver) {
			currentAnimationResolver();
			currentAnimationResolver = null;
		}
	};

	onMount(async () => {
		window.firmly.sdk.CartUI.onOpenCart(
			'trigger',
			() =>
				new Promise((resolve) => {
					if (currentAnimationResolver) {
						currentAnimationResolver();
					}
					currentAnimationResolver = resolve;
					isDrawerOpen = true;
				})
		);

		window.firmly.sdk.CartUI.onCloseCart(
			'trigger',
			() =>
				new Promise((resolve) => {
					if (currentAnimationResolver) {
						currentAnimationResolver();
					}
					currentAnimationResolver = resolve;
					isDrawerOpen = false;
				})
		);
	});
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if isDrawerOpen}
	<div class="relative z-[302] container">
		<button
			class="fixed top-0 left-0 z-300 h-full w-full bg-black opacity-50 backdrop-blur"
			on:click={() => window.firmly.sdk.CartUI.closeCart()}
		/>
		<div
			class="drawer w-full sm:w-[400px]"
			transition:slideFunction
			on:outroend={animationEnd}
			on:introend={animationEnd}
		>
			<div class="flex h-full flex-col items-center justify-center">
				<div class="flex min-h-[64px] w-full items-center p-4">
					<span class="text-lg">Cart</span>
					<div class="flex grow flex-col items-center">
						{#if apiInProgress}
							<ProgressIcon />
						{/if}
					</div>
					<div>
						<CloseButton on:click={() => window.firmly.sdk.CartUI.closeCart()} />
					</div>
				</div>
				<hr class="w-4/5" />

				<Cart {addingToCart} {cartHive} />

				<div class="grow" />
				<div class="summary flex w-full flex-col">
					{#if cartHive?.getAllCarts?.().length > 0 && addingToCart}
						<hr class="w-4/5 self-center" />

						<div
							transition:slide
							class="relative flex h-[48px] w-full flex-row items-center justify-center gap-8"
						>
							<LottiePlayer
								src="/add-to-cart.json"
								autoplay={true}
								loop={true}
								renderer="svg"
								background="transparent"
							/>
							<div class="relative text-center">
								<span class="empty-cart-text text-center text-sm font-medium text-[#4c7cec]">
									We are adding the product to your cart...
								</span>
							</div>
						</div>
					{/if}
					<hr class="w-4/5 self-center" />
					<div class="flex flex-row items-center justify-center">
						<span class="p-4 text-lg font-medium">Subtotal</span>
						<span class="grow" />
						<span data-testid="cart-subtotal" class="p-4 text-lg font-bold"
							>{getCurrency(cartHive?.sub_total)}
						</span>
					</div>
					<div class="flex flex-row items-center justify-center">
						<span class="text-secondary pb-4 text-sm font-normal"
							>Shipping and Tax will be calculated during checkout</span
						>
					</div>
				</div>
				{#if cartHive?.getAllCarts?.().length > 0}
					<a
						class:disabled={addingToCart || apiInProgress}
						class="checkout-button text-normal w-11/12 items-center justify-center rounded-3xl px-5 py-2 text-center font-semibold text-white uppercase hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
						target="_top"
						href="/mk/checkout">Checkout</a
					>
				{/if}
				<button
					on:click={() => window.firmly.sdk.CartUI.closeCart()}
					class="continue-button m-3 w-11/12 items-center justify-center rounded-3xl px-5 py-2 text-center text-black hover:bg-gray-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
					>Continue Shopping
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		font-family: Calibre, sans-serif;
		-webkit-font-smoothing: antialiased;
	}
	.drawer {
		position: fixed;
		top: 0px;
		right: 0px;
		height: 100%;
		position: fixed;
		box-shadow: -2px 0px 20px 20px rgba(0, 0, 0, 0.08);
		background-color: white;
		z-index: 200;
		border: 0px;
	}

	.continue-button {
		border: 2px solid #4c7cec;
		color: #4c7cec;
	}

	.checkout-button {
		border: 2px solid #4c7cec;
		background-color: #4c7cec;
	}

	.checkout-button:hover {
		background-color: #4c6aaf;
	}

	.disabled {
		pointer-events: none;
		background-color: #9ca3af;
		border: 2px solid #9ca3af;
	}
</style>
