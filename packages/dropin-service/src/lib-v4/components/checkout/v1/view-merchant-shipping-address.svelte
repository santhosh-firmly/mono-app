<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	import ViewShippingAddress from './view-shipping-address.svelte';
	import { cViewLogin, sWizardLast, wizardNext } from '$lib-v4/browser/wizard.js';
	import { cartUpdateShippingInfo, sCart } from '$lib-v4/browser/api-manager.js';

	async function autoUpdate(shipping_info) {
		let res = await cartUpdateShippingInfo(shipping_info);
		if (res) {
			wizardNext();
		}
	}

	onMount(async () => {
		if ($sWizardLast === cViewLogin) {
			if ($sCart.shipping_info) {
				// Address is already set. so there is no need to set the address again.
				wizardNext();
			} else if ($sCart.shipping_info_options && $sCart.shipping_info_options.length > 0) {
				autoUpdate($sCart.shipping_info_options[0]);
			}
		}
	});
</script>

<ViewShippingAddress />
