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

	// Helper function to parse data if it's a string
	const parseIfString = (data) => (typeof data === 'string' ? JSON.parse(data) : data);

	try {
		const [partnerInfo, partnerPresentation] = await Promise.all([
			accessData(context, 'app_identifiers', appId),
			accessData(context, 'partner_presentation', appId)
		]);

		if (partnerPresentation && partnerInfo) {
			const presentation = parseIfString(partnerPresentation);
			const info = parseIfString(partnerInfo);

			return {
				partnerInfo: {
					id: appId,
					largeLogo: presentation.largeLogo,
					smallLogo: presentation.smallLogo,
					name: info.subject,
					displayName: presentation.name,
					disclaimer: presentation.disclaimer,
					buttonText: presentation.buttonText
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
			id: null,
			largeLogo: null,
			smallLogo: null,
			name: 'live edge',
			displayName: 'Firmly',
			disclaimer: null,
			buttonText: 'Place Order'
		}
	};
}
