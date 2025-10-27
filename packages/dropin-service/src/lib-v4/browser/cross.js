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

/**
 * Sends storage data to parent SDK for persistence
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 * @param {string} dropinDomain - Dropin domain for origin validation
 */
export function syncStorageData(key, data, dropinDomain) {
	const jData = JSON.stringify({
		action: 'firmlySyncStorage',
		key,
		data
	});

	window.parent.postMessage(jData, '*');
}

/**
 * Requests storage data from parent SDK
 * @param {string} key - Storage key to request
 * @param {string} dropinDomain - Dropin domain for origin validation
 */
export function requestStorageData(key, dropinDomain) {
	const jData = JSON.stringify({
		action: 'firmlyRequestStorage',
		key
	});

	window.parent.postMessage(jData, '*');
}
