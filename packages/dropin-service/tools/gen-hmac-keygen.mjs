import crypto from 'node:crypto';
const SubtleCrypto = crypto.webcrypto.subtle;

async function hmacKeyGen() {
	let key = await SubtleCrypto.generateKey(
		{
			name: 'HMAC',
			hash: 'SHA-512'
		},
		true,
		['sign', 'verify']
	);

	let keyExport = await SubtleCrypto.exportKey('jwk', key);
	return JSON.stringify(keyExport);
}

function base64EncodeURL(byteArray) {
	return (
		btoa(
			Array.from(new Uint8Array(byteArray))
				.map((val) => {
					return String.fromCharCode(val);
				})
				.join('')
		)
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			// eslint-disable-next-line no-useless-escape
			.replace(/\=/g, '')
	);
}

function base64DecodeURL(b64urlstring) {
	return new Uint8Array(
		atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/'))
			.split('')
			.map((val) => {
				return val.charCodeAt(0);
			})
	);
}

async function sign(message, key) {
	let ec = new TextEncoder().encode(message);
	let signed = await SubtleCrypto.sign('HMAC', key, ec);
	return base64EncodeURL(signed);
}

async function verify(message, signature, key) {
	let ec = new TextEncoder().encode(message);
	let signed = base64DecodeURL(signature);
	return await SubtleCrypto.verify('HMAC', key, signed, ec);
}

let message = 'Warning';
let message1 = 'WarningSomething';
let message2 = 'WarningSomething';
async function boot() {
	let key = await hmacKeyGen();
	console.log(key);
	let parsedKey = JSON.parse(key);
	let imKey = await SubtleCrypto.importKey(
		'jwk',
		parsedKey,
		{ name: 'HMAC', hash: 'SHA-512' },
		true,
		['sign', 'verify']
	);

	let signature = await sign(message, imKey);
	console.log(signature);

	let verified = await verify(message, signature, imKey);
	console.log(verified);

	let signature1 = await sign(message1, imKey);
	console.log(signature1);

	let verified1 = await verify(message1, signature1, imKey);
	console.log(verified1);

	let signature2 = await sign(message2, imKey);
	console.log(signature2);

	let verified2 = await verify(message2, signature2, imKey);
	console.log(verified2);
}
boot();
