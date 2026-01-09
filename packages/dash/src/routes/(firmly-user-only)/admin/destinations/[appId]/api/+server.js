import { json } from '@sveltejs/kit';

/**
 * PATCH /admin/destinations/[appId]/api
 * Update destination configuration in firmlyConfigs D1.
 */
export async function PATCH({ params, platform, request }) {
	const { appId } = params;
	const configDb = platform?.env?.firmlyConfigs;

	if (!configDb) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
		const body = await request.json();
		const {
			display_name,
			isSystem,
			isComingSoon,
			partnerTokenExpiration,
			disableOrderSaving,
			restrictMerchantAccess
		} = body;

		// Validate token expiration (allow up to 3 months = 7776000 seconds)
		if (partnerTokenExpiration !== undefined) {
			const tokenVal = parseInt(partnerTokenExpiration, 10);
			if (isNaN(tokenVal) || tokenVal < 60 || tokenVal > 7776000) {
				return json(
					{ error: 'Token expiration must be between 60 and 7776000 seconds (90 days)' },
					{ status: 400 }
				);
			}
		}

		// Validate display_name length
		if (display_name !== undefined && display_name.length > 100) {
			return json({ error: 'Display name must not exceed 100 characters' }, { status: 400 });
		}

		// Fetch current app_identifiers info
		const destRow = await configDb
			.prepare('SELECT info FROM app_identifiers WHERE key = ?')
			.bind(appId)
			.first();

		if (!destRow) {
			return json({ error: 'Destination not found' }, { status: 404 });
		}

		let currentInfo = {};
		try {
			currentInfo = JSON.parse(destRow.info || '{}');
		} catch {
			// Use empty object
		}

		// Update app_identifiers fields
		const updatedInfo = {
			...currentInfo
		};

		if (display_name !== undefined) {
			if (display_name.trim() === '') {
				// Remove display_name if empty (fall back to subject)
				delete updatedInfo.display_name;
			} else {
				updatedInfo.display_name = display_name.trim();
			}
		}

		if (isSystem !== undefined) {
			updatedInfo.isSystem = isSystem === true;
		}

		if (isComingSoon !== undefined) {
			updatedInfo.isComingSoon = isComingSoon === true;
		}

		if (partnerTokenExpiration !== undefined) {
			updatedInfo.partnerTokenExpiration = parseInt(partnerTokenExpiration, 10);
		}

		if (disableOrderSaving !== undefined) {
			updatedInfo.disableOrderSaving = disableOrderSaving === true;
		}

		// Update app_identifiers
		await configDb
			.prepare('UPDATE app_identifiers SET info = ? WHERE key = ?')
			.bind(JSON.stringify(updatedInfo), appId)
			.run();

		// Update domains_partner if restrictMerchantAccess changed
		if (restrictMerchantAccess !== undefined) {
			const partnerRow = await configDb
				.prepare('SELECT info FROM domains_partner WHERE key = ?')
				.bind(appId)
				.first();

			let partnerInfo = {};
			if (partnerRow) {
				try {
					partnerInfo = JSON.parse(partnerRow.info || '{}');
				} catch {
					// Use empty object
				}
			}

			partnerInfo.restrictMerchantAccess = restrictMerchantAccess === true;

			await configDb
				.prepare(
					`INSERT INTO domains_partner (key, info) VALUES (?, ?)
					 ON CONFLICT(key) DO UPDATE SET info = excluded.info`
				)
				.bind(appId, JSON.stringify(partnerInfo))
				.run();
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error updating destination:', error);
		return json({ error: 'Failed to update destination' }, { status: 500 });
	}
}
