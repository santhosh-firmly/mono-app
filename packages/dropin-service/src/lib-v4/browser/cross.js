// @ts-nocheck

export function postCheckoutClosed() {
	const jData = JSON.stringify({ action: 'firmlyCheckoutClosed' });
	window.parent.postMessage(jData, '*');
}

export function postOrderPlaced(url, session) {
	const jData = JSON.stringify({ action: 'firmlyOrderPlaced', url, session });
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
