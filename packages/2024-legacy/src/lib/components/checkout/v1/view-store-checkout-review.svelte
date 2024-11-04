<script>
	// @ts-nocheck
	import PaymentCreditCard from '$lib/components/payment/payment-credit-card.svelte';
	import { sNavNextHandler } from '$lib/browser/storage.js';
	import { onDestroy, onMount } from 'svelte';
	import ViewBaseReview from './view-base-review.svelte';
	import {
		cartSavedPaymentCompleteOrder,
		getFirstUnexpiredCard,
		getRandonPassword,
		sCart,
		sSavedPayment,
		sessionJoin
	} from '$lib/browser/api-manager.js';
	import CreditCardDisplayV1 from '$lib/components/payment/credit-card-display-v1.svelte';
	import Radio from '$lib/components/vendor/radio.svelte';
	import { NewCreditCard } from '$lib/browser/localization.js';
	import { wizardNext } from '$lib/browser/wizard.js';
	import { postSignIn } from '$lib/browser/cross.js';

	//Credit card
	let onCreditCardSubmitClick;

	let firstPaymentId = null;

	async function onSavedCardPlaceOrder() {
		const res = await cartSavedPaymentCompleteOrder($sSavedPayment);
		if (res) {
			wizardNext();
		}
	}

	async function onCreditCardPlaceOrder(event) {
		if ($sCart.session?.requires_login) {
			// Login, if the user is not logged in.
			if (!$sCart.session?.is_logged_in) {
				const pass = getRandonPassword();
				const cartInfo = await sessionJoin(pass);
				if (cartInfo) {
					if (cartInfo.session?.is_logged_in) {
						if (cartInfo.session.cookies && cartInfo.session.cookies.length > 0) {
							postSignIn(cartInfo.session.cookies);
						}
					}
				}
			}
		}
		onCreditCardSubmitClick(event);
	}

	function onNextHandler(event) {
		if ($sSavedPayment == NEW_CARD) {
			onCreditCardPlaceOrder(event);
		} else {
			onSavedCardPlaceOrder(event);
		}
	}

	onMount(() => {
		sNavNextHandler.set(onNextHandler);

		firstPaymentId = $sSavedPayment;

		if (!$sSavedPayment) {
			if ($sCart.payment_method_options?.filter((e) => e.wallet == 'merchant').length > 0) {
				firstPaymentId = getFirstUnexpiredCard($sCart);
				if (firstPaymentId) {
					sSavedPayment.set(firstPaymentId);
				}
			}
			if (!$sSavedPayment) {
				sSavedPayment.set(NEW_CARD);
			}
		}
	});

	onDestroy(() => {
		sNavNextHandler.set(null);
	});

	const NEW_CARD = 'NEW_CARD';
</script>

<ViewBaseReview id="viewStoreReview">
	<div slot="paymentSlot">
		{#if firstPaymentId != null}
			<ul class="divide-divide divide-y">
				{#each $sCart.payment_method_options
					?.filter((e) => e.wallet == 'merchant')
					.filter((e) => !e.expired) as item}
					<li>
						<Radio class="py-2" bind:group={$sSavedPayment} value={item.id}
							><CreditCardDisplayV1 wallet={item} showExpiration={true} />
						</Radio>
					</li>
				{/each}
				<li>
					<Radio class="py-2" bind:group={$sSavedPayment} value={NEW_CARD}>
						<div class="flex basis-1/3 justify-center">
							{NewCreditCard}
						</div>
					</Radio>
				</li>
			</ul>
		{/if}
		{#if $sSavedPayment == NEW_CARD || firstPaymentId == null}
			<PaymentCreditCard bind:onSubmitClick={onCreditCardSubmitClick} />
		{/if}
	</div>
</ViewBaseReview>
