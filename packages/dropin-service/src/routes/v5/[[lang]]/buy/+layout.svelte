<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { setContext } from 'svelte';

	import { initializeBuyNow } from '$lib/states/buy-now.svelte.js';

	import FullscreenLayout from '$lib/components/buy-now/layout/fullscreen.svelte';
	import SidebarLayout, {
		TRANSITION_DURATION as SIDEBAR_TRANSITION_DURATION
	} from '$lib/components/buy-now/layout/sidebar.svelte';
	import PopupLayout from '$lib/components/buy-now/layout/popup.svelte';
	import BottomsheetLayout from '$lib/components/buy-now/layout/bottom-sheet.svelte';

	const LAYOUT_MAP = {
		sidebar: { component: SidebarLayout, transitionTime: SIDEBAR_TRANSITION_DURATION },
		popup: { component: PopupLayout, transitionTime: 0 },
		bottomsheet: { component: BottomsheetLayout, transitionTime: 0 },
		fullscreen: { component: FullscreenLayout, transitionTime: 0 }
	};

	let { children } = $props();

	let initialUiMode = $page.url.searchParams.get('ui_mode') || 'fullscreen';
	let initialUrl = $page.url.searchParams.get('url');
	let initialForcePdp = $page.url.searchParams.get('force_pdp') === 'true';
	let shouldStartAsPdp = initialUrl && initialForcePdp;

	let buyNow = initializeBuyNow(shouldStartAsPdp ? 'pdp' : 'checkout');
	buyNow.setupLayout(initialUiMode);

	setContext('buyNow', buyNow);

	let LayoutComponent = $derived(LAYOUT_MAP[buyNow.layoutType]?.component || FullscreenLayout);
	let isFullscreen = $derived(buyNow.layoutType === 'fullscreen');
	let shouldRender = $derived(isFullscreen || browser);
</script>

<svelte:head>
	<title>Firmly - Buy Now</title>
	<meta
		name="description"
		content="Complete your purchase securely with Firmly's trusted checkout platform."
	/>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{#if shouldRender}
	<div class="h-full w-full">
		<LayoutComponent visible={buyNow.isLayoutActive} onClose={() => buyNow.close()}>
			{@render children()}
		</LayoutComponent>
	</div>
{/if}
