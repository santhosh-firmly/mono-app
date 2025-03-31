<script>
	// @ts-nocheck
	import PaymentCreditCard from '$lib-v4/components/payment/payment-credit-card.svelte';
	import { sNavNextHandler } from '$lib-v4/browser/storage.js';
	import { onDestroy, onMount } from 'svelte';
	import ViewBaseReview from './view-base-review.svelte';

	let onCreditCardSubmitClick;
	onMount(() => {
		sNavNextHandler.set(onCreditCardSubmitClick);
	});

	onDestroy(() => {
		sNavNextHandler.set(null);
	});
</script>

<ViewBaseReview id="viewCCReview">
	<PaymentCreditCard bind:onSubmitClick={onCreditCardSubmitClick} slot="paymentSlot" />
</ViewBaseReview>
