import { json } from '@sveltejs/kit';
import { getDestinationAccess, updateDestinationProfile } from '$lib/server/destination.js';

/**
 * POST /destination/[app_id]/settings/api
 * Update destination profile settings.
 */
export async function POST({ locals, params, platform, request }) {
	const { session } = locals;
	const { app_id: appId } = params;

	try {
		// Verify user has access to this destination (unless Firmly admin)
		let userRole = null;
		if (!session?.isFirmlyAdmin) {
			const access = await getDestinationAccess({ platform, userId: session.userId });
			const userAccess = access.find((a) => a.app_id === appId);
			if (!userAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
			userRole = userAccess.role;

			// Only owners can edit settings
			if (userRole !== 'owner') {
				return json({ error: 'Only owners can edit settings' }, { status: 403 });
			}
		}

		const body = await request.json();
		const { display_name, domain, company, contact } = body;

		// Handle display_name update to app_identifiers
		if (typeof display_name === 'string') {
			const firmlyConfigs = platform?.env?.firmlyConfigs;
			if (firmlyConfigs) {
				// Validate display_name length
				if (display_name.length > 100) {
					return json(
						{ error: 'Display name must not exceed 100 characters' },
						{ status: 400 }
					);
				}

				// Fetch current info
				const destRow = await firmlyConfigs
					.prepare('SELECT info FROM app_identifiers WHERE key = ?')
					.bind(appId)
					.first();

				if (destRow) {
					let info = {};
					try {
						info = JSON.parse(destRow.info || '{}');
					} catch {
						info = {};
					}

					// Update display_name
					if (display_name.trim() === '') {
						delete info.display_name;
					} else {
						info.display_name = display_name.trim();
					}

					await firmlyConfigs
						.prepare('UPDATE app_identifiers SET info = ? WHERE key = ?')
						.bind(JSON.stringify(info), appId)
						.run();
				}
			}
		}

		// Build profile update
		const profile = {};

		if (typeof domain === 'string') {
			profile.domain = domain;
		}

		if (company) {
			profile.company = {
				name: company.name || '',
				address: {
					street: company.address?.street || '',
					city: company.address?.city || '',
					state: company.address?.state || '',
					postalCode: company.address?.postalCode || '',
					country: company.address?.country || ''
				}
			};
		}

		if (contact) {
			profile.contact = {
				name: contact.name || '',
				email: contact.email || '',
				phone: contact.phone || ''
			};
		}

		// Update profile
		await updateDestinationProfile({
			platform,
			appId,
			profile,
			actor: {
				id: session.userId,
				email: session.email,
				isFirmlyAdmin: session.isFirmlyAdmin || false,
				role: userRole
			}
		});

		return json({ success: true });
	} catch (error) {
		console.error('Error saving destination settings:', error);
		return json({ error: 'Failed to save settings' }, { status: 500 });
	}
}
