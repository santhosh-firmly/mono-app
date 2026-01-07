import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { getMerchantAgreement, signMerchantAgreement } from '$lib/server/merchant.js';

/**
 * GET /merchant/[domain]/api/agreement
 * Get the agreement status for this merchant.
 */
export async function GET({ locals, params, platform }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Firmly admins have access to all merchants
		if (!isFirmlyAdmin) {
			// Verify user has access to this merchant
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const hasAccess = merchantAccess.some((a) => a.merchant_domain === domain);

			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		// Get agreement status
		const agreement = await getMerchantAgreement({ platform, merchantDomain: domain });

		return json(agreement);
	} catch (error) {
		console.error('Error fetching agreement:', error);
		return json({ error: 'Failed to fetch agreement' }, { status: 500 });
	}
}

/**
 * POST /merchant/[domain]/api/agreement
 * Sign the merchant agreement.
 * Only owners can sign the agreement.
 */
export async function POST({ locals, params, platform, request }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Firmly admins have owner access to all merchants
		if (!isFirmlyAdmin) {
			// Verify user has owner access to this merchant
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);

			if (!currentAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}

			if (currentAccess.role !== 'owner') {
				return json(
					{ error: 'Only owners can sign the merchant agreement' },
					{ status: 403 }
				);
			}
		}

		// Get client info
		const body = await request.json();
		const clientIp =
			request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');
		const cfData = request.cf || {};
		const clientLocation =
			cfData.city && cfData.country ? `${cfData.city}, ${cfData.country}` : null;

		// Sign the agreement
		const result = await signMerchantAgreement({
			platform,
			merchantDomain: domain,
			userId,
			userEmail: email,
			browserInfo: body.browserInfo,
			clientIp,
			clientLocation
		});

		if (!result.success) {
			return json({ error: result.error }, { status: 400 });
		}

		return json({ success: true, agreement: result.agreement });
	} catch (error) {
		console.error('Error signing agreement:', error);
		return json({ error: 'Failed to sign agreement' }, { status: 500 });
	}
}
