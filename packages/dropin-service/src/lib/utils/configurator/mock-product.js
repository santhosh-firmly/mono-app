import { mockCartBlank } from '$lib/utils/mocks/mock-data.js';

export function getMockProduct() {
	const item = mockCartBlank.line_items[0];
	return {
		name: item.description,
		variant: item.variant_description,
		price: item.price.value,
		currency: item.price.currency,
		image: item.image.url,
		imageAlt: item.image.alt
	};
}

const LANGUAGE_TAG_TO_LOCALE = {
	en: 'en-US',
	'pt-br': 'pt-BR'
};

export function formatPrice(value, currency, languageTag = 'en') {
	const locale = LANGUAGE_TAG_TO_LOCALE[languageTag] || 'en-US';
	return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}
