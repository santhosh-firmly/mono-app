/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	const db = platform?.env?.dashUsers;
	const configDb = platform?.env?.firmlyConfigs;
	const kv = platform?.env?.OTP_STORE;

	if (!db || !configDb) {
		return { dashboards: [], error: 'Database not configured' };
	}

	try {
		// Get all merchants from stores table
		const { results: merchants } = await configDb.prepare('SELECT key, info FROM stores').all();

		// Get existing dashboard metadata
		const { results: dashboardMeta } = await db
			.prepare(
				`SELECT domain, created_at, created_by, owner_user_id, status, notes, info
				 FROM merchant_dashboards`
			)
			.all();

		// Create a map for quick lookup
		const dashboardMap = new Map((dashboardMeta || []).map((d) => [d.domain, d]));

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
				// Dashboard-specific fields from merchant_dashboards (if exists)
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

		// Sort by status (active first, then pending, then not_configured) and then by domain
		dashboards.sort((a, b) => {
			const statusOrder = { active: 0, pending: 1, not_configured: 2 };
			const aOrder = statusOrder[a.status] ?? 3;
			const bOrder = statusOrder[b.status] ?? 3;
			if (aOrder !== bOrder) return aOrder - bOrder;
			return a.domain.localeCompare(b.domain);
		});

		// Check for pending invites for each dashboard
		const dashboardsWithInviteStatus = await Promise.all(
			dashboards.map(async (dashboard) => {
				let pendingInvite = null;

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
					pendingInvite
				};
			})
		);

		return { dashboards: dashboardsWithInviteStatus };
	} catch (error) {
		console.error('Error fetching dashboards:', error);
		return { dashboards: [], error: 'Failed to fetch dashboards' };
	}
}
