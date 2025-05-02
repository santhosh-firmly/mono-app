import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const { domain } = params;

	const store = await platform.env.firmlyConfigs
		.prepare(`SELECT * FROM stores WHERE key = ?`)
		.bind(domain)
		.first();

	const presentation = await platform.env.firmlyConfigs
		.prepare(`SELECT info FROM merchant_presentation WHERE key = ?`)
		.bind(domain)
		.first();

	if (!store) {
		throw error(404, 'Merchant not found');
	}

	const merchant = {
		...JSON.parse(store.info),
		presentation: presentation?.info ? JSON.parse(presentation.info) : {}
	};

	return {
		merchant
	};
}
