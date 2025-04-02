// @ts-nocheck

import AmexCardIcon from '$lib-v4/components/common/svg/amex-card-icon.svelte';
import AmexCardIconV4 from '$lib-v4/components/common/svg/amex-card-icon-v4.svelte';
import DinersCardIcon from '$lib-v4/components/common/svg/diners-card-icon.svelte';
import DiscoverCardIcon from '$lib-v4/components/common/svg/discover-card-icon.svelte';
import EmptyCardIcon from '$lib-v4/components/common/svg/empty-card-icon.svelte';
import JcbCardIcon from '$lib-v4/components/common/svg/jcb-card-icon.svelte';
import JcbCardIconV4 from '$lib-v4/components/common/svg/jcb-card-icon-v4.svelte';
import MasterCardIcon from '$lib-v4/components/common/svg/master-card-icon.svelte';
import MasterCardIconV4 from '$lib-v4/components/common/svg/master-card-icon-v4.svelte';
import UnionpayCardIcon from '$lib-v4/components/common/svg/unionpay-card-icon.svelte';
import VisaCardIcon from '$lib-v4/components/common/svg/visa-card-icon.svelte';
import VisaCardIconV4 from '$lib-v4/components/common/svg/visa-card-icon-v4.svelte';

export const DEFAULT_CVC_LENGTH = 3;
export const DEFAULT_ZIP_LENGTH = 5;
export const DEFAULT_CARD_FORMAT = /(\d{1,4})/g;
export const CARD_ICON_COMPONENTS = [
	VisaCardIconV4,
	MasterCardIconV4,
	JcbCardIconV4,
	AmexCardIconV4
];

export const CARD_TYPES = {
	visa: {
		component: VisaCardIcon,
		displayName: 'Visa',
		type: 'visa',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^4/,
		lengths: [16, 18, 19],
		code: {
			name: 'CVV',
			length: 3
		}
	},
	mastercard: {
		component: MasterCardIcon,
		displayName: 'Mastercard',
		type: 'mastercard',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
		lengths: [16],
		code: {
			name: 'CVC',
			length: 3
		}
	},
	amex: {
		component: AmexCardIcon,
		displayName: 'American Express',
		type: 'amex',
		format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
		startPattern: /^3[47]/,
		lengths: [15],
		code: {
			name: 'CID',
			length: 4
		}
	},
	discover: {
		component: DiscoverCardIcon,
		displayName: 'Discover',
		type: 'discover',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(6011|65|64[4-9]|622)/,
		lengths: [16, 19],
		code: {
			name: 'CID',
			length: 3
		}
	},
	dinersclub: {
		component: DinersCardIcon,
		displayName: 'Diners Club',
		type: 'dinersclub',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(36|38|30[0-5])/,
		lengths: [14, 16, 19],
		code: {
			name: 'CVV',
			length: 3
		}
	},
	jcb: {
		component: JcbCardIcon,
		displayName: 'JCB',
		type: 'jcb',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^35/,
		lengths: [16, 17, 18, 19],
		code: {
			name: 'CVV',
			length: 3
		}
	},
	unionpay: {
		component: UnionpayCardIcon,
		displayName: 'UnionPay',
		type: 'unionpay',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^62/,
		lengths: [14, 15, 16, 17, 18, 19],
		code: {
			name: 'CVN',
			length: 3
		}
	}
};

export const CARD_TYPES_CHECKOUT_V4 = {
	visa: {
		component: VisaCardIconV4,
		displayName: 'Visa',
		type: 'visa',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^4/,
		lengths: [16, 18, 19],
		code: {
			name: 'CVV',
			length: 3
		}
	},
	mastercard: {
		component: MasterCardIconV4,
		displayName: 'Mastercard',
		type: 'mastercard',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(5[1-5]|677189)|^(222[1-9]|2[3-6]\d{2}|27[0-1]\d|2720)/,
		lengths: [16],
		code: {
			name: 'CVC',
			length: 3
		}
	},
	amex: {
		component: AmexCardIconV4,
		displayName: 'American Express',
		type: 'amex',
		format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
		startPattern: /^3[47]/,
		lengths: [15],
		code: {
			name: 'CID',
			length: 4
		}
	},
	discover: {
		component: DiscoverCardIcon,
		displayName: 'Discover',
		type: 'discover',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(6011|65|64[4-9]|622)/,
		lengths: [16, 19],
		code: {
			name: 'CID',
			length: 3
		}
	},
	dinersclub: {
		component: DinersCardIcon,
		displayName: 'Diners Club',
		type: 'dinersclub',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^(36|38|30[0-5])/,
		lengths: [14, 16, 19],
		code: {
			name: 'CVV',
			length: 3
		}
	},
	jcb: {
		component: JcbCardIconV4,
		displayName: 'JCB',
		type: 'jcb',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^35/,
		lengths: [16, 17, 18, 19],
		code: {
			name: 'CVV',
			length: 3
		}
	},
	unionpay: {
		component: UnionpayCardIcon,
		displayName: 'UnionPay',
		type: 'unionpay',
		format: DEFAULT_CARD_FORMAT,
		startPattern: /^62/,
		lengths: [14, 15, 16, 17, 18, 19],
		code: {
			name: 'CVN',
			length: 3
		}
	}
};

