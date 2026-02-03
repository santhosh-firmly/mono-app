<script>
	import { getBuyNow } from '$lib/states/buy-now.svelte.js';
	import PdpHeader from '$lib/components/buy-now/header.svelte';
	import ErrorView from '$lib/views/error.svelte';
	import Checkout from '$lib/views/checkout/index.svelte';

	let {
		checkout,
		c2p,
		paypal = null,
		merchant = null,
		notices = null,
		partnerPresentation = null,
		isFullscreen = false,
		onGoBack = () => {},
		onDismissNotice = () => {},
		useAbsoluteModalPosition = false,
		pdpContent
	} = $props();

	let buyNow = getBuyNow();

	let layoutColors = $derived({
		primary: merchant?.primaryColor || '#ffffff',
		action: merchant?.actionColor || '#333333'
	});
</script>

{#if buyNow.mode === 'error'}
	<ErrorView
		message={buyNow.errorMessage}
		errorCode={buyNow.errorCode}
		colors={layoutColors}
		onClose={() => buyNow.close()}
	/>
{:else if buyNow.mode === 'pdp'}
	<div class="flex h-full w-full flex-col">
		<PdpHeader {partnerPresentation} onBackClick={() => buyNow.close()} />
		<div class="flex-1 overflow-auto">
			{@render pdpContent?.()}
		</div>
	</div>
{:else if buyNow.mode === 'checkout'}
	<Checkout
		{checkout}
		{c2p}
		{paypal}
		{merchant}
		{notices}
		{onGoBack}
		onClose={() => buyNow.close()}
		{onDismissNotice}
		{isFullscreen}
		{useAbsoluteModalPosition}
	/>
{/if}
