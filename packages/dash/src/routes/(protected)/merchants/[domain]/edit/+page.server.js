import { error } from '@sveltejs/kit';
import { merchants as data } from '$lib/assets/merchants-data.json';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const { domain } = params;

	const merchant = data.find((m) => m.store_id === domain);

	const platformOptions = Array.from(
		new Set(
			data.map(({ platform_id }) => JSON.stringify({ value: platform_id, label: platform_id }))
		)
	).map((item) => JSON.parse(item));

	const pspOptions = Array.from(
		new Set(data.map(({ psp }) => JSON.stringify({ value: psp, label: psp })))
	).map((item) => JSON.parse(item));

	if (!merchant) {
		throw error(404, 'Merchant not found');
	}

	return {
		merchant,
		platformOptions,
		pspOptions
	};
}
