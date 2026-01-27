import { colord } from 'colord';

/**
 * @typedef {Object} MerchantTheme
 * @property {string} [largeLogo] - URL for large logo display
 * @property {string} [smallLogo] - URL for small logo display
 * @property {Object} [colors] - Theme color configuration
 * @property {string} [colors.primary] - Primary brand color
 * @property {string} [colors.action] - Action button color
 */

/**
 * @typedef {Object} MerchantPresentation
 * @property {MerchantTheme} [theme] - Visual theme configuration
 * @property {string} [termsOfUse] - URL to terms of use page
 * @property {string} [privacyPolicy] - URL to privacy policy page
 */

/**
 * Merchant state managing branding and visual presentation.
 * Handles merchant logos, theme colors, and legal page URLs
 * for customizing the checkout experience.
 *
 * @property {string|null} primaryColor - Primary brand color hex value
 * @property {string|null} actionColor - Action button color hex value
 * @property {string|null} largeLogo - URL for large logo display
 * @property {string|null} smallLogo - URL for small logo display
 * @property {string|null} termsOfUse - URL to terms of use page
 * @property {string|null} privacyPolicy - URL to privacy policy page
 * @property {boolean} isPrimaryDark - Derived: whether primary color is dark
 * @property {boolean} isActionDark - Derived: whether action color is dark
 *
 * @method initialize - Initializes merchant data from presentation config
 * @method reset - Resets all merchant properties to null
 */
class Merchant {
	primaryColor = $state(null);
	actionColor = $state(null);
	largeLogo = $state(null);
	smallLogo = $state(null);
	termsOfUse = $state(null);
	privacyPolicy = $state(null);

	isPrimaryDark = $derived(this.primaryColor ? colord(this.primaryColor).isDark() : false);
	isActionDark = $derived(this.actionColor ? colord(this.actionColor).isDark() : false);

	initialize(merchantPresentation) {
		if (!merchantPresentation) return;

		const { theme, termsOfUse, privacyPolicy } = merchantPresentation;

		this.termsOfUse = termsOfUse || null;
		this.privacyPolicy = privacyPolicy || null;

		if (!theme) return;

		this.largeLogo = theme.largeLogo || null;
		this.smallLogo = theme.smallLogo || null;

		const colors = theme.colors;
		if (!colors) return;

		this.primaryColor = colors.primary || null;
		this.actionColor = colors.action || this.primaryColor;
	}

	reset() {
		this.primaryColor = null;
		this.actionColor = null;
		this.largeLogo = null;
		this.smallLogo = null;
		this.termsOfUse = null;
		this.privacyPolicy = null;
	}
}

let instance = null;

export function initializeMerchant(merchantPresentation) {
	instance = new Merchant();
	instance.initialize(merchantPresentation);
	return instance;
}

export function getMerchant() {
	if (!instance) throw new Error('Merchant not initialized');
	return instance;
}

export function resetMerchant() {
	if (instance) {
		instance.reset();
	}
	instance = null;
}
