import { getDomain } from 'foundation/utils/url.js';
import { getMerchantPresentation } from '$lib-v4/server/db-acessor.js';

export const load = async ({ url, platform }) => {
	let domain = getDomain(url);
	const urlParam = url.searchParams.get('url');

	if (domain.includes('firmly') && url.searchParams.has('domain')) {
		domain = url.searchParams.get('domain').replace('www.', '');
	}

	let merchantPresentation = null;

	if (domain) {
		merchantPresentation = await getMerchantPresentation(domain, platform.env);
	} else if (urlParam) {
		try {
			const urlDomain = new URL(urlParam).hostname.replace(/^www\./, '');
			merchantPresentation = await getMerchantPresentation(urlDomain, platform.env);
		} catch (e) {
			console.error('Error parsing URL:', e);
		}
	}
	return {
		PUBLIC_api_id: platform.env.PUBLIC_api_id,
		PUBLIC_cf_server: platform.env.PUBLIC_cf_server,
		PUBLIC_DISABLE_HCAPTCHA: platform.env.PUBLIC_DISABLE_HCAPTCHA,
		merchantPresentation
	};
};
