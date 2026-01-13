/**
 * Load all destinations with their configurations for the admin list view.
 */
export async function load({ platform }) {
	const configDb = platform?.env?.firmlyConfigs;

	if (!configDb) {
		return { destinations: [] };
	}

	// Fetch all destinations from app_identifiers
	const { results: appIdentifiers } = await configDb
		.prepare('SELECT key, info FROM app_identifiers')
		.all();

	// Fetch destination configs from domains_partner
	const { results: partnerConfigs } = await configDb
		.prepare('SELECT key, info FROM domains_partner')
		.all();

	// Build partner config map
	const partnerMap = new Map();
	for (const row of partnerConfigs || []) {
		try {
			const info = JSON.parse(row.info);
			partnerMap.set(row.key, info);
		} catch {
			continue;
		}
	}

	// Collect all unique categories for the combobox
	const customCategories = new Set();

	// Map destinations with all config fields
	const destinations = (appIdentifiers || []).map((row) => {
		let info = {};
		try {
			info = JSON.parse(row.info || '{}');
		} catch {
			// Use defaults
		}

		// Collect category if present
		if (info.category && typeof info.category === 'string') {
			customCategories.add(info.category);
		}

		const partner = partnerMap.get(row.key) || {};

		return {
			appId: row.key,
			displayName: info.display_name || info.subject || row.key,
			subject: info.subject || row.key,
			category: info.category || '',
			isSystem: info.isSystem === true,
			isComingSoon: info.isComingSoon === true,
			restrictMerchantAccess: partner.restrictMerchantAccess === true,
			partnerTokenExpiration: info.partnerTokenExpiration || 3600,
			disableOrderSaving: info.disableOrderSaving === true
		};
	});

	// Sort by display name
	destinations.sort((a, b) => a.displayName.localeCompare(b.displayName));

	return { destinations, allCategories: [...customCategories] };
}
