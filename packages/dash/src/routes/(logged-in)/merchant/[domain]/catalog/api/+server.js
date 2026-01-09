import { json } from '@sveltejs/kit';
import { getCatalogConfig, saveCatalogConfig } from '$lib/server/merchant.js';
import { getMerchantAccess } from '$lib/server/user.js';

/**
 * GET /merchant/[domain]/catalog/api
 * Get the catalog configuration for a merchant.
 */
export async function GET({ params, platform }) {
	try {
		const config = await getCatalogConfig({
			platform,
			merchantDomain: params.domain
		});

		return json(config);
	} catch (error) {
		console.error('Error fetching catalog config:', error);
		return json({ error: 'Failed to fetch catalog configuration' }, { status: 500 });
	}
}

/**
 * POST /merchant/[domain]/catalog/api
 * Save the catalog configuration for a merchant.
 * Only owners and editors can modify catalog config.
 */
export async function POST({ locals, params, platform, request }) {
	const { userId, email, isFirmlyAdmin } = locals.session;

	// Check owner/editor access
	if (!isFirmlyAdmin) {
		const merchantAccess = await getMerchantAccess({ platform, userId });
		const access = merchantAccess.find((a) => a.merchant_domain === params.domain);
		if (!['owner', 'editor'].includes(access?.role)) {
			return json({ error: 'Owner or editor access required' }, { status: 403 });
		}
	}

	try {
		const { catalogType } = await request.json();

		if (!catalogType || !['full', 'subset'].includes(catalogType)) {
			return json(
				{ error: 'Invalid catalog type. Must be "full" or "subset".' },
				{ status: 400 }
			);
		}

		const result = await saveCatalogConfig({
			platform,
			merchantDomain: params.domain,
			catalogType,
			actor: { id: userId, email }
		});

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json({
			success: true,
			isFirstTimeSave: result.isFirstTimeSave
		});
	} catch (error) {
		console.error('Error saving catalog config:', error);
		return json({ error: 'Failed to save catalog configuration' }, { status: 500 });
	}
}
