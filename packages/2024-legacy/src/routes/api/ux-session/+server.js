// @ts-nocheck
/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: 'edge'
};

import { env } from '$lib/server/env.js';
import { sign, verify } from '$lib/server/key-helper.js';
import { serverLogInfo } from '$lib/server/logger.js';

const deviceIDCookie = 'didl';

function getRandomId() {
	let ret = crypto.randomUUID().replaceAll('-', '');
	return ret;
}

const delimiter = '..';
async function signCookieValue(value) {
	const signed = await sign(value);
	return { signedValue: value + delimiter + signed, signed, value };
}

async function verifyCookieValue(value) {
	let signed,
		message = value;
	const split = value.split(delimiter);
	if (split.length > 1) {
		signed = split[1];
		message = split[0];
	}
	if (split.length == 1) {
		// Return verfied as false, as we don't have the signature.
		return { verified: false, signed, message };
	}
	const verified = await verify(message, signed);
	return { verified, signed, message };
}

async function getCookie(event, cookieName, options = {}) {
	let value, setCookie, signedValue;
	signedValue = event.cookies.get(cookieName);
	if (signedValue) {
		let verification = await verifyCookieValue(signedValue);
		if (verification.verified) {
			value = verification.message;
			return { value, signed: verification.signed, setCookie };
		}
	}
	value = getRandomId();
	let signed = await signCookieValue(value);
	setCookie = event.cookies.serialize(cookieName, signed.signedValue, options);

	return { value, signed: signed.signed, setCookie };
}

export async function GET(event) {
	serverLogInfo('environment: ', env);

	let did = await getCookie(event, deviceIDCookie, {
		maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
		httpOnly: true, // HttpOnly will prevent the client side to read the cookie information. Today, we use the did as the deviceId, which shouldn't read programitcally, so that we have security from other scripts to intercept.
		sameSite: 'none', // sameSite to none will allow the cookies to be sent, when the firmly.shop is iFramed in another site.
		secure: true // when sameSite is set to none, secure has to be present, otherwise, the cookies will not be sent. https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite#fixing_common_warnings
	});

	let body = {
		deviceId: did.value,
		isDeviceNew: did.setCookie !== undefined
	};
	let res = new Response(JSON.stringify(body));
	res.statusCode = 200;
	res.headers.set('Content-Type', 'application/json');
	if (did.setCookie) {
		res.headers.append('Set-Cookie', did.setCookie);
	}

	return res;
}
