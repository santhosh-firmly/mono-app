import { getDomain } from 'foundation/utils/url.js';
import { getMerchantPresentation } from '$lib-v4/server/db-acessor.js';

/**
 * Server load function that fetches merchant presentation data
 * @param {Object} params - The parameters object
 * @param {URL} params.url - The request URL
 * @param {Object} params.platform - The platform object containing environment variables
 * @returns {Object} - Data object with platform environment variables and merchant presentation
 */
export const load = async ({ url, platform }) => {
	const domain = getDomain(url);
	const merchantUrl = url.searchParams.get('domain') || url.searchParams.get('url');
	const merchantDomain = getDomain(merchantUrl);

	const partnerSubdomains = {
		gannett: 'gannett',
		forbes: 'forbes'
	};

	let partner = null;

	const domainParts = domain.split('.');
	const firstSubdomain = domainParts.length > 2 ? domainParts[0] : null;
	if (firstSubdomain && partnerSubdomains[firstSubdomain]) {
		partner = partnerSubdomains[firstSubdomain];
	}

	const envVars = {
		PUBLIC_api_id: platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server,
		PUBLIC_DISABLE_HCAPTCHA: platform.env.PUBLIC_DISABLE_HCAPTCHA,
		PUBLIC_c2p_sdk_url: platform.env.PUBLIC_c2p_sdk_url,
		PUBLIC_c2p_dpa_id: platform.env.PUBLIC_c2p_dpa_id,
		PUBLIC_c2p_initiator_id: platform.env.PUBLIC_c2p_initiator_id,
		PUBLIC_unified_c2p_dpa_id: platform.env.PUBLIC_unified_c2p_dpa_id,
		PUBLIC_unified_c2p_dpa_presentation_name:
			platform.env.PUBLIC_unified_c2p_dpa_presentation_name
	};

	const isValidRequest = domain && merchantDomain;
	if (!isValidRequest) {
		console.error('Invalid domain', { merchantDomain, domain });
		return {
			...envVars,
			merchantPresentation: null
		};
	}

	const merchantPresentation = await getMerchantPresentation(merchantDomain, platform.env);

	return {
		...envVars,
		merchantPresentation,
		partner
	};
};
