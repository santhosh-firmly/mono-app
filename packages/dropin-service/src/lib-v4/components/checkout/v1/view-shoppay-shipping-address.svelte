<script>
	// @ts-nocheck

	import {
		InfoShopPayShippingDetail,
		InfoShopPayShippingHeader
	} from '$lib-v4/browser/localization.js';
	import Alert from '$lib-v4/components/common/alert.svelte';
	import { onMount } from 'svelte';

	import ViewShippingAddress from './view-shipping-address.svelte';
	import { cViewShoppay, sWizardLast, wizardNext } from '$lib-v4/browser/wizard.js';
	import { cartUpdateShippingInfo, sCart, sWallet } from '$lib-v4/browser/api-manager.js';

	async function autoUpdate(shipping_info) {
		let res = await cartUpdateShippingInfo(shipping_info);
		if (res) {
			wizardNext();
		}
	}

	let isFromOTPScreen = false;
	onMount(async () => {
		if ($sWizardLast == cViewShoppay) {
			isFromOTPScreen = true;

			if ($sCart.shipping_info) {
				// Address is already set. so there is no need to set the address again.
				wizardNext();
			} else if ($sWallet.shipping_info_options && $sWallet.shipping_info_options.length > 0) {
				// as the first time user.
				autoUpdate($sWallet.shipping_info_options[0]);
			} else if ($sCart.shipping_info_options && $sCart.shipping_info_options.length > 0) {
				// as the repeat user.
				autoUpdate($sCart.shipping_info_options[0]);
			}
		}
	});
</script>

{#if isFromOTPScreen}
	<Alert header={InfoShopPayShippingHeader} detail={InfoShopPayShippingDetail} />
{/if}
<ViewShippingAddress id="viewShoppayShipping" />
