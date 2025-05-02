// import merchants from '$lib/assets/data.json';

/** @type {import('./$types').PageLoad} */
export async function load({ platform }) {
	const { results } = await platform.env.firmlyConfigs.prepare(`SELECT info FROM stores`).all();
	const merchants = results.map((e) => JSON.parse(e.info));

	const uniquePsp = Array.from(new Set(merchants.map((m) => m.psp).filter((e) => e)));
	const uniquePlatforms = Array.from(
		new Set(merchants.map((m) => m.platform_id).filter((e) => e))
	);

	return {
		merchants,
		columns: {
			platform_id: uniquePlatforms,
			psp: uniquePsp
		}
	};
}
