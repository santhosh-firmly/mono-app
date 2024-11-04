<script>
	// @ts-nocheck
	import { sModalContent, sModalOptions } from '$lib/browser/storage.js';
	import CheckoutV1 from '$lib/components/checkout/v1/checkout-v1.svelte';
	import { modalBind } from '$lib/components/modal.svelte';
	import { cartSessionTransfer, sCartStoreInfo } from '$lib/browser/api-manager.js';
	import { bindEvent } from '$lib/browser/dash.js';

	async function onAddToCart(data) {
		sModalOptions.set({
			closeButton: false,
			closeOnEsc: false,
			closeOnOuterClick: false
		});
		if (data.transfer && data.storeInfo) {
			if (data.transfer) {
				sCartStoreInfo.set(data.storeInfo);
				cartSessionTransfer(data.transfer);
			}

			sModalContent.set(
				modalBind(CheckoutV1, { options: { transfer: data.transfer }, storeInfo: data.storeInfo })
			);
		} else {
			sModalContent.set(
				modalBind(CheckoutV1, {
					options: { isMock: true, isMulti: true },
					storeInfo: { url_name: 'Mock' }
				})
			);
		}
	}

	if (typeof window !== 'undefined') {
		bindEvent(window, 'message', (e) => {
			try {
				let data = JSON.parse(e.data);
				if (data.action == 'addToCart') {
					onAddToCart(data);
				}
			} catch (ex) {
				console.log('message exception:', ex);
			}
		});
	}
</script>
