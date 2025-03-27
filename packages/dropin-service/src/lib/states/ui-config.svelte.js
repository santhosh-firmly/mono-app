export let locale = $state('en-US');
export let currency = $state('USD');

export function toCurrency(value) {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency
	}).format(value);
}
