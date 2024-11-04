<script>
	// @ts-nocheck

	import Header from '$lib/components/mk/header.svelte';
	import CartDrawer from '$lib/components/mk/cart/cart-drawer.svelte';
	import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';
</script>

<Header alwaysStickySearchBar={true} />
<CartDrawer />
<div class="flex flex-col h-full w-full items-center justify-center">
	<div class="w-full sm:w-1/2 lg:w-1/3 flex flex-col items-center mt-10">
		<LottiePlayer
			src="/construction.json"
			autoplay={true}
			loop={true}
			renderer="svg"
			background="transparent"
			controls={false}
		/>
	</div>
	<div class="relative my-8">
		<span class="empty-cart-text font-medium text-2xl text-center">
			Merchant under construction
		</span>
	</div>
	<span class="font-medium pb-8 w-1/2 text-center">
		Firmly engineers are working to integrate this merchant.
	</span>
	<span class="font-medium pb-8 w-1/2 text-center">
		In the mean time,
		<button
			class="text-blue-500 underline cursor-pointer"
			on:click={() => window.postMessage({ action: 'firmly::focusSearch' }, '*')}
		>
			search for a store or product
		</button>
		or
		<a href="/" class="text-blue-500 underline cursor-pointer">go back to the market place</a>.
	</span>
</div>
