<script>
	import MockArticlePage from './mock-article-page.svelte';
	import SidebarLayout from '$lib/components/buy-now/layout/sidebar.svelte';
	import PopupLayout from '$lib/components/buy-now/layout/popup.svelte';
	import BottomsheetLayout from '$lib/components/buy-now/layout/bottom-sheet.svelte';
	import FullscreenLayout from '$lib/components/buy-now/layout/fullscreen.svelte';

	const LAYOUT_MAP = {
		sidebar: SidebarLayout,
		popup: PopupLayout,
		bottomsheet: BottomsheetLayout,
		fullscreen: FullscreenLayout
	};

	let { buyNow, merchantName, pdpEnabled = true, resetKey = 0, children } = $props();

	let layoutOpen = $state(false);
	let prevResetKey = $state(0);

	let LayoutComponent = $derived(LAYOUT_MAP[buyNow.layoutType] || FullscreenLayout);

	$effect(() => {
		if (resetKey !== prevResetKey) {
			prevResetKey = resetKey;
			layoutOpen = false;
			buyNow.goToPdp();
			buyNow.isLayoutActive = true;
		}
	});

	function handleBuyNow() {
		layoutOpen = true;
		buyNow.isLayoutActive = true;
		if (pdpEnabled) {
			buyNow.goToPdp();
		} else {
			buyNow.goToCheckout();
		}
	}

	function handleLayoutClosed() {
		buyNow.close();
		setTimeout(() => {
			layoutOpen = false;
			buyNow.goToPdp();
			buyNow.isLayoutActive = true;
		}, buyNow.layoutTransitionTime);
	}
</script>

<div class="relative size-full overflow-hidden">
	<MockArticlePage {merchantName} {pdpEnabled} onBuyNow={handleBuyNow} />

	{#if layoutOpen}
		<LayoutComponent
			visible={buyNow.isLayoutActive}
			onClose={handleLayoutClosed}
			useAbsolutePosition={true}
		>
			{@render children?.()}
		</LayoutComponent>
	{/if}
</div>
