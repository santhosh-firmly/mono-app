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
	const firmlyDomain = getDomain(url);
	const merchantUrl = url.searchParams.get('domain') || url.searchParams.get('url');
	const merchantDomain = getDomain(merchantUrl);

	const envVars = {
		PUBLIC_api_id: platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server,
		PUBLIC_DISABLE_HCAPTCHA: platform.env.PUBLIC_DISABLE_HCAPTCHA
	};

	const isValidRequest = firmlyDomain.includes('firmly') && merchantDomain;
	if (!isValidRequest) {
		console.error('Invalid domain', { merchantDomain, firmlyDomain });
		return {
			...envVars,
			merchantPresentation: null
		};
	}

	const merchantPresentation = await getMerchantPresentation(merchantDomain, platform.env);

	return {
		...envVars,
		merchantPresentation
	};
};
