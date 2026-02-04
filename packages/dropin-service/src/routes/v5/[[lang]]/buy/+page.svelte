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

	import BuyNow from '$lib/views/buy-now/index.svelte';
	import PdpSkeleton from '$lib/components/buy-now/skeleton.svelte';

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

<BuyNow
	{checkout}
	{c2p}
	{paypal}
	{merchant}
	notices={notices.notices}
	partnerPresentation={data.partnerPresentation}
	onGoBack={() => pdp.goBack()}
	onDismissNotice={(id) => notices.dismiss(id)}
	isFullscreen={buyNow.layoutType === 'fullscreen'}
>
	{#snippet pdpContent()}
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
	{/snippet}
</BuyNow>
