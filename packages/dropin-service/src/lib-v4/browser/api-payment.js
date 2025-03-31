// @ts-nocheck

//#region Session Storage

// Session Storage checks
function isStorageAvailable(type) {
	let storage;
	try {
		storage = window[type];
		const x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	} catch (e) {
		return (
			e instanceof DOMException &&
			// everything except Firefox
			(e.code === 22 ||
				// Firefox
				e.code === 1014 ||
				// test name field too, because code might not be present
				// everything except Firefox
				e.name === 'QuotaExceededError' ||
				// Firefox
				e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
			// acknowledge QuotaExceededError only if there's something already stored
			storage &&
			storage.length !== 0
		);
	}
}

class InMemory {
	constructor() {
		this.local = {};
	}

	getItem(key) {
		return this.local[key];
	}
	setItem(key, value) {
		this.local[key] = value;
	}
	removeItem(key) {
		delete this.local[key];
	}
	clear() {
		this.local = {};
	}
}

let sessionStorage = new InMemory();

const PAYMENT_KEY = 'FPKEY';
function getPaymentKey() {
	const value = sessionStorage.getItem(PAYMENT_KEY);
	if (value) {
		return JSON.parse(value);
	}
	return null;
}

function setPaymentKey(value) {
	const js = JSON.stringify(value);
	sessionStorage.setItem(PAYMENT_KEY, js);
}

const CC_SERVER = 'FPS';
function getCCServer() {
	const value = sessionStorage.getItem(CC_SERVER);
	if (value) {
		return value;
	}
	return null;
}

function setCCServer(value) {
	sessionStorage.setItem(CC_SERVER, value);
}

function clearSessionStorage() {
	sessionStorage.removeItem(CC_SERVER);
	sessionStorage.removeItem(PAYMENT_KEY);
}

//#endregion

//#region Browser fetch

function handleFetchError(err) {
	return new Response(
		JSON.stringify({
			code: 460,
			error: 'NetworkError',
			description: 'Network error occurred.',
			errorString: err
		}),
		{ status: 460 }
	);
}

const defaultOptions = {
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json'
	},
	method: 'GET'
};

async function browserFetch(url, options = defaultOptions) {
	const mergedOptions = Object.assign(options, {
		credentials: 'include'
	});
	const res = await fetch(url, mergedOptions).catch(handleFetchError);
	let ret = { status: res.status };
	try {
		ret.data = await res.json();
	} catch (e) {
		/* empty */
	}

	return ret;
}

//#endregion

//#region Crypto Encryption
let CRYPTO;

function cryptoConcat(arrays) {
	// Get the total length of all arrays.
	const length = arrays.reduce((sum, item) => sum + item.byteLength, 0);
	const typedArrays = arrays.map((e) => new Uint8Array(e));

	// Create a new array with total length and merge all source arrays.
	const result = new Uint8Array(length);
	let offset = 0;
	typedArrays.forEach((item) => {
		result.set(item, offset);
		offset += item.byteLength;
	});

	return result;
}

async function gcmDataEncrypt(plain, key, iv) {
	const data = await CRYPTO.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);

	const authTagOffset = data.byteLength - 16;

	return {
		data: data.slice(0, authTagOffset),
		authTag: data.slice(authTagOffset)
	};
}

async function getRSAKey(jwkKey) {
	const version = jwkKey['kid'];
	const publicKey = await CRYPTO.subtle.importKey(
		'jwk',
		jwkKey,
		{ name: 'RSA-OAEP', hash: 'SHA-1' },
		true,
		['encrypt']
	);
	return { publicKey, version };
}

export async function gcmEncrypt(inputData) {
	try {
		const firmly = window.firmly;
		const encoder = new TextEncoder();
		const encodedData = encoder.encode(
			typeof inputData === 'string' ? inputData : JSON.stringify(inputData)
		);
		const { publicKey, version } = firmly.paymentRSAKey;

		// Generate a new AESGCM Key for encrypting the payload.
		const aesgcmKey = await CRYPTO.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
			'encrypt',
			'decrypt'
		]);
		const rawAesgcmKey = await CRYPTO.subtle.exportKey('raw', aesgcmKey);

		const iv = CRYPTO.getRandomValues(new Uint8Array(16));

		// Encrypt the data.
		const { data, authTag } = await gcmDataEncrypt(encodedData, aesgcmKey, iv);

		// Encrypt the meta data using the incoming public key.
		const b64Encoded = await CRYPTO.subtle.encrypt(
			{ name: 'RSA-OAEP', hash: 'SHA-1' },
			publicKey,
			cryptoConcat([rawAesgcmKey, iv, authTag])
		);

		const b64Encrypted = btoa(String.fromCharCode.apply(null, new Uint8Array(b64Encoded)));

		return {
			data: btoa(String.fromCharCode.apply(null, new Uint8Array(data))),
			metadata: `${version}|${b64Encrypted}`
		};
	} catch (e) {
		console.error('');
		return null;
	}
}

export async function rsaEncrypt(inputData) {
	try {
		const firmly = window.firmly;
		const { publicKey, version } = firmly.paymentRSAKey;
		// Encrypt the meta data using the public key.
		const plain = typeof inputData === 'string' ? inputData : JSON.stringify(inputData);
		const enc = await crypto.subtle.encrypt(
			{ name: 'RSA-OAEP', hash: 'SHA-1' },
			publicKey,
			Uint8Array.from(new TextEncoder().encode(plain))
		);
		const b64Enc = btoa(String.fromCharCode.apply(null, new Uint8Array(enc)));
		return `${version}|${b64Enc}`;
	} catch (e) {
		console.error(e);
		return null;
	}
}

//#endregion

//#region Payment API functions

function getCCUrl(suffix) {
	return `${window.firmly.ccServer}/api/v1/payment/${suffix}`;
}

function getHeaders() {
	const ret = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	return ret;
}

export async function paymentInitialize(ccServer) {
	const firmly = window.firmly;
	if (isStorageAvailable('sessionStorage')) {
		sessionStorage = window.sessionStorage;
	}

	if (!firmly.paymentRSAKey) {
		firmly.ccServer = ccServer;
		if (ccServer != getCCServer()) {
			//Different environment. Reset.
			clearSessionStorage();
			setCCServer(ccServer);
		}

		let paymentKey = getPaymentKey();
		if (!paymentKey) {
			let pay = await browserFetch(`${ccServer}/api/v1/payment/key`);
			if (pay.status == 200) {
				setPaymentKey(pay.data);
				paymentKey = pay.data;
			}
		}

		if (paymentKey) {
			firmly.paymentRSAKey = await getRSAKey(paymentKey);
			firmly.paymentJWKKey = paymentKey;
		}
	}
}

export async function paymentCreditCardTokenize(paymentInfo, paymentHandle) {
	const body = await gcmEncrypt(paymentInfo);
	body.handle = paymentHandle;

	const headers = getHeaders();
	const res = await browserFetch(getCCUrl('tokenize'), {
		...headers,
		method: 'POST',
		body: JSON.stringify(body)
	});
	return res;
}

//#endregion

//#region Initialize

if (typeof window !== 'undefined') {
	CRYPTO = window.crypto || window.msCrypto;
	const firmly = (window.firmly = window.firmly || {});

	firmly.paymentInitialize = paymentInitialize;
	firmly.paymentCreditCardTokenize = paymentCreditCardTokenize;
}

//#endregion
