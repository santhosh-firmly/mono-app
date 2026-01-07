import { error } from '@sveltejs/kit';

/**
 * Load function for merchant general settings page.
 * Loads merchant display_name, presentation settings, and company/contact info.
 */
export async function load({ params, platform, parent }) {
	const { domain } = params;
	const { userRole, isFirmlyAdmin } = await parent();

	// Only owners and Firmly admins can access settings
	// (viewers and editors can see but not edit)

	try {
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		const dashUsers = platform?.env?.dashUsers;
		if (!firmlyConfigs) {
			throw error(500, 'Database not configured');
		}

		// Fetch store data
		const store = await firmlyConfigs
			.prepare('SELECT * FROM stores WHERE key = ?')
			.bind(domain)
			.first();

		if (!store) {
			throw error(404, 'Merchant not found');
		}

		// Parse store info
		let storeInfo = {};
		try {
			storeInfo = JSON.parse(store.info || '{}');
		} catch {
			storeInfo = {};
		}

		// Fetch presentation data (may not exist)
		let presentation = {};
		try {
			const presentationRow = await firmlyConfigs
				.prepare('SELECT info FROM merchant_presentation WHERE key = ?')
				.bind(domain)
				.first();

			if (presentationRow?.info) {
				presentation = JSON.parse(presentationRow.info);
			}
		} catch (e) {
			// Table may not exist or no data - use empty presentation
			console.warn('Could not load presentation data:', e.message);
		}

		// Fetch company/contact info from merchant_dashboards
		let companyInfo = { company: {}, contact: {} };
		try {
			if (dashUsers) {
				const dashboardRow = await dashUsers
					.prepare('SELECT info FROM merchant_dashboards WHERE domain = ?')
					.bind(domain)
					.first();

				if (dashboardRow?.info) {
					companyInfo = JSON.parse(dashboardRow.info);
				}
			}
		} catch (e) {
			// No company info yet - use empty defaults
			console.warn('Could not load company info:', e.message);
		}

		// Determine if user can edit (owner or Firmly admin)
		const canEdit = isFirmlyAdmin || userRole === 'owner';

		return {
			merchant: {
				displayName: storeInfo.display_name || domain,
				presentation: {
					theme: presentation.theme || {
						colors: {
							primary: '#ffffff',
							action: '#000000'
						},
						largeLogo: ''
					},
					privacyPolicy: presentation.privacyPolicy || '',
					termsOfUse: presentation.termsOfUse || ''
				},
				company: companyInfo.company || {},
				contact: companyInfo.contact || {}
			},
			canEdit
		};
	} catch (e) {
		if (e.status) throw e;
		console.error('Error loading merchant settings:', e);
		throw error(500, 'Failed to load merchant settings');
	}
}
