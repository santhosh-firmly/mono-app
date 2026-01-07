import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { createAuditLog, AuditEventTypes } from '$lib/server/merchant.js';

/**
 * POST /merchant/[domain]/settings/api
 * Save merchant general settings (display name and presentation).
 * Only accessible by owners and Firmly admins.
 */
export async function POST({ locals, params, platform, request }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Authorization check
		let userRole = null;

		if (!isFirmlyAdmin) {
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const access = merchantAccess.find((a) => a.merchant_domain === domain);

			if (!access) {
				return json({ error: 'Access denied' }, { status: 403 });
			}

			userRole = access.role;

			// Only owners can edit settings
			if (userRole !== 'owner') {
				return json({ error: 'Only owners can modify settings' }, { status: 403 });
			}
		}

		// Parse request body
		const { displayName, presentation, company, contact } = await request.json();

		if (!displayName || typeof displayName !== 'string') {
			return json({ error: 'Display name is required' }, { status: 400 });
		}

		const firmlyConfigs = platform?.env?.firmlyConfigs;
		const dashUsers = platform?.env?.dashUsers;
		if (!firmlyConfigs) {
			return json({ error: 'Database not configured' }, { status: 500 });
		}

		// Fetch current store data
		const store = await firmlyConfigs
			.prepare('SELECT * FROM stores WHERE key = ?')
			.bind(domain)
			.first();

		if (!store) {
			return json({ error: 'Merchant not found' }, { status: 404 });
		}

		// Parse current store info
		let storeInfo = {};
		try {
			storeInfo = JSON.parse(store.info || '{}');
		} catch {
			storeInfo = {};
		}

		// Track what changed for audit log
		const changes = {};
		const oldDisplayName = storeInfo.display_name;

		// Update display name
		if (displayName !== oldDisplayName) {
			changes.displayName = { from: oldDisplayName, to: displayName };
			storeInfo.display_name = displayName;
		}

		// Update store info in D1
		await firmlyConfigs
			.prepare('UPDATE stores SET info = ? WHERE key = ?')
			.bind(JSON.stringify(storeInfo), domain)
			.run();

		// Fetch current presentation data
		let currentPresentation = {};
		try {
			const presentationRow = await firmlyConfigs
				.prepare('SELECT info FROM merchant_presentation WHERE key = ?')
				.bind(domain)
				.first();

			if (presentationRow?.info) {
				currentPresentation = JSON.parse(presentationRow.info);
			}
		} catch {
			// Table may not exist or no data
		}

		// Track presentation changes
		if (presentation) {
			const newTheme = presentation.theme || {};
			const oldTheme = currentPresentation.theme || {};

			// Check color changes
			if (newTheme.colors?.primary !== oldTheme.colors?.primary) {
				changes.primaryColor = {
					from: oldTheme.colors?.primary,
					to: newTheme.colors?.primary
				};
			}
			if (newTheme.colors?.action !== oldTheme.colors?.action) {
				changes.actionColor = {
					from: oldTheme.colors?.action,
					to: newTheme.colors?.action
				};
			}

			// Check logo change
			if (newTheme.largeLogo !== oldTheme.largeLogo) {
				changes.logo = { changed: true };
			}

			// Check legal links
			if (presentation.privacyPolicy !== currentPresentation.privacyPolicy) {
				changes.privacyPolicy = {
					from: currentPresentation.privacyPolicy,
					to: presentation.privacyPolicy
				};
			}
			if (presentation.termsOfUse !== currentPresentation.termsOfUse) {
				changes.termsOfUse = {
					from: currentPresentation.termsOfUse,
					to: presentation.termsOfUse
				};
			}

			// Build new presentation object
			const newPresentation = {
				...currentPresentation,
				theme: {
					...currentPresentation.theme,
					colors: {
						primary: newTheme.colors?.primary || '#ffffff',
						action: newTheme.colors?.action || '#000000'
					},
					largeLogo: newTheme.largeLogo || ''
				},
				privacyPolicy: presentation.privacyPolicy || '',
				termsOfUse: presentation.termsOfUse || ''
			};

			// Upsert presentation data
			try {
				await firmlyConfigs
					.prepare(
						`INSERT INTO merchant_presentation (key, info)
						 VALUES (?, ?)
						 ON CONFLICT(key) DO UPDATE SET info = excluded.info`
					)
					.bind(domain, JSON.stringify(newPresentation))
					.run();
			} catch (e) {
				// If table doesn't exist, try to create it first
				if (e.message?.includes('no such table')) {
					console.warn(
						'merchant_presentation table does not exist, skipping presentation update'
					);
				} else {
					throw e;
				}
			}
		}

		// Save company/contact info to merchant_dashboards
		if (dashUsers && (company || contact)) {
			try {
				// Fetch current company/contact info
				let currentInfo = {};
				const dashboardRow = await dashUsers
					.prepare('SELECT info FROM merchant_dashboards WHERE domain = ?')
					.bind(domain)
					.first();

				if (dashboardRow?.info) {
					currentInfo = JSON.parse(dashboardRow.info);
				}

				// Track company changes
				if (company) {
					const oldCompany = currentInfo.company || {};
					if (company.name !== oldCompany.name) {
						changes.companyName = { from: oldCompany.name, to: company.name };
					}
					if (company.employeeCount !== oldCompany.employeeCount) {
						changes.employeeCount = {
							from: oldCompany.employeeCount,
							to: company.employeeCount
						};
					}
					if (company.annualRevenue !== oldCompany.annualRevenue) {
						changes.annualRevenue = {
							from: oldCompany.annualRevenue,
							to: company.annualRevenue
						};
					}
				}

				// Track contact changes
				if (contact) {
					const oldContact = currentInfo.contact || {};
					if (contact.name !== oldContact.name) {
						changes.contactName = { from: oldContact.name, to: contact.name };
					}
					if (contact.email !== oldContact.email) {
						changes.contactEmail = { from: oldContact.email, to: contact.email };
					}
					if (contact.phone !== oldContact.phone) {
						changes.contactPhone = { from: oldContact.phone, to: contact.phone };
					}
				}

				// Build new info object
				const newInfo = {
					...currentInfo,
					company: company || currentInfo.company || {},
					contact: contact || currentInfo.contact || {}
				};

				// Upsert into merchant_dashboards
				await dashUsers
					.prepare(`UPDATE merchant_dashboards SET info = ? WHERE domain = ?`)
					.bind(JSON.stringify(newInfo), domain)
					.run();
			} catch (e) {
				console.warn('Could not save company/contact info:', e.message);
			}
		}

		// Create audit log if there were changes
		if (Object.keys(changes).length > 0) {
			await createAuditLog({
				platform,
				merchantDomain: domain,
				eventType: AuditEventTypes.SETTINGS_UPDATED,
				actorId: userId,
				actorEmail: email,
				details: {
					section: 'general',
					changes
				},
				isFirmlyAdmin,
				actorType: isFirmlyAdmin ? 'firmly_admin' : userRole
			});
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error saving merchant settings:', error);
		return json({ error: 'Failed to save settings' }, { status: 500 });
	}
}
