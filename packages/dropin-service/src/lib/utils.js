export function getSLDomain(hostname) {
    if (hostname) {
        const split = hostname.split('.');
        if (split.length === 3) {
            return `.${split[1]}.${split[2]}`;
        }
        return hostname;
    }
    return hostname;
}

export function getCurrency(c) {
    if (!c) {
        return `$\u00A0-`;
    }

    const symbol = c.currency === 'USD' ? '$' : c.currency;
    return `${symbol}\u00A0${c.value?.toFixed?.(2)}`;
}

export function formatCurrency(currencyObject) {
    if (typeof currencyObject?.value !== 'undefined') {
        const value = currencyObject?.value?.toFixed?.(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `$${value}`;
    }
}
