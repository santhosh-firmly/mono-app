import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';

/**
 * GET /merchant/[domain]/catalog/products/api
 * Fetch products for a merchant with optional search.
 * Query params: search (optional), limit (default 50), offset (default 0)
 * Requires merchant access (any role).
 */
export async function GET({ locals, params, url, platform }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	// Check merchant access (any role is fine for read)
	if (!isFirmlyAdmin) {
		const merchantAccess = await getMerchantAccess({ platform, userId });
		const hasAccess = merchantAccess.some((a) => a.merchant_domain === domain);
		if (!hasAccess) {
			return json({ error: 'Access denied' }, { status: 403 });
		}
	}

	const search = url.searchParams.get('search') || '';
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
	const offset = parseInt(url.searchParams.get('offset') || '0', 10);

	try {
		// Fetch products from Firmly API
		// const apiUrl = platform?.env?.FIRMLY_BASE_URL || 'https://api.firmly.work';
		const queryParams = new URLSearchParams({
			from: offset.toString(),
			size: limit.toString()
		});
		if (search) {
			queryParams.set('q', search);
		}
		const apiUrl = `https://search-01.firmlyinc.com/products-${domain}/_search?${queryParams.toString()}`;
		console.log('apiUrl', apiUrl);
		const response = await fetch(apiUrl, {
			headers: {
				Authorization: `Basic ${btoa(`${platform.env.FIRMLY_API_USER}:${platform.env.FIRMLY_API_PASS}`)}`,
				'CF-Access-Client-Id': platform.env.CF_ACCESS_CLIENT_ID,
				'CF-Access-Client-Secret': platform.env.CF_ACCESS_CLIENT_SECRET
			}
		});

		if (!response.ok) {
			console.error('Failed to fetch products:', response.status);
			return json({ products: [], total: 0 });
		}

		let responseJson = await response.json();
		let products = responseJson.hits.hits.map((hit) => hit._source);

		// Ensure products is an array
		if (!Array.isArray(products)) {
			products = [];
		}

		// Filter by search query if provided
		if (search) {
			const searchLower = search.toLowerCase();
			products = products.filter((product) => {
				const title = (product.title || '').toLowerCase();
				const handle = (product.handle || '').toLowerCase();
				const description = (product.description || '').toLowerCase();
				const sku = (product.base_sku || '').toLowerCase();
				return (
					title.includes(searchLower) ||
					handle.includes(searchLower) ||
					description.includes(searchLower) ||
					sku.includes(searchLower)
				);
			});
		}

		return json({
			products,
			total: responseJson.hits.total.value,
			limit,
			offset,
			hasMore: offset + limit < responseJson.hits.total.value
		});
	} catch (error) {
		console.error('Error fetching products:', error);
		return json({ products: [], total: 0, error: 'Failed to fetch products' }, { status: 500 });
	}
}
