import { getMerchantPresentation } from './db-acessor.js';

export const load = async ({ url, platform }) => {
	const domain = url.searchParams.get('domain')?.replace(/^www\./, '');
	const urlParam = url.searchParams.get('url');

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
