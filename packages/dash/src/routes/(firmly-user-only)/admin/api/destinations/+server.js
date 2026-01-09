import { json } from '@sveltejs/kit';

/**
 * POST /admin/api/destinations
 * Create a new destination by inserting into app_identifiers and domains_partner tables.
 */
export async function POST({ request, platform, locals }) {
	const { authInfo } = locals;

	if (!authInfo?.oid || !authInfo?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const firmlyConfigs = platform?.env?.firmlyConfigs;

	if (!firmlyConfigs) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
		const { appId, subject, isComingSoon = false, isSystem = false } = await request.json();

		// Validate required fields
		if (!appId || !subject) {
			return json({ error: 'App ID and Subject are required' }, { status: 400 });
		}

		// Validate appId format (must be a valid UUID)
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(appId)) {
			return json({ error: 'App ID must be a valid UUID' }, { status: 400 });
		}

		// Check uniqueness
		const existing = await firmlyConfigs
			.prepare('SELECT key FROM app_identifiers WHERE key = ?')
			.bind(appId)
			.first();

		if (existing) {
			return json(
				{ error: 'A destination with this App ID already exists' },
				{ status: 409 }
			);
		}

		// Prepare info JSON for app_identifiers
		const appInfo = JSON.stringify({
			clientId: appId,
			subject: subject.trim(),
			isComingSoon: Boolean(isComingSoon),
			isSystem: Boolean(isSystem),
			partnerTokenExpiration: 3600,
			disableOrderSaving: false
		});

		// Prepare info JSON for domains_partner
		const partnerInfo = JSON.stringify({
			clientId: appId,
			subject: subject.trim(),
			merchants: {},
			restrictMerchantAccess: false
		});

		// Insert into app_identifiers
		await firmlyConfigs
			.prepare('INSERT INTO app_identifiers (key, info) VALUES (?, ?)')
			.bind(appId, appInfo)
			.run();

		// Insert into domains_partner
		await firmlyConfigs
			.prepare('INSERT INTO domains_partner (key, info) VALUES (?, ?)')
			.bind(appId, partnerInfo)
			.run();

		return json({
			success: true,
			destination: {
				appId,
				subject: subject.trim(),
				isComingSoon: Boolean(isComingSoon),
				isSystem: Boolean(isSystem)
			}
		});
	} catch (error) {
		console.error('Error creating destination:', error);
		return json({ error: 'Failed to create destination' }, { status: 500 });
	}
}
