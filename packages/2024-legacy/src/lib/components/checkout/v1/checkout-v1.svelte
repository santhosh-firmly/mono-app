<script>
	// @ts-nocheck
	import CheckoutFooter from '../checkout-footer.svelte';
	import CheckoutHeader from '../checkout-header.svelte';
	import {
		cViewContactShippingAddress,
		cViewOrderPlaced,
		cViewPayment,
		cViewReview,
		cViewShippingAddress,
		sWizardIndex,
		cViewShoppay,
		sWizardShipping,
		cViewC2PStepUP
	} from '$lib/browser/wizard.js';
	import ViewPaymentOptions from './view-payment-options.svelte';
	import ViewShippingAddress from './view-shipping-address.svelte';
	import ViewOrderPlaced from './view-order-placed.svelte';
	import { onMount } from 'svelte';
	import ViewProgress from './view-progress.svelte';
	import {
		sIsNavBottomVisible,
		cPaymentC2P,
		sPaymentFlow,
		cPaymentCreditCard,
		cPaymentShoppay,
		cPaymentPaypal,
		cPaymentLoginCreditCard,
		sStoreInfo,
		cPaymentLogin
	} from '$lib/browser/storage.js';
	import NavBottom from '$lib/components/common/nav-bottom.svelte';
	import NoticesField from '$lib/components/common/notices-field.svelte';
	import ApiAlert from '$lib/components/common/api-alert.svelte';
	import { sApiProgressInfo } from '$lib/browser/api-manager.js';
	import CartSummary from '../cart-summary.svelte';
	import ViewShoppayLogin from './view-shoppay-login.svelte';
	import ViewShoppayShippingAddress from './view-shoppay-shipping-address.svelte';
	import ViewCcCheckoutReview from './view-cc-checkout-review.svelte';
	import ViewC2pCheckoutReview from './view-c2p-checkout-review.svelte';
	import ViewShoppayCheckoutReview from './view-shoppay-checkout-review.svelte';
	import ViewPaypalCheckoutReview from './view-paypal-checkout-review.svelte';
	import ViewPaypalShippingAddress from './view-paypal-shipping-address.svelte';
	import ViewC2pContactShippingAddress from './view-c2p-contact-shipping-address.svelte';
	import ViewContactShippingAddress from './view-contact-shipping-address.svelte';
	import ViewStoreCheckoutReview from './view-store-checkout-review.svelte';
	import ViewMerchantLogin from './view-merchant-login.svelte';
	import ViewMerchantShippingAddress from './view-merchant-shipping-address.svelte';
	import ViewC2PVerificationMethods from './view-c2p-verification-methods.svelte';

	/**
	 * @type {any}
	 */
	export let options;

	/**
	 * @type {any}
	 */
	export let storeInfo;

	const creditCardViews = [
		{ component: ViewPaymentOptions, view: cViewPayment },
		{ component: ViewShippingAddress, view: cViewShippingAddress },
		{ component: ViewCcCheckoutReview, view: cViewReview },
		{ component: ViewOrderPlaced, view: cViewOrderPlaced }
	];

	const c2pViews = [
		{ component: ViewPaymentOptions, view: cViewPayment },
		{ component: ViewC2pContactShippingAddress, view: cViewContactShippingAddress },
		{ component: ViewC2pCheckoutReview, view: cViewReview },
		{ component: ViewC2PVerificationMethods, view: cViewC2PStepUP },
		{ component: ViewOrderPlaced, view: cViewOrderPlaced }
	];

	const shopPayViews = [
		{ component: ViewPaymentOptions, view: cViewPayment },
		{ component: ViewShoppayLogin, view: cViewShoppay },
		{ component: ViewShoppayShippingAddress, view: cViewShippingAddress },
		{ component: ViewShoppayCheckoutReview, view: cViewReview },
		{ component: ViewOrderPlaced, view: cViewOrderPlaced }
	];

	const paypalViews = [
		{ component: ViewPaymentOptions, view: cViewPayment },
		{ component: ViewPaypalShippingAddress, view: cViewShippingAddress },
		{ component: ViewPaypalCheckoutReview, view: cViewReview },
		{ component: ViewOrderPlaced, view: cViewOrderPlaced }
	];

	const loginCardViews = [
		{ component: ViewPaymentOptions, view: cViewPayment },
		{ component: ViewContactShippingAddress, view: cViewShippingAddress },
		{ component: ViewStoreCheckoutReview, view: cViewReview },
		{ component: ViewOrderPlaced, view: cViewOrderPlaced }
	];

	const loginViews = [
		{ component: ViewPaymentOptions },
		{ component: ViewMerchantLogin },
		{ component: ViewMerchantShippingAddress },
		{ component: ViewStoreCheckoutReview },
		{ component: ViewOrderPlaced }
	];

	let selected,
		isOrderPlaced = false,
		isPaymentOptions = true;

	function changeSelected(paymentFlow, wizardIndex) {
		switch (paymentFlow) {
			case cPaymentC2P:
				selected = c2pViews[wizardIndex];
				break;
			case cPaymentShoppay:
				selected = shopPayViews[wizardIndex];
				break;
			case cPaymentPaypal:
				selected = paypalViews[wizardIndex];
				break;
			case cPaymentLoginCreditCard:
				selected = loginCardViews[wizardIndex];
				break;
			case cPaymentLogin:
				selected = loginViews[wizardIndex];
				break;
			case cPaymentCreditCard:
			default:
				selected = creditCardViews[wizardIndex];
				break;
		}
	}

	$: {
		if ($sWizardShipping) {
			selected = { component: ViewShippingAddress, view: cViewShippingAddress };
		} else {
			changeSelected($sPaymentFlow, $sWizardIndex);
		}

		isOrderPlaced = selected.component == ViewOrderPlaced;
		isPaymentOptions = selected.component == ViewPaymentOptions;
		sIsNavBottomVisible.set(
			selected.component !== ViewPaymentOptions && selected.component !== ViewOrderPlaced
		);
	}

	onMount(async () => {
		sStoreInfo.set(storeInfo);
		if (options.isMock) {
			sWizardIndex.set(0);
		}
	});
</script>

<div class="flex flex-col h-full max-w-lg ml-auto mr-auto" fobs id="viewCheckout">
	<CheckoutHeader title={storeInfo.url_name} logo={storeInfo.logo} />
	<ApiAlert />
	<div class="grow">
		{#if $sApiProgressInfo != null && $sApiProgressInfo.header}
			<ViewProgress />
		{:else if selected}
			<NoticesField />
			{#if !isOrderPlaced && !isPaymentOptions}
				<CartSummary />
			{/if}
			<svelte:component this={selected.component} />
			<NavBottom />
		{/if}
	</div>
	<CheckoutFooter />
</div>
