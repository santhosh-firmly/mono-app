<script>
	import { version } from '$app/environment';
	import { page } from '$app/stores';
	import { getContext, onMount, untrack } from 'svelte';

	import { initializeCheckout } from '$lib/states/checkout/index.svelte.js';
	import { initializeClickToPay } from '$lib/states/click-to-pay.svelte.js';
	import { initializePayPal } from '$lib/states/paypal.svelte.js';
	import { initializePdp } from '$lib/states/pdp.svelte.js';
	import { initializeMerchant } from '$lib/states/merchant.svelte.js';
	import { getNotices } from '$lib/states/notices.svelte.js';

	import Checkout from '$lib/views/checkout/index.svelte';
	import ErrorView from '$lib/views/error.svelte';
	import PdpSkeleton from '$lib/components/buy-now/skeleton.svelte';
	import PdpHeader from '$lib/components/buy-now/header.svelte';

	let { data } = $props();

	let buyNow = getContext('buyNow');

	let checkout = initializeCheckout({
		domain: untrack(() => data.merchantDomain),
		store: { logoUrl: null },
		pending: { cart: true }
	});

	let c2p = initializeClickToPay();
	let paypal = initializePayPal();
	let pdp = initializePdp();
	let merchant = initializeMerchant(untrack(() => data.merchantPresentation));
	let notices = getNotices();

	let layoutColors = $derived({
		primary: merchant?.primaryColor || '#ffffff',
		action: merchant?.actionColor || '#333333'
	});

	onMount(() => {
		pdp.initialize(data, version, $page.url.searchParams);
	});

	$effect(() => {
		const paypalConfig = checkout.cart?.shop_properties?.paypal;
		const paypalEnabled = checkout.features.paypal;
		if (paypalEnabled && paypalConfig?.clientId && !paypal.initialized) {
			paypal.initialize({
				clientId: paypalConfig.clientId,
				merchantId: paypalConfig.merchantId,
				currency: checkout.cart?.currency || 'USD'
			});
		}
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
	<div class="flex h-full flex-col">
		<PdpHeader
			partnerPresentation={data.partnerPresentation}
			onBackClick={() => buyNow.close()}
		/>
		{#if !pdp.showIframe || pdp.iframeVisibility === 'hidden'}
			<PdpSkeleton />
		{/if}
		{#if pdp.showIframe}
			<iframe
				src={pdp.iframeUrl}
				title="Product Page"
				class={[
					'h-full w-full border-none',
					{ invisible: pdp.iframeVisibility === 'hidden' }
				]}
			></iframe>
		{/if}
	</div>
{:else if buyNow.mode === 'checkout'}
	<Checkout
		{checkout}
		{c2p}
		{paypal}
		{merchant}
		notices={notices.notices}
		onGoBack={() => pdp.goBack()}
		onClose={() => buyNow.close()}
		onDismissNotice={(id) => notices.dismiss(id)}
		isFullscreen={buyNow.layoutType === 'fullscreen'}
	/>
{/if}
