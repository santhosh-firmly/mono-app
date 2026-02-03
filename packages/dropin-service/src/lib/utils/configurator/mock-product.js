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

export function formatPrice(value, currency) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}
