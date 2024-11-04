<script>
	import { page } from '$app/stores';
	import { sCartHive } from '$lib/browser/storage.js';
	import CartDrawer from '$lib/components/mk/cart/cart-drawer.svelte';
	import { subscribe } from '$lib/sdk/index.js';
	import { onMount } from 'svelte';

	let isSessionTransferInProgress = false;
	let isShippingInfoInProgress = false;

	let drawerOpen = $page.url.searchParams.get('cartOpen') === 'true';

	onMount(() => {
		subscribe('sessionTransfer', 'start', () => {
			isSessionTransferInProgress = true;
		});

		subscribe('sessionTransfer', 'end', () => {
			isSessionTransferInProgress = false;
		});

		subscribe('setShippingInfo', 'start', () => {
			isShippingInfoInProgress = true;
		});

		subscribe('setShippingInfo', 'end', () => {
			isShippingInfoInProgress = false;
		});
	});
</script>

<CartDrawer
	cartHive={$sCartHive}
	{drawerOpen}
	addingToCart={isSessionTransferInProgress}
	apiInProgress={isShippingInfoInProgress}
/>
