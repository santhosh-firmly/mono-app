import { getOnboardingStatusAll } from '$lib/server/merchant.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	const db = platform?.env?.dashUsers;
	const configDb = platform?.env?.firmlyConfigs;
	const kv = platform?.env?.OTP_STORE;

	if (!db || !configDb) {
		return { dashboards: [], destinations: [], error: 'Database not configured' };
	}

	try {
		// ============================================================
		// MERCHANT DASHBOARDS
		// ============================================================

		// Get all merchants from stores table
		const { results: merchants } = await configDb.prepare('SELECT key, info FROM stores').all();

		// Get existing dashboard metadata (including KYB and Go Live fields)
		const { results: dashboardMeta } = await db
			.prepare(
				`SELECT domain, created_at, created_by, owner_user_id, status, notes, info,
				        kyb_status, kyb_submitted_at, kyb_reviewed_at, kyb_reviewed_by, kyb_rejection_notes,
				        go_live_status, go_live_submitted_at, go_live_reviewed_at, go_live_reviewed_by, go_live_rejection_notes
				 FROM merchant_dashboards`
			)
			.all();

		// Create maps for quick lookup
		const dashboardMap = new Map((dashboardMeta || []).map((d) => [d.domain, d]));
		const storesMap = new Map((merchants || []).map((m) => [m.key, m]));

		// Merge: all merchants get a dashboard entry
		const dashboards = (merchants || []).map((m) => {
			const storeInfo = JSON.parse(m.info);
			const meta = dashboardMap.get(m.key) || {};

			// Parse dashboard info (company/contact)
			let dashboardInfo = {};
			if (meta.info) {
				try {
					dashboardInfo = JSON.parse(meta.info);
				} catch {
					dashboardInfo = {};
				}
			}

			return {
				domain: m.key,
				display_name: storeInfo.display_name,
				is_disabled: storeInfo.is_disabled || false,
				not_in_config: false,
				// Dashboard-specific fields from merchant_dashboards (if exists)
				owner_user_id: meta.owner_user_id || null,
				status: meta.status || 'not_configured',
				created_at: meta.created_at || null,
				notes: meta.notes || null,
				// Company/contact info from dashboard info
				contact: dashboardInfo.contact || null,
				company: dashboardInfo.company || null,
				// KYB fields
				kyb_status: meta.kyb_status || null,
				kyb_submitted_at: meta.kyb_submitted_at || null,
				kyb_reviewed_at: meta.kyb_reviewed_at || null,
				kyb_reviewed_by: meta.kyb_reviewed_by || null,
				kyb_rejection_notes: meta.kyb_rejection_notes || null,
				// Go Live fields
				go_live_status: meta.go_live_status || null,
				go_live_submitted_at: meta.go_live_submitted_at || null,
				go_live_reviewed_at: meta.go_live_reviewed_at || null,
				go_live_reviewed_by: meta.go_live_reviewed_by || null,
				go_live_rejection_notes: meta.go_live_rejection_notes || null,
				pendingInvite: null // Will be populated below
			};
		});

		// Add dashboards that exist in merchant_dashboards but not in stores (orphaned dashboards)
		for (const meta of dashboardMeta || []) {
			if (!storesMap.has(meta.domain)) {
				// Parse dashboard info (company/contact)
				let dashboardInfo = {};
				if (meta.info) {
					try {
						dashboardInfo = JSON.parse(meta.info);
					} catch {
						dashboardInfo = {};
					}
				}

				dashboards.push({
					domain: meta.domain,
					display_name: null,
					is_disabled: false,
					not_in_config: true, // Flag to indicate this is not in firmlyConfigs
					// Dashboard-specific fields from merchant_dashboards
					owner_user_id: meta.owner_user_id || null,
					status: meta.status || 'pending',
					created_at: meta.created_at || null,
					notes: meta.notes || null,
					// Company/contact info from dashboard info
					contact: dashboardInfo.contact || null,
					company: dashboardInfo.company || null,
					// KYB fields
					kyb_status: meta.kyb_status || null,
					kyb_submitted_at: meta.kyb_submitted_at || null,
					kyb_reviewed_at: meta.kyb_reviewed_at || null,
					kyb_reviewed_by: meta.kyb_reviewed_by || null,
					kyb_rejection_notes: meta.kyb_rejection_notes || null,
					// Go Live fields
					go_live_status: meta.go_live_status || null,
					go_live_submitted_at: meta.go_live_submitted_at || null,
					go_live_reviewed_at: meta.go_live_reviewed_at || null,
					go_live_reviewed_by: meta.go_live_reviewed_by || null,
					go_live_rejection_notes: meta.go_live_rejection_notes || null,
					pendingInvite: null // Will be populated below
				});
			}
		}

		// Sort by status (active first, then pending, then not_configured) and then by domain
		dashboards.sort((a, b) => {
			const statusOrder = { active: 0, pending: 1, not_configured: 2 };
			const aOrder = statusOrder[a.status] ?? 3;
			const bOrder = statusOrder[b.status] ?? 3;
			if (aOrder !== bOrder) return aOrder - bOrder;
			return a.domain.localeCompare(b.domain);
		});

		// Check for pending invites and onboarding status for each merchant dashboard
		const dashboardsWithInviteStatus = await Promise.all(
			dashboards.map(async (dashboard) => {
				let pendingInvite = null;

				// Get all onboarding statuses in a single call (reduces 5 DO calls to 1)
				const onboardingStatus = await getOnboardingStatusAll({
					platform,
					merchantDomain: dashboard.domain
				});

				if (kv && !dashboard.owner_user_id) {
					// Only check for pending invites if no owner has accepted yet
					const token = await kv.get(`invite-domain:${dashboard.domain}`);
					if (token) {
						const inviteData = await kv.get(`invite:${token}`);
						if (inviteData) {
							const invite = JSON.parse(inviteData);
							pendingInvite = {
								email: invite.email,
								role: invite.role,
								expiresAt: invite.expiresAt,
								invitedByEmail: invite.invitedByEmail
							};
						}
					}
				}

				return {
					...dashboard,
					pendingInvite,
					integration_complete: onboardingStatus.integrationComplete,
					agreement_signed: onboardingStatus.agreementSigned,
					destinations_configured: onboardingStatus.destinationsConfigured,
					catalog_configured: onboardingStatus.catalogConfigured,
					cdn_whitelisting_complete: onboardingStatus.cdnWhitelistingComplete
				};
			})
		);

		// ============================================================
		// DESTINATION DASHBOARDS
		// ============================================================

		// Get all destinations from app_identifiers table
		const { results: appIdentifiers } = await configDb
			.prepare('SELECT key, info FROM app_identifiers')
			.all();

		// Get existing destination dashboard metadata
		const { results: destDashboardMeta } = await db
			.prepare(
				`SELECT app_id, created_at, created_by, owner_user_id, status, notes, info
				 FROM destination_dashboards`
			)
			.all();

		// Create a map for quick lookup
		const destDashboardMap = new Map((destDashboardMeta || []).map((d) => [d.app_id, d]));

		// Merge: all destinations get a dashboard entry
		const destinations = (appIdentifiers || []).map((d) => {
			let destInfo = {};
			try {
				destInfo = JSON.parse(d.info || '{}');
			} catch {
				destInfo = {};
			}

			const meta = destDashboardMap.get(d.key) || {};

			// Parse dashboard info (company/contact)
			let dashboardInfo = {};
			if (meta.info) {
				try {
					dashboardInfo = JSON.parse(meta.info);
				} catch {
					dashboardInfo = {};
				}
			}

			return {
				appId: d.key,
				displayName: destInfo.subject || d.key,
				// Dashboard-specific fields from destination_dashboards (if exists)
				owner_user_id: meta.owner_user_id || null,
				status: meta.status || 'not_configured',
				created_at: meta.created_at || null,
				notes: meta.notes || null,
				// Company/contact info from dashboard info
				contact: dashboardInfo.contact || null,
				company: dashboardInfo.company || null,
				pendingInvite: null // Will be populated below
			};
		});

		// Sort by status (active first, then pending, then not_configured) and then by appId
		destinations.sort((a, b) => {
			const statusOrder = { active: 0, pending: 1, not_configured: 2 };
			const aOrder = statusOrder[a.status] ?? 3;
			const bOrder = statusOrder[b.status] ?? 3;
			if (aOrder !== bOrder) return aOrder - bOrder;
			return a.appId.localeCompare(b.appId);
		});

		// Check for pending invites for each destination dashboard
		const destinationsWithInviteStatus = await Promise.all(
			destinations.map(async (destination) => {
				let pendingInvite = null;

				if (kv && !destination.owner_user_id) {
					// Only check for pending invites if no owner has accepted yet
					const token = await kv.get(`invite-destination:${destination.appId}`);
					if (token) {
						const inviteData = await kv.get(`invite:${token}`);
						if (inviteData) {
							const invite = JSON.parse(inviteData);
							pendingInvite = {
								email: invite.email,
								role: invite.role,
								expiresAt: invite.expiresAt,
								invitedByEmail: invite.invitedByEmail
							};
						}
					}
				}

				return {
					...destination,
					pendingInvite
				};
			})
		);

		return {
			dashboards: dashboardsWithInviteStatus,
			destinations: destinationsWithInviteStatus
		};
	} catch (error) {
		console.error('Error fetching dashboards:', error);
		return { dashboards: [], destinations: [], error: 'Failed to fetch dashboards' };
	}
}
