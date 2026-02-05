<script>
	import { getBuyNow } from '$lib/states/buy-now.svelte.js';
	import PdpWrapper from '$lib/components/buy-now/pdp-wrapper.svelte';
	import ErrorView from '$lib/views/error.svelte';
	import Checkout from '$lib/views/checkout/index.svelte';

	let {
		checkout,
		c2p,
		paypal = null,
		merchant = null,
		notices = null,
		presentation = null,
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
	<PdpWrapper {presentation} onBackClick={() => buyNow.close()}>
		{@render pdpContent?.()}
	</PdpWrapper>
{:else if buyNow.mode === 'checkout'}
	<div class="flex min-h-0 flex-1 flex-col">
		<Checkout
			{checkout}
			{c2p}
			{paypal}
			{merchant}
			{partner}
			{notices}
			{onGoBack}
			onClose={() => buyNow.close()}
			{onDismissNotice}
			{isFullscreen}
			{useAbsoluteModalPosition}
		/>
	</div>
{/if}
