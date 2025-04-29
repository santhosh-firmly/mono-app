// @ts-nocheck
import {
	ProgressC2PTokenize,
	ProgressCartUpdate,
	ProgressDelivery,
	ProgressEmpty,
	ProgressOrderPlacement,
	ProgressPaymentToken,
	ProgressPaypalComplete,
	ProgressShippingInfo,
	ProgressShoppayTokenize,
	ProgressTransferCart,
	ProgressUnlockComplete,
	ProgressC2PUnlockStart,
	ProgressShoppayUnlockStart,
	ProgressSessionJoin,
	ProgressSessionCreateOtp
} from './localization.js';
import { writable } from 'svelte/store';
import { initializeDomain } from './api-firmly.js';
import { PaymentInfoSchema, ShippingInfoSchema } from './schema.js';
import {
	getVisaCardToken,
	unlockComplete,
	unlockStart,
	visaAuthenticate
} from '$lib-v4/clients/visa.svelte';
import { PUBLIC_use_c2p_api } from '$lib-v4/env.js';
import { cLoginOtpValidation, sLoginOtpFlow } from './storage.js';
import { postUpdateCart } from './cross.js';

const DEFAULT_PHONE = '0000000000';
//#region Storage

const sApiError = writable({});
const sApiProgressInfo = writable({});
const sApiDynamoProgress = writable(false);

export const sIsApiMock = writable(false);

const sPaymentInfo = writable(PaymentInfoSchema.cast());
const sShippingInfo = writable(ShippingInfoSchema.cast());

// Cart

const sCart = writable({});
let cartData = null;
sCart.subscribe((value) => {
	cartData = value;
	cartLocalStorageRefresh();
});

const sCartPayment = writable({});
let cartPaymentData = null;
sCartPayment.subscribe((value) => {
	cartPaymentData = value;
});

export const sCartStoreInfo = writable({});
let storeId = '';
sCartStoreInfo.subscribe((value) => {
	storeId = value.store_id;
	initializeDomain(storeId);
});

// Wallet
const sWallet = writable({});

const sWalletInfo = writable(null);

const sWalletReview = writable(null);

const sWalletRememberMe = writable(true);

const sC2PAuthenticate = writable({});

const sSavedPayment = writable(null);

const sMaskedOtpDestinations = writable({});
//#endregion

// Sign in
const sSignedInOnThisSession = writable(false);

function getFirstUnexpiredCard(cart, wallet = 'merchant') {
	const options = wallet
		? cart.payment_method_options.filter((e) => e.wallet == wallet && e.id)
		: cart.payment_method_options;
	for (const element of options) {
		if (!element.expired) {
			return element.id;
		}
	}

	return null;
}

export function getRandonPassword() {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$&ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	const passwordLength = 12;
	let password = [];
	for (let i = 0; i <= passwordLength; i++) {
		let randomNumber = Math.floor(Math.random() * chars.length);
		password.push(chars.substring(randomNumber, randomNumber + 1));
	}
	return password.join('');
}

//#region  Common functions

function cartLocalStorageRefresh() {
	if (cartData && cartData.shipping_info) {
		sShippingInfo.set(cartData.shipping_info);
	}
}

function resetApiError() {
	sApiError.set(null);
}

function delay(time = 1000) {
	return new Promise((res) => setTimeout(res, time));
}

async function mockDelay(progress) {
	sApiProgressInfo.set(progress);
	await delay();
	sApiProgressInfo.set(ProgressEmpty);
}
//#endregion

//#region  Mock information
let mockData;
let mockC2PData;
let c2pAuthenticated = false;

let isMock = false;
function mockSetup(data, c2pData) {
	isMock = true;
	sIsApiMock.set(true);
	mockData = data;
	mockC2PData = c2pData;
}
//#endregion

//#region Payment

