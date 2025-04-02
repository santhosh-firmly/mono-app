// @ts-nocheck

export function createPayPalUrl({
	merchantId,
	// TODO: add clientId to worker variable when migrating this to mono-app
	clientId = '',
	currency = 'USD',
	intent = 'capture',
	integrationVersion = 'v3'
}) {
	const url = new URL('https://www.paypal.com/sdk/js');
	url.searchParams.set('client-id', clientId);
	if (merchantId) {
		url.searchParams.set('merchant-id', merchantId);
	}
	url.searchParams.set('commit', 'false');
	url.searchParams.set('currency', currency);
	url.searchParams.set('disable-funding', 'paylater,card');

	switch (integrationVersion) {
		case 'billing-aggreement-v1':
			url.searchParams.set('vault', true);
			url.searchParams.set('intent', 'tokenize');
			break;
		case 'v3':
		default:
			url.searchParams.set('intent', intent);
			url.searchParams.set('components', 'buttons');
			break;
	}

	return url.toString();
}
