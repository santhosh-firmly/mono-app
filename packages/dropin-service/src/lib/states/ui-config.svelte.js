let locale = $state('en-US');
let currency = $state('USD');

export function toCurrency(value) {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);
}