async function cartUpdatePayment(paymentInfo) {
	if (isMock) {
		await mockDelay(ProgressPaymentToken);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressPaymentToken);

	const ccInfo = getCCInfo(paymentInfo);

	const res = await window.firmly.paymentCreditCardTokenize(ccInfo, cartData.payment_handle);
	if (res.status == 200) {
		sCartPayment.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

function getCCInfo(paymentInfo) {
	const eDate = paymentInfo.expiryDate.split('/');
	const year = '20' + eDate[1].trim();
	const month = eDate[0].trim();

	const ccInfo = {
		credit_card: {
			name: paymentInfo.cardName.trim(),
			number: paymentInfo.cardNumber.replaceAll(' ', ''),
			month: month,
			year: year,
			verification_value: paymentInfo.cvc
		},
		billing_info: {
			first_name: cartData.shipping_info.first_name,
			last_name: cartData.shipping_info.last_name,
			email: cartData.shipping_info.email,
			phone: cartData.shipping_info.phone || DEFAULT_PHONE,
			address1: paymentInfo.address1,
			address2: paymentInfo.address2 || ' ',
			city: paymentInfo.city,
			state_or_province: paymentInfo.state_or_province,
			country: paymentInfo.country,
			postal_code: paymentInfo.postal_code
		}
	};
	return ccInfo;
}

async function getCCInfoV2(paymentInfo) {
	const eDate = paymentInfo.expiryDate.split('/');
	const year = '20' + eDate[1].trim();
	const month = eDate[0].trim();

	const ccInfo = {
		credit_card: {
			name: await window.firmly.paymentRsaEncrypt(paymentInfo.cardName.trim()),
			number: await window.firmly.paymentRsaEncrypt(
				paymentInfo.cardNumber.replaceAll(' ', '')
			),
			month: await window.firmly.paymentRsaEncrypt(month),
			year: await window.firmly.paymentRsaEncrypt(year),
			verification_value: await window.firmly.paymentRsaEncrypt(paymentInfo.cvc)
		},
		billing_info: {
			first_name: cartData.shipping_info.first_name,
			last_name: cartData.shipping_info.last_name,
			email: cartData.shipping_info.email,
			phone: cartData.shipping_info.phone || DEFAULT_PHONE,
			address1: paymentInfo.address1,
			address2: paymentInfo.address2 || ' ',
			city: paymentInfo.city,
			state_or_province: paymentInfo.state_or_province,
			country: paymentInfo.country,
			postal_code: paymentInfo.postal_code
		}
	};
	return ccInfo;
}

async function paymentCompleteOrder(paymentInfo) {
	if (isMock) {
		await mockDelay(ProgressOrderPlacement);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressOrderPlacement);

	const ccInfo = getCCInfo(paymentInfo);

	const res = await window.firmly.paymentCompleteOrder(ccInfo, cartData.payment_handle);
	if (res.status == 200) {
		// Difference between tokenize and complete-order is we get back the cart in case of completeOrder.
		sCart.set(res.data);
		if (res.data.notice) {
			sApiError.set(res.data);
		}
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function paymentCompleteOrderV2(paymentInfo) {
	if (isMock) {
		await mockDelay(ProgressOrderPlacement);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressOrderPlacement);

	const ccInfo = getCCInfoV2(paymentInfo);

	const res = await window.firmly.paymentCompleteOrderV2(ccInfo, cartData.payment_handle);
	if (res.status == 200) {
		// Difference between tokenize and complete-order is we get back the cart in case of completeOrder.
		sCart.set(res.data);
		if (res.data.notice) {
			sApiError.set(res.data);
		}
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}
//#endregion

//#region Wallet

// Click to Pay
async function c2pWalletUnlockStart(emailAddress) {
	const progress = ProgressC2PUnlockStart;
	if (isMock) {
		await mockDelay(progress);
		sWallet.set(mockData.mockUnlockStart);
		return mockData.mockUnlockStart;
	}

	resetApiError();
	sApiProgressInfo.set(progress);

	const res =
		PUBLIC_use_c2p_api !== 'false'
			? await window.firmly.c2pWalletUnlockStart(emailAddress)
			: await unlockStart(emailAddress);
	if (res.status == 200) {
		sWallet.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function c2pWalletUnlockComplete(otp) {
	if (isMock) {
		await mockDelay(ProgressUnlockComplete);
		sWallet.set(mockData.mockUnlockComplete);
		return mockData.mockUnlockComplete;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressUnlockComplete);

	const res =
		PUBLIC_use_c2p_api !== 'false'
			? await window.firmly.c2pWalletUnlockComplete(otp)
			: await unlockComplete(otp);
	if (res.status == 200) {
		sWallet.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartC2PWallet(cardId, rememberMe = false, cvv = null, additionalData = {}) {
	if (isMock) {
		await mockDelay(ProgressC2PTokenize);
		if (cvv) {
			return mockData.mockC2PCVV;
		} else if (mockC2PData) {
			if (!c2pAuthenticated) {
				return mockC2PData.checkoutResponse;
			} else {
				return mockData.mockC2PCVV;
			}
		} else {
			sCartPayment.set(mockData.mockC2PNoCVV);
			return mockData.mockC2PNoCVV;
		}
	}

	resetApiError();
	sApiProgressInfo.set(ProgressC2PTokenize);
	const res =
		PUBLIC_use_c2p_api !== 'false'
			? await window.firmly.paymentC2PTokenize(cardId, cvv)
			: await getVisaCardToken(cardId, cvv, rememberMe, additionalData);
	if (!res) {
		// Consumer closed Visa popup without completing the flow.
		sApiProgressInfo.set(ProgressEmpty);
		return;
	}
	if (res.status == 200) {
		sCartPayment.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function c2pVisaAuthenticate(authenticationMethod) {
	if (isMock) {
		await mockDelay(ProgressSessionCreateOtp);

		if (authenticationMethod.methodAttributes.otpValue) {
			c2pAuthenticated = true;
			return mockC2PData.authenticateWithOtpResponse;
		}

		return mockC2PData.authenticateResponse;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressSessionCreateOtp);

	const res = await visaAuthenticate(authenticationMethod);
	if (!res) {
		// Consumer closed Visa popup without completing the flow.
		sApiProgressInfo.set(ProgressEmpty);
		return;
	} else if (res.status == 200) {
		sC2PAuthenticate.set(res.data);
	} else {
		sApiError.set(res.data);
	}
	sApiProgressInfo.set(ProgressEmpty);

	return res.status == 200 ? res.data : null;
}

//#endregion

// Shop Pay
async function shopPayWalletUnlockStart(emailAddress, captcha) {
	const progress = ProgressShoppayUnlockStart;
	if (isMock) {
		await mockDelay(progress);
		sWallet.set(mockData.mockUnlockStart);
		return mockData.mockUnlockStart;
	}

	resetApiError();
	sApiProgressInfo.set(progress);

	const res = await window.firmly.shopPayWalletUnlockStart(emailAddress, captcha);
	if (res.status == 200) {
		sWallet.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function shopPayWalletUnlockComplete(otp) {
	if (isMock) {
		await mockDelay(ProgressUnlockComplete);
		sWallet.set(mockData.mockUnlockComplete);
		return mockData.mockUnlockComplete;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressUnlockComplete);

	const res = await window.firmly.shopPayWalletUnlockComplete(otp);
	if (res.status == 200) {
		sWallet.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartShoppayWallet(cardId) {
	if (isMock) {
		await mockDelay(ProgressShoppayTokenize);
		return mockData.mockC2PCVV;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressShoppayTokenize);
	const res = await window.firmly.paymentShopPayTokenize(cardId);
	if (res.status == 200) {
		sCartPayment.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

//#endregion

//#region Paypal
export async function paypalStart() {
	resetApiError();
	//sApiProgressInfo.set(ProgressPaypalStart);

	const res = await window.firmly.paypalStart();
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	//sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

export async function paypalApprove(attributes) {
	if (isMock) {
		sCart.set(mockData.mockPaypalPhoneMissingComplete);
		//sCart.set(mockData.mockPaypalComplete);
		await mockDelay(ProgressPaypalComplete);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressPaypalComplete);

	const res = await window.firmly.paypalAuthorize(attributes);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function paypalCompleteOrder(attributes) {
	if (isMock) {
		await mockDelay(ProgressOrderPlacement);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressOrderPlacement);

	const res = await window.firmly.paypalCompleteOrder(attributes);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}
//#endregion

//#region Cart API's
async function cartSessionTransfer(body) {
	if (isMock) {
		await mockDelay(ProgressTransferCart);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressTransferCart);

	const res = await window.firmly.cartSessionTransfer(body);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartUpdateShippingInfo(shippingInfo) {
	if (isMock) {
		if (cartData.session) {
			//Coming from Login Merchant
			cartData.session = mockData.mockSession;
			sCart.set(cartData);
		} else if (!cartData.shipping_info) {
			//Coming from paypal incomplete shipping info.
			sCart.set(mockData.mockPaypalComplete);
		}
		await mockDelay(ProgressShippingInfo);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressShippingInfo);

	const body = {
		email: shippingInfo.email,
		phone: shippingInfo.phone || DEFAULT_PHONE,
		address1: shippingInfo.address1,
		address2: shippingInfo.address2 || ' ',
		city: shippingInfo.city,
		country: shippingInfo.country,
		first_name: shippingInfo.first_name,
		last_name: shippingInfo.last_name,
		postal_code: shippingInfo.postal_code,
		state_or_province: shippingInfo.state_or_province
	};

	const res = await window.firmly.cartUpdateShippingInfo(body);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartUpdateDelivery(sku) {
	if (isMock) {
		await mockDelay(ProgressDelivery);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressDelivery);

	const res = await window.firmly.cartUpdateDelivery(sku);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartCompleteOrder() {
	if (isMock) {
		await mockDelay(ProgressOrderPlacement);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressOrderPlacement);

	const res = await window.firmly.cartCompleteOrder(cartPaymentData.token);
	if (res.status == 200) {
		sCart.set(res.data);
		if (res.data.notice) {
			sApiError.set(res.data);
		}
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartUpdateSku(sku, quantity, variantHandles = []) {
	if (isMock) {
		await mockDelay(ProgressCartUpdate);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressCartUpdate);

	const res = await window.firmly.cartUpdateSku(sku, quantity, variantHandles);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	postUpdateCart();
	return res.status == 200 ? res.data : null;
}

async function sessionJoin(password) {
	if (isMock) {
		await mockDelay(ProgressSessionJoin);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressSessionJoin);

	const res = await window.firmly.sessionJoin(password);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function sessionCreateOtp(email) {
	if (isMock) {
		await mockDelay(ProgressSessionCreateOtp);
		sLoginOtpFlow.set(cLoginOtpValidation);
		return mockData.mockUnlockStart;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressSessionCreateOtp);

	const res = await window.firmly.sessionCreateOtp(email);
	if (res.status !== 200) {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function sessionValidateOtp(email, otp) {
	if (isMock) {
		await mockDelay(ProgressUnlockComplete);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressUnlockComplete);

	const res = await window.firmly.sessionValidateOtp(email, otp);
	if (res.status !== 200) {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

async function cartSavedPaymentCompleteOrder(paymentId) {
	if (isMock) {
		await mockDelay(ProgressOrderPlacement);
		return cartData;
	}

	resetApiError();
	sApiProgressInfo.set(ProgressOrderPlacement);

	const res = await window.firmly.cartSavedPaymentCompleteOrder(paymentId);
	if (res.status == 200) {
		sCart.set(res.data);
	} else {
		sApiError.set(res.data);
	}

	sApiProgressInfo.set(ProgressEmpty);
	return res.status == 200 ? res.data : null;
}

//#endregion

//#region Address
function mapAddress(e) {
	if (e.address) {
		const split = e.address.split(',');
		if (split && split.length >= 1) {
			e.address1 = split[0];
		}
	}
	return e;
}

async function searchAddress(prefix, domain = null) {
	const res = await window.firmly.searchAddress(prefix, domain);
	if (res.status == 200) {
		const add = res.data.predictions.map(mapAddress);
		return add;
	}

	return [];
}

async function getAddress(id, domain) {
	const res = await window.firmly.getAddress(id, domain);
	if (res.status == 200) {
		return res.data;
	}

	return [];
}

//#endregion
