// @ts-nocheck

import { PUBLIC_dropin_domain } from '$lib-v4/env.js';

/**
 * Gets the allowed target origin for postMessage
 * @returns {string} Target origin
 */
function getTargetOrigin(dropinDomain) {
	try {
		console.log('PUBLIC_dropin_domain:', 'background-color: #00ff00;', PUBLIC_dropin_domain);
		console.log('dropinDomain:', 'background-color: #00ff00;', dropinDomain);
		if (dropinDomain) {
			const url = new URL(dropinDomain);
			return url.origin;
		}
	} catch (error) {
		console.warn('firmly - failed to parse PUBLIC_dropin_domain:', error);
	}
	return '*';
}

/**
 * Requests storage data from parent SDK
 * @param {string} key - Storage key to request
 */
export function requestStorageData(key, dropinDomain) {
	const jData = JSON.stringify({
		action: 'firmlyRequestStorage',
		key
	});
	const targetOrigin = getTargetOrigin(dropinDomain);
	window.parent.postMessage(jData, targetOrigin);
}

/**
 * Sends storage data to parent SDK for persistence
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 */
export function syncStorageData(key, data, dropinDomain) {
	const jData = JSON.stringify({
		action: 'firmlySyncStorage',
		key,
		data
	});
	const targetOrigin = getTargetOrigin(dropinDomain);
	window.parent.postMessage(jData, targetOrigin);
}

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
