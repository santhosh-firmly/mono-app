// @ts-nocheck
import * as Yup from 'yup';

import { getCardTypeByValue, validateLuhn } from './credit-card-helper.js';
import { CreditCardValidation, ExpiryDateValidation, LastNameRequired, maximum, minumum, PhoneNumberValidation, Required, ZipCodeValidation } from './localization.js';

// Reference for the Regex (Francis Gagnon's answer): https://stackoverflow.com/questions/16699007/regular-expression-to-match-standard-10-digit-phone-number
const phoneRegExp = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/m;
Yup.addMethod(Yup.string, 'phone', function (messageError = PhoneNumberValidation) {
    return this.test('phone', messageError, (value) => {
        if (value && value.length > 0) {
            return phoneRegExp.test(value);
        }
        return true;
    });
});

const MONTH_REGEX = /(0[1-9]|1[0-2])/;
const INVALID_EXPIRY_DATE = 'Expiry date is invalid';
const MONTH_OUT_OF_RANGE = 'Expiry month must be between 01 and 12';
const YEAR_OUT_OF_RANGE = 'Expiry year cannot be in the past';
const DATE_OUT_OF_RANGE = 'Expiry date cannot be in the past';

Yup.addMethod(Yup.string, 'expiry', function (messageError = ExpiryDateValidation) {
    return this.test('expiry', messageError, function (value) {
        const { path, createError } = this;
        if (value && value.length > 0) {
            const rawExpiryDate = value.replace(' / ', '').replace('/', '');
            if (rawExpiryDate.length === 4) {
                const month = rawExpiryDate.slice(0, 2);
                const year = `20${rawExpiryDate.slice(2, 4)}`;
                if (!MONTH_REGEX.test(month)) {
                    return createError({ path, message: MONTH_OUT_OF_RANGE });
                }
                const now = new Date();
                const iYear = parseInt(year);
                if (iYear < now.getFullYear()) {
                    return createError({ path, message: YEAR_OUT_OF_RANGE });
                }
                const iMonth = parseInt(month);
                if (iYear === now.getFullYear() && iMonth < now.getMonth() + 1) {
                    return createError({ path, message: DATE_OUT_OF_RANGE });
                }
                return true;
            }
            return createError({ path, message: INVALID_EXPIRY_DATE });
        }
        return true;
    });
});

Yup.addMethod(Yup.string, 'expiryMonth', function (messageError = ExpiryDateValidation) {
    return this.test('expiration month', messageError, function (value) {
        const { path, createError } = this;
        if (value && value.length > 0) {
            const month = value;
            if (!MONTH_REGEX.test(month)) {
                return createError({ path, message: MONTH_OUT_OF_RANGE });
            }
            return true;
        }
        return true;
    });
});

Yup.addMethod(Yup.string, 'expiryYear', function (messageError = ExpiryDateValidation) {
    return this.test('expiry year', messageError, function (value) {
        const { path, createError } = this;
        if (value && value.length > 0) {
            const year = value.length === 4 ? value : '20' + value;
            const now = new Date();
            const iYear = parseInt(year);
            if (iYear < now.getFullYear()) {
                return createError({ path, message: YEAR_OUT_OF_RANGE });
            }
            return true;
        }
        return true;
    });
});

Yup.addMethod(Yup.string, 'cardnumber', function (messageError = CreditCardValidation) {
    return this.test('cardnumber', messageError, (value) => {
        if (value && value.length > 0) {
            const rawCardNumber = value.replace(/\s/g, '');

            const cardType = getCardTypeByValue(rawCardNumber);
            if (cardType && cardType.lengths) {
                const matchLength = cardType.lengths.includes(rawCardNumber.length);
                if (matchLength) {
                    return validateLuhn(rawCardNumber);
                }
            }

            // Support for Shopify Bogus Gateway
            if (rawCardNumber === '1') {
                return true;
            }
            return false;
        }
        return true;
    });
});

const Email = {
    email: Yup.string().email().required(Required).default(''),
};

const FirstAndLastName = {
    first_name: Yup.string().required(Required).min(3, minumum(3)).max(30, maximum(30)).default(''),
    last_name: Yup.string().required(LastNameRequired).min(3, minumum(3)).max(30, maximum(30)).default(''),
};

export const EmailSchema = Yup.object().shape(Email);

const Phone = {
    phone: Yup.string().phone().required(Required).default(''),
};

export const PhoneSchema = Yup.object().shape(Phone);

export const ContactSchema = Yup.object().shape({
    ...Email,
    ...Phone,
});

const address = {
    address1: Yup.string().required(Required).min(3, minumum(3)).max(100, maximum(100)).default(''),
    address2: Yup.string().default('').max(100, maximum(100)),
    city: Yup.string().required(Required).default('').max(100, maximum(100)),
    state_or_province: Yup.string().required(Required).default('').max(100, maximum(100)),
    postal_code: Yup.string()
        .required(Required)
        .default('')
        .matches(/^\d{5}[-\s]?(?:\d{4})?$/, ZipCodeValidation)
        .max(50, maximum(50)),
    country: Yup.string().required(Required).default('United States').max(50, maximum(50)),
};

export const CVCSchema = Yup.object().shape({
    cvc: Yup.string().required(Required).max(4, maximum(4)).default(''),
});

export const creditCard = {
    cardType: Yup.mixed().default(''),
    cardName: Yup.string().required(Required).min(3, minumum(3)).max(30, maximum(30)).default(''),
    cardNumber: Yup.string().required(Required).cardnumber().default(''),
    expiryDate: Yup.string().required(Required).expiry().default(''),
    cvc: Yup.string().required(Required).max(4, maximum(4)).default(''),
};

export const CreditCardSchema = Yup.object().shape({
    ...creditCard,
});

export const CreditCardApiSchema = Yup.object().shape({
    number: Yup.string().required(Required).cardnumber().default(''),
    month: Yup.string().required(Required).expiryMonth().default(''),
    year: Yup.string().required(Required).expiryYear().default(''),
    verification_value: Yup.string().required(Required).max(4, maximum(4)).default(''),
});

export const PaymentInfoSchema = Yup.object().shape({
    ...address,
    ...creditCard,
    sameAsShipping: Yup.boolean().default(true),
});

const ShippingAddress = {
    ...address,
    ...Phone,
    ...FirstAndLastName,
    isC2P: Yup.boolean().default(true),
};

const ShippingAddressWithoutPhone = {
    ...address,
    ...FirstAndLastName,
    isC2P: Yup.boolean().default(true),
};

export const ShippingAddressSchema = Yup.object().shape(ShippingAddress);
export const ShippingAddressWithoutPhoneSchema = Yup.object().shape(ShippingAddressWithoutPhone);

export const ShippingInfoSchema = Yup.object().shape({
    ...Email,
    ...Phone,
    ...ShippingAddress,
});

export const BillingInfoSchema = Yup.object().shape({
    ...address,
    ...Phone,
    ...FirstAndLastName,
});

const Password = {
    password: Yup.string().trim().required(Required).default(''),
};

export const PasswordSchema = Yup.object().shape(Password);
