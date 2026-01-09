import { error } from '@sveltejs/kit';
import {
	checkIntegrationComplete,
	checkDestinationsConfigured,
	checkCatalogConfigured,
	checkCDNWhitelistingComplete,
	getMerchantAgreement
} from '$lib/server/merchant.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const { domain } = params;

	// Fetch store data and onboarding status in parallel
	const [
		store,
		integrationComplete,
		destinationsConfigured,
		catalogConfigured,
		cdnWhitelistingComplete,
		agreementData
	] = await Promise.all([
		platform.env.firmlyConfigs
			.prepare(`SELECT * FROM stores WHERE key = ?`)
			.bind(domain)
			.first(),
		checkIntegrationComplete({ platform, merchantDomain: domain }),
		checkDestinationsConfigured({ platform, merchantDomain: domain }),
		checkCatalogConfigured({ platform, merchantDomain: domain }),
		checkCDNWhitelistingComplete({ platform, merchantDomain: domain }),
		getMerchantAgreement({ platform, merchantDomain: domain })
	]);

	if (!store) {
		throw error(404, 'Merchant not found');
	}

	// Try to fetch presentation data (table may not exist in all environments)
	let presentation = null;
	try {
		presentation = await platform.env.firmlyConfigs
			.prepare(`SELECT info FROM merchant_presentation WHERE key = ?`)
			.bind(domain)
			.first();
	} catch (e) {
		// Table doesn't exist or other error - use empty presentation
		console.warn('merchant_presentation table not available:', e.message);
	}

	const merchant = {
		...JSON.parse(store.info),
		presentation: presentation?.info ? JSON.parse(presentation.info) : {}
	};

	// Build onboarding progress object (same format as merchant layout)
	const onboardingProgress = {
		integration: integrationComplete ? 'completed' : 'in-progress',
		agreement: agreementData.signed ? 'completed' : 'pending',
		destinations: destinationsConfigured ? 'completed' : 'pending',
		catalog: catalogConfigured ? 'completed' : 'pending',
		cdn: cdnWhitelistingComplete ? 'completed' : 'pending'
	};

	return {
		merchant,
		domain,
		integrationComplete,
		onboardingProgress
	};
}
