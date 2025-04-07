import { accessData } from 'foundation/data-management/data-accessor.js';
import { getLogger } from 'foundation/utils/log.js';

/**
 * Fetch merchant presentation data from D1 database
 * @param {string} domain - The merchant domain to fetch data for
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object>} - Merchant presentation data (theme, logos, etc.)
 */

export const getMerchantPresentation = async (domain, env) => {
	if (!domain || !env?.firmlyConfigs) {
		getLogger('Data Accessor Error').error('Missing domain or D1 database binding');
		return null;
	}

	let context = {
		env: { DATA_ACCESS_STRATEGY: 'd1', firmlyConfigs: env?.firmlyConfigs }
	};

	try {
		const data = await accessData(context, 'merchant_presentation', domain);
		let presentationData = null;

		if (data) {
			presentationData = typeof data === 'string' ? JSON.parse(data) : data;

			return {
				domain,
				theme: presentationData.theme,
				largeLogo: presentationData.theme?.largeLogo,
				smallLogo: presentationData.theme?.smallLogo,
				termsOfUse: presentationData.termsOfUse,
				privacyPolicy: presentationData.privacyPolicy
			};
		}
	} catch (error) {
		getLogger('Data access error').error('Error fetching presentation data:', error);
		return null;
	}
};
