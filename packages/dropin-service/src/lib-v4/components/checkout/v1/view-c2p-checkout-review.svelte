<script>
	// @ts-nocheck
	import Radio from '$lib-v4/components/vendor/radio.svelte';
	import { InfoC2PNoCards, ReviewCVV, ReviewCVVToolTip } from '$lib-v4/browser/localization.js';

	import { wizardNext } from '$lib-v4/browser/wizard.js';
	import {
		cartC2PWallet,
		sCartPayment,
		sWallet,
		sWalletReview,
		cartCompleteOrder,
		getFirstUnexpiredCard,
		sWalletRememberMe
	} from '$lib-v4/browser/api-manager.js';
	import {
		cC2PaymentVerificationMethods,
		sC2PaymentFlow,
		sNavNextHandler
	} from '$lib-v4/browser/storage.js';
	import { onDestroy, onMount } from 'svelte';
	import SectionHeader from '$lib-v4/components/common/section-header.svelte';
	import PaymentCvv from '$lib-v4/components/payment/payment-cvv.svelte';
	import ViewBaseReview from './view-base-review.svelte';
	import CreditCardDisplayV1 from '$lib-v4/components/payment/credit-card-display-v1.svelte';
	import PaymentCreditCard from '$lib-v4/components/payment/payment-credit-card.svelte';
	import C2pLogo from '$lib-v4/components/common/c2p-logo.svelte';

	async function onC2PPlaceOrder() {
		const walletRes = await cartC2PWallet($sWalletReview, $sWalletRememberMe);
		if (walletRes?.token) {
			if (!walletRes.cvv_required) {
				const placeRet = await cartCompleteOrder();
				if (placeRet) {
					wizardNext();
				}
			}
		} else if (walletRes?.digitalCardData?.status === 'PENDING') {
			sWallet.update((w) => ({ ...w, ...walletRes }));

			sC2PaymentFlow.set(cC2PaymentVerificationMethods);
			wizardNext();
		}
	}

	async function onCVVPlaceOrder(values) {
		const walletRes = await cartC2PWallet($sWalletReview, $sWalletRememberMe, values.cvc);
		if (walletRes) {
			if (!walletRes.cvv_required == true && walletRes.token) {
				const placeRet = await cartCompleteOrder();
				if (placeRet) {
					wizardNext();
				}
			}
		}
	}

	//Credit card
	let onCreditCardSubmitClick;

	//C2P Payment
	let onCVVNextClick;
	let firstPaymentId = null;

	onMount(() => {
		firstPaymentId = $sWalletReview;
		if ($sWallet.payment_method_options.length > 0 && $sWalletReview == null) {
			firstPaymentId = getFirstUnexpiredCard($sWallet, null);
			if (firstPaymentId) {
				sWalletReview.set(firstPaymentId);
			}
		}
		if (firstPaymentId) {
			// Handle other payments.
			sNavNextHandler.set(onC2PPlaceOrder);
		} else {
			sNavNextHandler.set(onCreditCardSubmitClick);
		}
	});

	onDestroy(() => {
		sNavNextHandler.set(null);
	});

	// Set the next handler to CVV Submit click.
	$: {
		if ($sCartPayment.cvv_required) {
			sNavNextHandler.set(onCVVNextClick);
		}
	}
</script>

<ViewBaseReview id="viewC2PReview">
	<div slot="paymentSlot">
		<C2pLogo />
		<ul class="divide-divide divide-y">
			{#each $sWallet.payment_method_options.filter((e) => e.expired == true) as item}
				<li>
					<CreditCardDisplayV1 wallet={item} isExpired={true} showExpiration={false} />
				</li>
			{/each}
			{#each $sWallet.payment_method_options.filter((e) => !e.expired) as item}
				<li>
					<Radio class="py-2" bind:group={$sWalletReview} value={item.id}
						><CreditCardDisplayV1 wallet={item} showExpiration={false} />
					</Radio>
				</li>
			{/each}
		</ul>
		{#if firstPaymentId == null}
			<div class="items-center justify-start py-2 text-xs font-semibold">{InfoC2PNoCards}</div>
			<PaymentCreditCard bind:onSubmitClick={onCreditCardSubmitClick} />
		{/if}
	</div>
	<svelte:fragment slot="cvvSlot">
		{#if $sCartPayment.cvv_required}
			<SectionHeader header={ReviewCVV} detail={ReviewCVVToolTip} />
			<PaymentCvv bind:onSubmitClick={onCVVNextClick} {onCVVPlaceOrder} />
		{/if}
	</svelte:fragment>
</ViewBaseReview>
