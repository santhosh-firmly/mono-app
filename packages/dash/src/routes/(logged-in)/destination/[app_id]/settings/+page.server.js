import { error } from '@sveltejs/kit';
import { getDestinationProfile } from '$lib/server/destination.js';

/**
 * Load function for destination settings page.
 * Loads destination display name, domain field, and profile settings.
 */
export async function load({ params, platform, parent }) {
	const { app_id: appId } = params;
	const { userRole, isFirmlyAdmin } = await parent();

	try {
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		if (!firmlyConfigs) {
			throw error(500, 'Database not configured');
		}

		// Fetch destination info from app_identifiers
		const destRow = await firmlyConfigs
			.prepare('SELECT key, info FROM app_identifiers WHERE key = ?')
			.bind(appId)
			.first();

		if (!destRow) {
			throw error(404, 'Destination not found');
		}

		// Parse destination info
		let destInfo = {};
		try {
			destInfo = JSON.parse(destRow.info || '{}');
		} catch {
			destInfo = {};
		}

		// Fetch destination profile from DO (may not exist yet)
		const profile = await getDestinationProfile({ platform, appId });

		// Determine if user can edit (owner or Firmly admin)
		const canEdit = isFirmlyAdmin || userRole === 'owner';

		return {
			destination: {
				appId,
				displayName: destInfo.display_name || '',
				subject: destInfo.subject || appId,
				domain: profile.domain || '',
				company: profile.company || {},
				contact: profile.contact || {}
			},
			canEdit
		};
	} catch (e) {
		if (e.status) throw e;
		console.error('Error loading destination settings:', e);
		throw error(500, 'Failed to load destination settings');
	}
}
