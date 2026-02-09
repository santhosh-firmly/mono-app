import { accessData } from 'foundation/data-management/data-accessor.js';
import { getLogger } from 'foundation/utils/log.js';

/**
 * Gets partner presentation from database with default fallback
 * @param {string} appId - The app ID to fetch configuration for
 * @param {Object} env - Environment with D1 database bindings
 * @returns {Promise<Object>} - Partner information object with default fallback
 */
export async function getPartnerPresentation(appId, env) {
	if (!appId || !env?.firmlyConfigs) {
		getLogger('Partner Config Error').error('Missing appId or D1 database binding');
		return getDefaultPartnerPresentation();
	}

	const context = {
		env: { DATA_ACCESS_STRATEGY: 'd1', firmlyConfigs: env.firmlyConfigs }
	};

	const parseIfString = (data) => (typeof data === 'string' ? JSON.parse(data) : data);

	try {
		const partnerPresentation = await accessData(context, 'partner_presentation', appId);

		if (partnerPresentation) {
			const presentation = parseIfString(partnerPresentation);

			return {
				partnerPresentation: {
					id: appId,
					largeLogo: presentation.largeLogo,
					smallLogo: presentation.smallLogo,
					displayName: presentation.name,
					disclaimer: presentation.disclaimer,
					buttonText: presentation.buttonText,
					termsOfUse: presentation.termsOfUse || null,
					privacyPolicy: presentation.privacyPolicy || null
				}
			};
		}
	} catch (error) {
		getLogger('Partner Config Error').error('Error fetching partner config:', error);
	}

	return getDefaultPartnerPresentation();
}

function getDefaultPartnerPresentation() {
	return {
		partnerPresentation: {
			id: null,
			largeLogo: null,
			smallLogo: null,
			displayName: 'Firmly',
			disclaimer: null,
			buttonText: 'Place Order',
			termsOfUse: null,
			privacyPolicy: null
		}
	};
}
