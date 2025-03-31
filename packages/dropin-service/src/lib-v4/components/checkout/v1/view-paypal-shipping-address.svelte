<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	import ViewShippingAddress from './view-shipping-address.svelte';
	import { cViewPayment, sWizardLast, wizardNext } from '$lib-v4/browser/wizard.js';
	import { sCart } from '$lib-v4/browser/api-manager.js';
	import {
		InfoPaypalMissingEmail,
		InfoPaypalMissingPhone,
		InfoPaypalShippingHeader
	} from '$lib-v4/browser/localization.js';
	import Alert from '$lib-v4/components/common/alert.svelte';

	let isPhoneMissing = false;
	let isEmailMissing = false;
	let email, phone, updateInitialValues;

	onMount(() => {
		if ($sWizardLast == cViewPayment) {
			//Coming from Payment view screen, check for the Shipping_info
			if ($sCart.shipping_info) {
				// shipping info is populated.
				wizardNext();
			} else {
				if ($sCart.shipping_info_options && $sCart.shipping_info_options.length > 0) {
					const first = $sCart.shipping_info_options[0];
					isPhoneMissing = first && first.phone ? false : true;
					isEmailMissing = first && first.email ? false : true;
					if (updateInitialValues && first) {
						updateInitialValues(first);
					}
					if (isPhoneMissing && phone && phone.focus) {
						phone.focus();
					}
					if (isEmailMissing && email && email.focus) {
						email.focus();
					}
				}
			}
		}
	});
</script>

{#if isPhoneMissing}
	<Alert header={InfoPaypalShippingHeader} detail={InfoPaypalMissingPhone} />
{/if}
{#if isEmailMissing}
	<Alert header={InfoPaypalShippingHeader} detail={InfoPaypalMissingEmail} />
{/if}

<ViewShippingAddress bind:email bind:phone bind:updateInitialValues id="viewPaypalShipping" />
