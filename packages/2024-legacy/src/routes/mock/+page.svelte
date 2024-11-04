<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import { initializeDomain } from '$lib/browser/api-firmly.js';
	import { mockSetup, sCart, sPaymentInfo, sShippingInfo } from '$lib/browser/api-manager.js';
	import { PaymentInfoSchema, ShippingInfoSchema } from '$lib/browser/schema.js';
	import { sModalContent, sModalOptions } from '$lib/browser/storage.js';
	import CheckoutV1 from '$lib/components/checkout/v1/checkout-v1.svelte';
	import { modalBind } from '$lib/components/modal.svelte';
	import { onMount } from 'svelte';
	import {
		mockData,
		mockC2PData,
		mockC2PIssuerData,
		youngRebelzStoreInfo,
		adoremeStoreInfo,
		multiLineItemOrder,
		singleLineItemOrder,
		multiLineLoggedIn
	} from './mock-data';

	const isMulti = $page.url.searchParams.get('multi');
	const mockC2PIssuer = $page.url.searchParams.get('issuer-stepup');
	const isLogin = $page.url.searchParams.get('login');

	let storeInfo = youngRebelzStoreInfo;

	onMount(() => {
		initializeDomain('youngrebelz.com');

		if (isLogin) {
			sCart.set(multiLineLoggedIn);
			storeInfo = adoremeStoreInfo;
			initializeDomain('adoreme.com');
		} else if (isMulti) {
			sCart.set(multiLineItemOrder);
		} else {
			sCart.set(singleLineItemOrder);
		}

		sPaymentInfo.set(
			PaymentInfoSchema.cast({
				cardNumber: '5105105105105100',
				expiryDate: '12/30',
				cvc: '123',
				cardName: 'Testing'
			})
		);
		sShippingInfo.set(ShippingInfoSchema.cast(singleLineItemOrder.shipping_info));

		mockSetup(mockData, mockC2PIssuer ? mockC2PIssuerData : mockC2PData);
		sModalOptions.set({
			closeButton: false,
			closeOnEsc: false,
			closeOnOuterClick: false
		});
		sModalContent.set(
			modalBind(CheckoutV1, {
				options: { isMock: true, isMulti: isMulti },
				storeInfo: storeInfo
			})
		);
	});
</script>

<div
	id="container"
	class="absolute overflow-hidden left-0 right-0 top-0 bottom-0 bg-blue-500 w-screen h-screen"
/>
