// @ts-nocheck
import { firmly_cf_server, firmly_api_token } from '$lib/server/env.js';
import { error, json } from '@sveltejs/kit';

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: 'edge'
};

const url = `${firmly_cf_server}/api/v1/devices-session`;

export async function POST(event) {
	let body = await event.request.text();
	let ret = await fetch(url, {
		method: event.request.method,
		body: body,
		headers: {
			'x-firmly-authorization': firmly_api_token,
			'Content-Type': 'application/json'
		}
	});
	let data = await ret.json();
	if (ret.status == 200) {
		return json(data);
	} else {
		throw error(ret.status, data);
	}
}
