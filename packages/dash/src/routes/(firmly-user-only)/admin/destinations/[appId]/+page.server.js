import { error } from '@sveltejs/kit';

/**
 * Load single destination details for editing.
 */
export async function load({ params, platform }) {
	const { appId } = params;
	const configDb = platform?.env?.firmlyConfigs;

	if (!configDb) {
		throw error(500, 'Database not configured');
	}

	// Fetch destination from app_identifiers
	const destRow = await configDb
		.prepare('SELECT key, info FROM app_identifiers WHERE key = ?')
		.bind(appId)
		.first();

	if (!destRow) {
		throw error(404, 'Destination not found');
	}

	// Fetch partner config
	const partnerRow = await configDb
		.prepare('SELECT key, info FROM domains_partner WHERE key = ?')
		.bind(appId)
		.first();

	let info = {};
	try {
		info = JSON.parse(destRow.info || '{}');
	} catch {
		// Use defaults
	}

	let partner = {};
	if (partnerRow) {
		try {
			partner = JSON.parse(partnerRow.info || '{}');
		} catch {
			// Use defaults
		}
	}

	return {
		destination: {
			appId,
			displayName: info.display_name || '',
			subject: info.subject || appId,
			clientId: info.clientId || appId,
			isSystem: info.isSystem === true,
			isComingSoon: info.isComingSoon === true,
			restrictMerchantAccess: partner.restrictMerchantAccess === true,
			partnerTokenExpiration: info.partnerTokenExpiration || 3600,
			disableOrderSaving: info.disableOrderSaving === true
		}
	};
}
