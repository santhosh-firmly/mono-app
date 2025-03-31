<script>
	// @ts-nocheck
	import Radio from '$lib-v4/components/vendor/radio.svelte';

	import { wizardNext } from '$lib-v4/browser/wizard.js';
	import {
		cartCompleteOrder,
		cartShoppayWallet,
		sCart,
		sWallet,
		sWalletReview
	} from '$lib-v4/browser/api-manager.js';
	import { sNavNextHandler } from '$lib-v4/browser/storage.js';
	import { onDestroy, onMount } from 'svelte';
	import ViewBaseReview from './view-base-review.svelte';
	import CreditCardDisplayV1 from '$lib-v4/components/payment/credit-card-display-v1.svelte';
	import ShopPayIcon from '$lib-v4/components/common/svg/shop-pay-icon.svelte';

	async function onPlaceOrder() {
		const walletRes = await cartShoppayWallet($sWalletReview);
		if (walletRes && walletRes.token) {
			const placeRet = await cartCompleteOrder();
			if (placeRet) {
				wizardNext();
			}
		}
	}

	//ShopPay Payment
	let walletOptions = [];
	onMount(() => {
		sNavNextHandler.set(onPlaceOrder);

		let filterSPay = [];
		if ($sCart.payment_method_options && $sCart.payment_method_options.length > 0) {
			filterSPay = $sCart.payment_method_options.filter((e) => e.wallet == 'shoppay' && e.id);
		}

		if ($sWallet.payment_method_options && $sWallet.payment_method_options.length > 0) {
			// New user flow
			walletOptions = $sWallet.payment_method_options;
		} else {
			// Repeat user flow
			walletOptions = filterSPay;
		}

		if ($sWalletReview == null) {
			if ($sWallet.payment_method_options && $sWallet.payment_method_options.length > 0) {
				// New user Flow
				sWalletReview.set($sWallet.payment_method_options[0].id);
			} else if (filterSPay.length > 0) {
				// Repeat user flow
				sWalletReview.set(filterSPay[0].id);
			}
		}
	});

	onDestroy(() => {
		sNavNextHandler.set(null);
	});
</script>

<ViewBaseReview id="viewShoppayReview">
	<div slot="paymentSlot">
		<div class="flex flex-row gap-0">
			<ShopPayIcon width={125} class="rounded-sm fill-[#5a31f4] px-2" />
		</div>
		<ul class="divide-divide divide-y">
			{#each walletOptions as item}
				<li>
					<Radio class="py-2" bind:group={$sWalletReview} value={item.id}
						><CreditCardDisplayV1 wallet={item} />
					</Radio>
				</li>
			{/each}
		</ul>
	</div>
</ViewBaseReview>
