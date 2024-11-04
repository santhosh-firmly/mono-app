// @ts-nocheck
import { writable } from 'svelte/store';

// Modal
export const symModalKey = Symbol();
export const sModalContent = writable(null);
export const sModalOptions = writable({});

// Store Info
export const sStoreInfo = writable({});
export const sDynamoConfig = writable();

// Nav Bottom
export const sIsNavBottomVisible = writable(true);
export const sIsNavPlaceOrder = writable(false);
export const sNavNextHandler = writable(null);
export const sNavBackHandler = writable(null);

// Login
export const cLoginOtpEmail = 1;
export const cLoginOtpValidation = 2;
export const sLoginOtpFlow = writable(cLoginOtpEmail);
export const sLoginEmail = writable();
export const sLoginOtpDestinations = writable();

// Payment Method
export const cPaymentNone = 0;
export const cPaymentCreditCard = 1;
export const cPaymentC2P = 2;
export const cPaymentShoppay = 3;
export const cPaymentPaypal = 4;
export const cPaymentLoginCreditCard = 5;
export const cPaymentLogin = 6;
export const sPaymentFlow = writable(cPaymentNone);

export const cC2PaymentEmail = 1;
export const cC2PaymentOTP = 2;
export const cC2PaymentVerificationMethods = 3;
export const cC2PaymentMethodOTP = 4;
export const sC2PaymentFlow = writable(cC2PaymentEmail);

export const cShopPayEmail = 1;
export const cShopPayOTP = 2;
export const sShopPayFlow = writable(cShopPayEmail);

export const cLoginShipping = 1;
export const cLoginPassword = 2;
export const sLoginFlow = writable(cLoginShipping);

// Cart
export const sCartHive = writable();
