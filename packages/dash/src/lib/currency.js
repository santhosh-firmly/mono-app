const currencies = {
	USD: {
		symbol: '$',
		decimalPlaces: 2
	}
};

function currencyWithThousandSeparator(x) {
	x = x.toString();
	var pattern = /(-?\d+)(\d{3})/;
	while (pattern.test(x)) x = x.replace(pattern, '$1,$2');
	return x;
}

function formatCurrencyObject(currencyEntry) {
	const currency = currencies[currencyEntry.currency];
	return (
		currency.symbol +
		currencyWithThousandSeparator(currencyEntry.value.toFixed(currency.decimalPlaces))
	);
}

export function formatCurrency(value) {
	try {
		if (value.currency) {
			return formatCurrencyObject(value);
		}

		return '$' + currencyWithThousandSeparator(value.toFixed(2));
	} catch {
		return '';
	}
}
