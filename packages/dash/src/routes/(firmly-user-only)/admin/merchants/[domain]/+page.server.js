/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const resp = await fetch(
			`https://api.firmly.work/api/v1/domains-products/${params.domain}/_expanded`
		);

		if (!resp.ok) {
			console.error('Failed to fetch products:', resp.status);
			return { products: [] };
		}

		const data = await resp.json();

		// Handle different response formats - ensure products is always an array
		const products = Array.isArray(data) ? data : data?.products || [];

		return { products };
	} catch (error) {
		console.error('Error fetching products:', error);
		return { products: [] };
	}
}
