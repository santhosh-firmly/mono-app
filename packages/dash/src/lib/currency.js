const currencies = {
    USD: {
        symbol: '$',
        decimalPlaces: 2,
    },
}

export function formatCurrencyObject(currencyEntry) {
    const currency = currencies[currencyEntry.currency];
    return currency.symbol + currencyEntry.value.toFixed(currency.decimalPlaces);
}

export function formatCurrency(value) {
    try {
        if (value.currency) {
            return formatCurrencyObject(value);
        }

        return '$' + value.toFixed(2);
    } catch (e) {
        return '';
    }
}