CARD_TYPES_CHECKOUT_V4.master = CARD_TYPES_CHECKOUT_V4.mastercard;

export const EmptyCardInfo = {
	component: EmptyCardIcon,
	displayName: 'CC',
	type: 'empty'
};

export function getCardTypeByValue(value, origin) {
	let cardTypes = origin === 'checkoutV4' ? CARD_TYPES_CHECKOUT_V4 : CARD_TYPES;
	for (const key in cardTypes) {
		let card = cardTypes[key];
		if (card.startPattern.test(value)) {
			return card;
		}
	}
	return EmptyCardInfo;
}

export function getCardTypeByType(type, origin) {
	let cardTypes = origin === 'checkoutV4' ? CARD_TYPES_CHECKOUT_V4 : CARD_TYPES;
	const card = cardTypes[type.toLowerCase()];
	return card ? card : EmptyCardInfo;
}

const expirySeparator = '/';

export function formatExpiry(event) {
	const eventData = event.nativeEvent && event.nativeEvent.data;
	const prevExpiry = event.target.value;

	if (!prevExpiry) return null;
	let expiry = prevExpiry;
	if (/^[2-9]$/.test(expiry)) {
		expiry = `0${expiry}`;
	}

	if (prevExpiry.length === 2 && +prevExpiry > 12) {
		const [head, ...tail] = prevExpiry.split('');
		expiry = `0${head}/${tail.join('')}`;
	}

	if (/^1[/-]$/.test(expiry)) {
		return `01${expirySeparator}`;
	}

	expiry = expiry.match(/(\d{1,2})/g) || [];
	if (expiry.length === 1) {
		if (!eventData && prevExpiry.includes(expirySeparator)) {
			return expiry[0];
		}
		if (/\d{2}/.test(expiry)) {
			return `${expiry[0]}${expirySeparator}`;
		}
	}
	if (expiry.length > 2) {
		const [, month = null, year = null] = expiry.join('').match(/^(\d{2}).*(\d{2})$/) || [];
		return [month, year].join(`${expirySeparator}`);
	}
	return expiry.join(`${expirySeparator}`);
}

export function formatCardNumberRaw(cardNumber) {
	const ret = { cardType: null, formatted: '' };
	cardNumber = cardNumber?.replace(/\s*/g, '')?.substring(0, 19);
	const cardType = getCardTypeByValue(cardNumber);

	if (!cardType) {
		ret.formatted = (cardNumber.match(/\d+/g) || []).join('');
		return ret;
	}
	ret.cardType = cardType;

	const format = cardType.format;
	if (format && format.global) {
		ret.formatted = (cardNumber.match(format) || []).join(' ');
		return ret;
	}

	if (format) {
		const execResult = format.exec(cardNumber.split(' ').join(''));
		if (execResult) {
			ret.formatted = execResult
				.splice(1, 3)
				.filter((x) => x)
				.join(' ');
			return ret;
		}
	}

	ret.formatted = (cardNumber?.match(DEFAULT_CARD_FORMAT) || []).join(' ');
	return ret;
}

export function formatCardNumber(event) {
	return formatCardNumberRaw(event.target.value || '');
}

export function validateLuhn(cardNumber) {
	return (
		cardNumber
			.split('')
			.reverse()
			.map((digit) => parseInt(digit, 10))
			.map((digit, idx) => (idx % 2 ? digit * 2 : digit))
			.map((digit) => (digit > 9 ? (digit % 10) + 1 : digit))
			.reduce((accum, digit) => (accum += digit)) %
			10 ===
		0
	);
}

export function isCardMaxLength(cardNumber) {
	const cardType = getCardTypeByValue(cardNumber);
	return cardType && cardNumber.length >= cardType.lengths[cardType.lengths.length - 1];
}

//0-9 Number keys 48-57
//0-9 Number Pad keys 96-105
export const CreditCardNumbers = [
	8, 46, 35, 36, 37, 39, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103,
	104, 105
];
export const ExpiryDateNumbers = [...CreditCardNumbers, 191];

export function validateNumber(evt, validCodes) {
	const keyCode = evt.keyCode || evt.which;
	// Ctrl+A, Ctrl+C, Ctrl+V
	if ((keyCode == 65 || keyCode == 67 || keyCode == 86) && (evt.ctrlKey || evt.metaKey)) {
		return;
	}
	if (validCodes.indexOf(keyCode) == -1) {
		evt.returnValue = false;
		if (evt.preventDefault) {
			evt.preventDefault();
		}
	}
}

export function validateCreditCard(evt) {
	return validateNumber(evt, CreditCardNumbers);
}

export function validateExpiryDate(evt) {
	return validateNumber(evt, ExpiryDateNumbers);
}

export function validateCVC(evt) {
	return validateNumber(evt, CreditCardNumbers);
}
