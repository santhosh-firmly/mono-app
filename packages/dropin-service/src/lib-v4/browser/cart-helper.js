// @ts-nocheck
import { PriceFree } from './localization.js';

const symbolLookup = {
	USD: '$',
	CAD: '$',
	GBP: '£',
	EUR: '€',
	INR: '₹'
};

export function getPrice(price) {
	if (price) {
		return `${symbolLookup[price.currency]}${price?.value?.toFixed?.(2)}`;
	}
	return '';
}

export function getPriceFromValue(price, currency) {
	if (price) {
		return `${symbolLookup[currency]}${price?.toFixed?.(2)}`;
	}
	return '';
}

export function getShippingPrice(price) {
	if (price && price.value) {
		return `${symbolLookup[price.currency]}${price?.value?.toFixed?.(2)}`;
	} else {
		return PriceFree;
	}
}

export function getShippingDescription(item) {
	if (item) {
		return `${item.description} ${getShippingPrice(item.price)}`;
	} else {
		return '';
	}
}
