import { getDomain } from 'foundation/utils/url.js';
import { getMerchantPresentation } from '$lib-v4/server/db-acessor.js';
import { getPartnerInfo } from '$lib-v4/server/partner-config.js';

/**
 * Server load function that fetches merchant presentation data
 * @param {Object} params - The parameters object
 * @param {URL} params.url - The request URL
 * @param {Object} params.platform - The platform object containing environment variables
 * @returns {Object} - Data object with platform environment variables and merchant presentation
 */
export const load = async ({ url, platform }) => {
	// Extract appId from _appId query parameter
	const appId = url.searchParams.get('_appId');

	const domain = getDomain(url);
	const merchantUrl = url.searchParams.get('domain') || url.searchParams.get('url');
	const merchantDomain = getDomain(merchantUrl);

	const { partnerInfo } = getPartnerInfo(domain);

	const envVars = {
		PUBLIC_api_id: appId || platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server,
		PUBLIC_firmly_deployment: platform.env.PUBLIC_firmly_deployment,
		PUBLIC_aperture_domain: platform.env.PUBLIC_aperture_domain,
		PUBLIC_DISABLE_HCAPTCHA: platform.env.PUBLIC_DISABLE_HCAPTCHA,
		PUBLIC_c2p_sdk_url: platform.env.PUBLIC_c2p_sdk_url,
		PUBLIC_c2p_dpa_id: platform.env.PUBLIC_c2p_dpa_id,
		PUBLIC_c2p_initiator_id: platform.env.PUBLIC_c2p_initiator_id,
		PUBLIC_unified_c2p_dpa_id: platform.env.PUBLIC_unified_c2p_dpa_id,
		PUBLIC_unified_c2p_dpa_presentation_name:
			platform.env.PUBLIC_unified_c2p_dpa_presentation_name,
		PUBLIC_unified_c2p_sandbox: Boolean(platform.env.PUBLIC_unified_c2p_sandbox)
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
		partnerInfo
	};
};
