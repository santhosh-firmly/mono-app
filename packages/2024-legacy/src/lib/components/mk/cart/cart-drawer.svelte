<script>
	// @ts-nocheck
	import { onMount } from 'svelte';
	import ProgressIcon from '$lib/components/common/svg/api-progress-icon-2.svelte';
	import Cart from './cart.svelte';
	import { getCurrency } from '$lib/utils.js';
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
	<div class="container relative z-[302]">
		<button
			class="fixed top-0 left-0 backdrop-blur bg-black opacity-50 w-full h-full z-300"
			on:click={() => window.firmly.sdk.CartUI.closeCart()}
		/>
		<div
			class="drawer sm:w-[400px] w-full"
			transition:slideFunction
			on:outroend={animationEnd}
			on:introend={animationEnd}
		>
			<div class="flex flex-col h-full justify-center items-center">
				<div class="w-full flex p-4 items-center min-h-[64px]">
					<span class="text-lg">Cart</span>
					<div class="flex items-center flex-col grow">
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
				<div class="summary w-full flex flex-col">
					{#if cartHive?.getAllCarts?.().length > 0 && addingToCart}
						<hr class="w-4/5 self-center" />

						<div
							transition:slide
							class="relative flex flex-row w-full items-center justify-center gap-8 h-[48px]"
						>
							<LottiePlayer
								src="/add-to-cart.json"
								autoplay={true}
								loop={true}
								renderer="svg"
								background="transparent"
							/>
							<div class="relative text-center">
								<span class="empty-cart-text font-medium text-sm text-center text-[#4c7cec]">
									We are adding the product to your cart...
								</span>
							</div>
						</div>
					{/if}
					<hr class="w-4/5 self-center" />
					<div class="flex flex-row items-center justify-center">
						<span class="p-4 font-medium text-lg">Subtotal</span>
						<span class="grow" />
						<span class="p-4 font-bold text-lg">{getCurrency(cartHive?.sub_total)} </span>
					</div>
					<div class="flex flex-row items-center justify-center">
						<span class="pb-4 font-normal text-sm text-secondary"
							>Shipping and Tax will be calculated during checkout</span
						>
					</div>
				</div>
				{#if cartHive?.getAllCarts?.().length > 0}
					<a
						class:disabled={addingToCart || apiInProgress}
						class="checkout-button w-11/12 text-center focus:ring-4 focus:outline-none items-center justify-center px-5 py-2 text-white focus:ring-blue-300 rounded-3xl hover:bg-blue-800 uppercase font-semibold text-normal"
						target="_top"
						href="/mk/checkout">Checkout</a
					>
				{/if}
				<button
					on:click={() => window.firmly.sdk.CartUI.closeCart()}
					class="m-3 continue-button w-11/12 text-center focus:ring-4 focus:outline-none items-center justify-center px-5 py-2 text-black focus:ring-blue-300 rounded-3xl hover:bg-gray-200"
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
