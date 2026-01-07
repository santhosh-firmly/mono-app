/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, platform }) {
	const db = platform?.env?.dashUsers;

	// Fetch merchant list for quick-access navigation
	let merchants = [];
	if (db) {
		try {
			const { results } = await db
				.prepare('SELECT domain FROM merchant_dashboards ORDER BY domain ASC')
				.all();
			merchants = (results || []).map((r) => ({ domain: r.domain }));
		} catch (error) {
			console.error('Error fetching merchants for quick access:', error);
		}
	}

	return {
		...locals,
		merchants
	};
}
