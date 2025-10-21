// @ts-nocheck

export function postCheckoutClosed() {
	const jData = JSON.stringify({ action: 'firmlyCheckoutClosed' });
	window.parent.postMessage(jData, '*');
}

export function postOrderPlaced(url, session, order) {
	const jData = JSON.stringify({ action: 'firmlyOrderPlaced', url, session, order });
	window.parent.postMessage(jData, '*');
}

export function postGetParentInfo() {
	const jData = JSON.stringify({ action: 'getParentInfo' });
	window.parent.postMessage(jData, '*');
}

function postGetDynamoInfo() {
	window.parent.postMessage({ action: 'firmly::getDynamoInfo' }, '*');
}

export function postSignIn(cookies) {
	const jData = JSON.stringify({ action: 'firmlySignIn', cookies: cookies });
	window.parent.postMessage(jData, '*');
}

export function postQuantityUpdated(totalQuantity) {
	const jData = JSON.stringify({ action: 'firmlyQuantityUpdated', totalQuantity: totalQuantity });
	window.parent.postMessage(jData, '*');
}

function postRefresh() {
	const jData = JSON.stringify({ action: 'firmlyRefresh' });
	window.parent.postMessage(jData, '*');
}

export function postUpdateCart() {
	const jData = JSON.stringify({ action: 'cartUpdate' });
	window.parent.postMessage(jData, '*');
}

export function postCustomerShippingInfo(shippingInfo) {
	// Validate that we have meaningful data before sending
	if (!shippingInfo || typeof shippingInfo !== 'object') {
		console.warn('firmly - invalid shipping info, skipping customer data save');
		return;
	}

	// Only send if we have at least email or address information
	const hasEmail = shippingInfo.email;
	const hasAddress = shippingInfo.address1 || shippingInfo.postal_code;

	if (!hasEmail && !hasAddress) {
		console.warn('firmly - no meaningful customer data to save');
		return;
	}

	const jData = JSON.stringify({
		action: 'firmlyCustomerShippingInfo',
		shippingInfo
	});
	window.parent.postMessage(jData, '*');
}

export function requestCustomerData() {
	const jData = JSON.stringify({ action: 'firmlyRequestCustomerData' });
	window.parent.postMessage(jData, '*');
}
