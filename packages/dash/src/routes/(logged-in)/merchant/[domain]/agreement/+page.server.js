import { redirect } from '@sveltejs/kit';
import { getMerchantAgreement } from '$lib/server/merchant.js';

/**
 * Load function for the merchant agreement page.
 * Fetches agreement status and client info for signing.
 * Only owners and Firmly admins can access this page.
 */
export async function load({ locals, params, platform, request, parent }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	// Only owners and Firmly admins can access the agreement page
	const parentData = await parent();
	if (!isFirmlyAdmin && parentData.userRole !== 'owner') {
		redirect(303, `/merchant/${domain}`);
	}

	// Get current agreement status (includes config data)
	const agreementData = await getMerchantAgreement({ platform, merchantDomain: domain });

	// Get client info from Cloudflare headers for signing
	const clientIp =
		request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For');
	const cfData = request.cf || {};
	const clientLocation =
		cfData.city && cfData.country ? `${cfData.city}, ${cfData.country}` : null;

	// Build PDF URL if applicable
	const pdfUrl =
		agreementData.contentType === 'pdf' && agreementData.pdfKey
			? `/merchant/${domain}/agreement/pdf`
			: null;

	return {
		domain,
		userId,
		userEmail: email,
		isSigned: agreementData.signed,
		signedInfo: agreementData.agreement,
		clientIp,
		clientLocation,
		// Agreement config data
		contentType: agreementData.contentType || 'default',
		markdownContent: agreementData.markdownContent || null,
		pdfUrl,
		externallySigned: agreementData.externallySigned || false
	};
}
