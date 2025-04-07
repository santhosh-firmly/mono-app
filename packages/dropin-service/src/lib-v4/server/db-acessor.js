/**
 * Fetch merchant presentation data from D1 database
 * @param {string} domain - The merchant domain to fetch data for
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object>} - Merchant presentation data (theme, logos, etc.)
 */

export const getMerchantPresentation = async (domain, env) => {
	if (!domain || !env?.firmlyConfigs) {
		console.error('Missing domain or D1 database binding');
		return null;
	}

	try {
		const { results } = await env.firmlyConfigs
			.prepare('SELECT info FROM merchant_presentation WHERE key = ?')
			.bind(domain)
			.all();

		if (results && results.length > 0) {
			let info = results[0].info;
			if (typeof info === 'string') {
				try {
					info = JSON.parse(info);
				} catch (e) {
					console.error('Error parsing info JSON:', e);
					return null;
				}
			}

			return {
				domain,
				theme: info.theme,
				largeLogo: info.theme?.largeLogo,
				smallLogo: info.theme?.smallLogo,
				termsOfUse: info.termsOfUse,
				privacyPolicy: info.privacyPolicy
			};
		}

		console.warn(`No presentation data found for domain: ${domain}`);
		return null;
	} catch (error) {
		console.error('Error fetching merchant presentation:', error);
		return null;
	}
};
