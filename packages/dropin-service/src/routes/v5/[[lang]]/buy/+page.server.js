import { getDomain } from 'foundation/utils/url.js';
import { getMerchantPresentation } from '$lib/server/merchant-config.js';
import { getPartnerPresentation } from '$lib/server/partner-config.js';

function buildEnvVars(appId, env) {
	return {
		PUBLIC_api_id: appId || env.PUBLIC_api_id,
		PUBLIC_cf_server: env.PUBLIC_cf_server,
		PUBLIC_firmly_deployment: env.PUBLIC_firmly_deployment,
		PUBLIC_aperture_domain: env.PUBLIC_aperture_domain,
		PUBLIC_DISABLE_HCAPTCHA: env.PUBLIC_DISABLE_HCAPTCHA,
		PUBLIC_c2p_sdk_url: env.PUBLIC_c2p_sdk_url,
		PUBLIC_c2p_dpa_id: env.PUBLIC_c2p_dpa_id,
		PUBLIC_c2p_initiator_id: env.PUBLIC_c2p_initiator_id,
		PUBLIC_unified_c2p_dpa_id: env.PUBLIC_unified_c2p_dpa_id,
		PUBLIC_unified_c2p_dpa_presentation_name: env.PUBLIC_unified_c2p_dpa_presentation_name,
		PUBLIC_unified_c2p_sandbox: Boolean(env.PUBLIC_unified_c2p_sandbox),
		PUBLIC_SESSION_RECORD_URL: env.PUBLIC_SESSION_RECORD_URL
	};
}

export const load = async ({ url, platform }) => {
	const appId = url.searchParams.get('_appId');
	const merchantUrl = url.searchParams.get('domain') || url.searchParams.get('url');
	const merchantDomain = getDomain(merchantUrl);

	const envVars = buildEnvVars(appId, platform.env);

	if (!merchantDomain) {
		console.error('Missing merchant domain', { merchantUrl });
		const { partnerPresentation } = await getPartnerPresentation(appId, platform.env);

		return {
			...envVars,
			merchantPresentation: null,
			partnerPresentation
		};
	}

	const [merchantPresentation, { partnerPresentation }] = await Promise.all([
		getMerchantPresentation(merchantDomain, platform.env),
		getPartnerPresentation(appId, platform.env)
	]);

	return {
		...envVars,
		merchantDomain,
		merchantPresentation,
		partnerPresentation
	};
};
