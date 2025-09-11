import { accessData } from 'foundation/data-management/data-accessor.js';
import { getLogger } from 'foundation/utils/log.js';

/**
 * Fetch partner configuration data from D1 database
 * @param {string} appId - The app ID to fetch configuration for
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object|null>} - Partner configuration data or null if not found
 */
export const getPartnerConfigFromDB = async (appId, env) => {
	if (!appId || !env?.firmlyConfigs) {
		getLogger('Partner Config Error').error('Missing appId or D1 database binding');
		return null;
	}

	let context = {
		env: { DATA_ACCESS_STRATEGY: 'd1', firmlyConfigs: env?.firmlyConfigs }
	};

	try {
		const data = await accessData(context, 'partner_presentation', appId);
		let configData = null;

		if (data) {
			configData = typeof data === 'string' ? JSON.parse(data) : data;

			return {
				id: configData.id || appId,
				name: configData.name,
				largeLogo: configData.largeLogo,
				smallLogo: configData.smallLogo,
				disclaimer: configData.disclaimer,
				buttonText: configData.buttonText
			};
		}

		return null;
	} catch (error) {
		getLogger('Partner Config Error').error('Error fetching partner config:', error);
		return null;
	}
};

/**
 * Gets complete partner configuration from database
 * @param {string} appId - App identifier
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object|null>} - Partner configuration object or null if not found
 */
export async function getPartnerConfig(appId, env) {
	if (!appId) {
		return null;
	}

	return await getPartnerConfigFromDB(appId, env);
}

/**
 * Gets partner information from database
 * @param {string} appId - The app ID to fetch configuration for
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object>} - Partner information object with default fallback
 */
export async function getPartnerInfo(appId, env) {
	const partnerConfig = await getPartnerConfig(appId, env);

	if (partnerConfig) {
		return {
			partnerInfo: {
				largeLogo: partnerConfig.largeLogo,
				smallLogo: partnerConfig.smallLogo,
				name: partnerConfig.name,
				displayName: partnerConfig.name,
				disclaimer: partnerConfig.disclaimer,
				buttonText: partnerConfig.buttonText
			}
		};
	}

	// Return default values when no partner config is found
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
