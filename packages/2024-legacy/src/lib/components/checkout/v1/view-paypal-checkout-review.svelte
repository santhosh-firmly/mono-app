<script>
	// @ts-nocheck

	import { wizardNext } from '$lib/browser/wizard.js';
	import { paypalCompleteOrder } from '$lib/browser/api-manager.js';
	import { sNavNextHandler } from '$lib/browser/storage.js';
	import { onDestroy, onMount } from 'svelte';
	import ViewBaseReview from './view-base-review.svelte';
	import PaypalIcon from '$lib/components/common/svg/paypal-icon.svelte';

	async function onPlaceOrder() {
		const ret = await paypalCompleteOrder();
		if (ret) {
			wizardNext();
		}
	}

	//Paypal Payment

	onMount(() => {
		// Handle other payments.
		sNavNextHandler.set(onPlaceOrder);
	});

	onDestroy(() => {
		sNavNextHandler.set(null);
	});
</script>

<ViewBaseReview id="viewPaypalReview">
	<div class="px-2" slot="paymentSlot">
		<PaypalIcon></PaypalIcon>
	</div>
</ViewBaseReview>
