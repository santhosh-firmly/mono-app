// @ts-nocheck
import { cookie_key } from './env.js';

const _Crypto = crypto.subtle;
let cookieKey = null;
async function getKey() {
	if (cookieKey == null) {
		cookieKey = await _Crypto.importKey(
			'jwk',
			JSON.parse(cookie_key),
			{ name: 'HMAC', hash: 'SHA-512' },
			true,
			['sign', 'verify']
		);
	}
	return cookieKey;
}
// generate the key and keep it.
getKey();

function base64EncodeURL(byteArray) {
	return btoa(
		Array.from(new Uint8Array(byteArray))
			.map((val) => String.fromCharCode(val))
			.join('')
	)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

function base64DecodeURL(b64urlstring) {
	return new Uint8Array(
		atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/'))
			.split('')
			.map((val) => val.charCodeAt(0))
	);
}

export async function sign(message) {
	let key = await getKey();
	let ec = new TextEncoder().encode(message);
	let signed = await _Crypto.sign('HMAC', key, ec);
	return base64EncodeURL(signed);
}

export async function verify(message, signature) {
	let key = await getKey();
	let ec = new TextEncoder().encode(message);
	let signed = base64DecodeURL(signature);
	return await _Crypto.verify('HMAC', key, signed, ec);
}
