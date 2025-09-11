import { accessData } from 'foundation/data-management/data-accessor.js';
import { getLogger } from 'foundation/utils/log.js';

/**
 * Gets partner information from database with default fallback
 * @param {string} appId - The app ID to fetch configuration for
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object>} - Partner information object with default fallback
 */
export async function getPartnerInfo(appId, env) {
	if (!appId || !env?.firmlyConfigs) {
		getLogger('Partner Config Error').error('Missing appId or D1 database binding');
		return getDefaultPartnerInfo();
	}

	const context = {
		env: { DATA_ACCESS_STRATEGY: 'd1', firmlyConfigs: env.firmlyConfigs }
	};

	try {
		const data = await accessData(context, 'partner_presentation', appId);

		if (data) {
			const configData = typeof data === 'string' ? JSON.parse(data) : data;

			return {
				partnerInfo: {
					largeLogo: configData.largeLogo,
					smallLogo: configData.smallLogo,
					name: configData.name,
					displayName: configData.name,
					disclaimer: configData.disclaimer,
					buttonText: configData.buttonText
				}
			};
		}
	} catch (error) {
		getLogger('Partner Config Error').error('Error fetching partner config:', error);
	}

	return getDefaultPartnerInfo();
}

/**
 * Returns default partner info when no partner is found
 * @returns {Object} - Default partner information
 */
function getDefaultPartnerInfo() {
	return {
		partnerInfo: {
			largeLogo: null,
			smallLogo: null,
			name: 'Firmly',
			displayName: 'Firmly',
			disclaimer: null,
			buttonText: 'Place Order'
		}
	};
}
