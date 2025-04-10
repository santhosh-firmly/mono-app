// @ts-nocheck
import { writable } from 'svelte/store';

// Modal
const symModalKey = Symbol();
const sModalContent = writable(null);
const sModalOptions = writable({});

// Store Info
const sStoreInfo = writable({});
const sDynamoConfig = writable();

// Nav Bottom
const sIsNavBottomVisible = writable(true);
const sIsNavPlaceOrder = writable(false);
const sNavNextHandler = writable(null);
const sNavBackHandler = writable(null);

// Login
const cLoginOtpEmail = 1;
export const cLoginOtpValidation = 2;
export const sLoginOtpFlow = writable(cLoginOtpEmail);
const sLoginEmail = writable();
const sLoginOtpDestinations = writable();

// Payment Method
const cPaymentNone = 0;
const cPaymentCreditCard = 1;
const cPaymentC2P = 2;
const cPaymentShoppay = 3;
const cPaymentPaypal = 4;
const cPaymentLoginCreditCard = 5;
const cPaymentLogin = 6;
const sPaymentFlow = writable(cPaymentNone);

const cC2PaymentEmail = 1;
const cC2PaymentOTP = 2;
const cC2PaymentVerificationMethods = 3;
const cC2PaymentMethodOTP = 4;
const sC2PaymentFlow = writable(cC2PaymentEmail);

const cShopPayEmail = 1;
const cShopPayOTP = 2;
const sShopPayFlow = writable(cShopPayEmail);

const cLoginShipping = 1;
const cLoginPassword = 2;
const sLoginFlow = writable(cLoginShipping);

// Cart
const sCartHive = writable();
