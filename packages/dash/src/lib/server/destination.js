/**
 * Destination operations helper module.
 *
 * Provides a unified interface for working with DestinationDO via service binding.
 * Handles team membership, audit logs, profile management, and dual-write synchronization with DashUserDO.
 * Follows the same patterns as merchant.js for consistency.
 */

/**
 * Helper to make requests to the DestinationDO via dash-do service.
 * @param {Object} platform - SvelteKit platform object
 * @param {string} appId - Destination app_id (DO identifier)
 * @param {string} path - Request path (e.g., '/team')
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function fetchDestinationDO(platform, appId, path, options = {}) {
	const DASH_DO = platform?.env?.DASH_DO;
	if (!DASH_DO) {
		throw new Error('DASH_DO service binding not configured');
	}

	const headers = new Headers(options.headers || {});
	headers.set('X-Destination-AppId', appId);

	return DASH_DO.fetch(`https://dash-do${path}`, {
		...options,
		headers
	});
}

/**
 * Helper to make requests to the DashUserDO via dash-do service.
 * @param {Object} platform - SvelteKit platform object
 * @param {string} userId - User UUID
 * @param {string} path - Request path
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchDashUserDO(platform, userId, path, options = {}) {
	const DASH_DO = platform?.env?.DASH_DO;
	if (!DASH_DO) {
		throw new Error('DASH_DO service binding not configured');
	}

	const headers = new Headers(options.headers || {});
	headers.set('X-User-ID', userId);

	return DASH_DO.fetch(`https://dash-do${path}`, {
		...options,
		headers
	});
}

// ============================================================================
// Destination Access Functions (for user.js integration)
// ============================================================================

/**
 * Get destination access for a user.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @returns {Promise<Array>} List of destination access entries
 */
export async function getDestinationAccess({ platform, userId }) {
	try {
		const response = await fetchDashUserDO(platform, userId, '/destination-access');
		if (response.ok) {
			return response.json();
		}
		return [];
	} catch {
		return [];
	}
}

/**
 * Validate that a user has access to a specific destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<Object|null>} Access entry if valid, null otherwise
 */
export async function validateDestinationAccess({ platform, userId, appId }) {
	try {
		const access = await getDestinationAccess({ platform, userId });
		return access.find((a) => a.app_id === appId) || null;
	} catch {
		return null;
	}
}

/**
 * Grant destination access to a user.
 * Updates the user's DashUserDO destination_access list.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.userId - User UUID
 * @param {string} params.appId - Destination app_id
 * @param {string} params.role - Role (owner, editor, viewer)
 * @returns {Promise<boolean>} Success
 */
export async function grantDestinationAccess({ platform, userId, appId, role = 'owner' }) {
	try {
		await fetchDashUserDO(platform, userId, '/destination-access', {
			method: 'POST',
			body: JSON.stringify({ appId, role })
		});
		return true;
	} catch (error) {
		console.error('Error granting destination access:', error);
		return false;
	}
}

// ============================================================================
// Destination Profile Functions
// ============================================================================

/**
 * Get the destination profile.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<Object>} Profile data
 */
export async function getDestinationProfile({ platform, appId }) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/profile');
		if (response.ok) {
			return response.json();
		}
		return {};
	} catch (error) {
		console.error('Error getting destination profile:', error);
		return {};
	}
}

/**
 * Update the destination profile.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {Object} params.profile - Profile data to merge
 * @param {Object} params.actor - Actor info for audit log
 * @returns {Promise<Object>} Updated profile
 */
export async function updateDestinationProfile({ platform, appId, profile, actor }) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/profile', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(profile)
		});

		if (!response.ok) {
			throw new Error(`Failed to update profile: ${response.status}`);
		}

		const updated = await response.json();

		// Create audit log
		if (actor) {
			await createDestinationAuditLog({
				platform,
				appId,
				eventType: DestinationAuditEventTypes.PROFILE_UPDATED,
				actorId: actor.id,
				actorEmail: actor.email,
				details: { changedFields: Object.keys(profile) },
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return updated;
	} catch (error) {
		console.error('Error updating destination profile:', error);
		throw error;
	}
}

// ============================================================================
// Team Management Functions
// ============================================================================

/**
 * Get all team members for a destination from DestinationDO.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<Array>} List of team members
 */
export async function getDestinationTeam({ platform, appId }) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/team');
		if (!response.ok) {
			console.error('Failed to get destination team:', await response.text());
			return [];
		}
		return response.json();
	} catch (error) {
		console.error('Error getting destination team:', error);
		return [];
	}
}

/**
 * Add a team member to a destination.
 * Dual-writes to both DestinationDO (team list) and DashUserDO (user's access).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.userId - User UUID to add
 * @param {string} params.userEmail - User email
 * @param {string} params.role - Role (owner, editor, viewer)
 * @param {string} params.grantedBy - User ID who granted access
 * @param {Object} params.actor - Actor info for audit log
 * @returns {Promise<boolean>} Success
 */
export async function addDestinationTeamMember({
	platform,
	appId,
	userId,
	userEmail,
	role = 'viewer',
	grantedBy = null,
	actor = null
}) {
	try {
		// 1. Add to DestinationDO team table
		const teamResponse = await fetchDestinationDO(platform, appId, '/team', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, userEmail, role, grantedBy })
		});

		if (!teamResponse.ok) {
			console.error('Failed to add team member to DestinationDO:', await teamResponse.text());
			return false;
		}

		// 2. Add to user's DashUserDO destination_access
		const userResponse = await fetchDashUserDO(platform, userId, '/destination-access', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ appId, role })
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error('Failed to add destination access to DashUserDO:', errorText);

			// ROLLBACK: Remove from DestinationDO since DashUserDO write failed
			try {
				await fetchDestinationDO(platform, appId, `/team/${encodeURIComponent(userId)}`, {
					method: 'DELETE'
				});
				console.log('Rolled back DestinationDO team entry after DashUserDO failure');
			} catch (rollbackError) {
				console.error('Failed to rollback DestinationDO team entry:', rollbackError);
			}
			return false;
		}

		// 3. Create audit log if actor provided
		if (actor) {
			await createDestinationAuditLog({
				platform,
				appId,
				eventType: DestinationAuditEventTypes.INVITE_ACCEPTED,
				actorId: actor.id,
				actorEmail: actor.email,
				targetId: userId,
				targetEmail: userEmail,
				details: { role },
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return true;
	} catch (error) {
		console.error('Error adding destination team member:', error);
		return false;
	}
}

/**
 * Update a team member's role.
 * Dual-writes to both DestinationDO and DashUserDO.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.userId - User ID to update
 * @param {string} params.newRole - New role (owner, editor, viewer)
 * @param {string} params.oldRole - Previous role (for rollback)
 * @param {Object} params.actor - Actor info for audit log
 * @param {string} params.targetEmail - Target user's email (for audit log)
 * @returns {Promise<boolean>} Success
 */
export async function updateDestinationTeamMemberRole({
	platform,
	appId,
	userId,
	newRole,
	oldRole = null,
	actor = null,
	targetEmail = null
}) {
	try {
		// 1. Update in DestinationDO
		const teamResponse = await fetchDestinationDO(
			platform,
			appId,
			`/team/${encodeURIComponent(userId)}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole })
			}
		);

		if (!teamResponse.ok) {
			console.error('Failed to update role in DestinationDO:', await teamResponse.text());
			return false;
		}

		// 2. Update in user's DashUserDO
		const userResponse = await fetchDashUserDO(platform, userId, '/destination-access', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ appId, role: newRole })
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error('Failed to update role in DashUserDO:', errorText);

			// ROLLBACK: Restore old role in DestinationDO if we know it
			if (oldRole) {
				try {
					await fetchDestinationDO(
						platform,
						appId,
						`/team/${encodeURIComponent(userId)}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ role: oldRole })
						}
					);
					console.log('Rolled back DestinationDO role after DashUserDO failure');
				} catch (rollbackError) {
					console.error('Failed to rollback DestinationDO role:', rollbackError);
				}
			}
			return false;
		}

		// 3. Create audit log if actor provided
		if (actor) {
			await createDestinationAuditLog({
				platform,
				appId,
				eventType: DestinationAuditEventTypes.ROLE_CHANGED,
				actorId: actor.id,
				actorEmail: actor.email,
				targetId: userId,
				targetEmail,
				details: { oldRole, newRole },
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return true;
	} catch (error) {
		console.error('Error updating destination team member role:', error);
		return false;
	}
}

/**
 * Remove a team member from a destination.
 * Dual-writes to both DestinationDO and DashUserDO.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.userId - User ID to remove
 * @param {string} params.userEmail - User's email (for rollback and audit)
 * @param {string} params.role - User's role (for rollback)
 * @param {Object} params.actor - Actor info for audit log
 * @param {string} params.targetEmail - Target user's email (for audit log)
 * @returns {Promise<boolean>} Success
 */
export async function removeDestinationTeamMember({
	platform,
	appId,
	userId,
	userEmail = null,
	role = null,
	actor = null,
	targetEmail = null
}) {
	try {
		// 1. Remove from DestinationDO
		const teamResponse = await fetchDestinationDO(
			platform,
			appId,
			`/team/${encodeURIComponent(userId)}`,
			{ method: 'DELETE' }
		);

		if (!teamResponse.ok) {
			console.error('Failed to remove from DestinationDO:', await teamResponse.text());
			return false;
		}

		// 2. Remove from user's DashUserDO
		const userResponse = await fetchDashUserDO(
			platform,
			userId,
			`/destination-access/${encodeURIComponent(appId)}`,
			{ method: 'DELETE' }
		);

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error('Failed to remove from DashUserDO:', errorText);

			// ROLLBACK: Re-add to DestinationDO if we have the email and role
			if (userEmail && role) {
				try {
					await fetchDestinationDO(platform, appId, '/team', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ userId, userEmail, role })
					});
					console.log('Rolled back DestinationDO removal after DashUserDO failure');
				} catch (rollbackError) {
					console.error('Failed to rollback DestinationDO removal:', rollbackError);
				}
			} else {
				console.warn(
					'Inconsistent state: User removed from DestinationDO but not DashUserDO.',
					{
						appId,
						userId
					}
				);
			}
			return false;
		}

		// 3. Create audit log if actor provided
		if (actor) {
			await createDestinationAuditLog({
				platform,
				appId,
				eventType: DestinationAuditEventTypes.MEMBER_REMOVED,
				actorId: actor.id,
				actorEmail: actor.email,
				targetId: userId,
				targetEmail,
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return true;
	} catch (error) {
		console.error('Error removing destination team member:', error);
		return false;
	}
}

// ============================================================================
// Invite Functions
// ============================================================================

/**
 * Create an invite for a destination team member.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.email - Invitee email
 * @param {string} params.role - Role to grant (owner, editor, viewer)
 * @param {Object} params.actor - Actor info for audit log
 * @returns {Promise<Object>} { success: boolean, invite?: Object, error?: string }
 */
export async function createDestinationInvite({ platform, appId, email, role, actor }) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/invites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email,
				role,
				invitedBy: actor?.id,
				invitedByEmail: actor?.email
			})
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('Failed to create destination invite:', error);
			return { success: false, error };
		}

		const invite = await response.json();

		// Create audit log
		if (actor) {
			await createDestinationAuditLog({
				platform,
				appId,
				eventType: DestinationAuditEventTypes.TEAM_MEMBER_INVITED,
				actorId: actor.id,
				actorEmail: actor.email,
				targetEmail: email,
				details: { role },
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return { success: true, invite };
	} catch (error) {
		console.error('Error creating destination invite:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Cancel a pending invite.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.inviteId - Invite ID to cancel
 * @param {Object} params.actor - Actor info for audit log
 * @returns {Promise<boolean>} Success
 */
export async function cancelDestinationInvite({ platform, appId, inviteId, actor }) {
	try {
		const response = await fetchDestinationDO(
			platform,
			appId,
			`/invites/${encodeURIComponent(inviteId)}`,
			{ method: 'DELETE' }
		);

		if (!response.ok) {
			console.error('Failed to cancel destination invite:', await response.text());
			return false;
		}

		// Create audit log
		if (actor) {
			await createDestinationAuditLog({
				platform,
				appId,
				eventType: DestinationAuditEventTypes.INVITE_CANCELLED,
				actorId: actor.id,
				actorEmail: actor.email,
				details: { inviteId },
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return true;
	} catch (error) {
		console.error('Error cancelling destination invite:', error);
		return false;
	}
}

/**
 * Get pending invites for a destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<Array>} List of pending invites
 */
export async function getDestinationPendingInvites({ platform, appId }) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/invites');
		if (response.ok) {
			return response.json();
		}
		return [];
	} catch {
		return [];
	}
}

// ============================================================================
// Audit Log Functions
// ============================================================================

/**
 * Audit event types for destinations.
 */
export const DestinationAuditEventTypes = {
	TEAM_MEMBER_INVITED: 'team_member_invited',
	INVITE_ACCEPTED: 'invite_accepted',
	INVITE_CANCELLED: 'invite_cancelled',
	MEMBER_REMOVED: 'member_removed',
	ROLE_CHANGED: 'role_changed',
	SETTINGS_UPDATED: 'settings_updated',
	PROFILE_UPDATED: 'profile_updated',
	BRANDING_UPDATED: 'branding_updated'
};

/**
 * Derive the actor type from actor properties.
 * @param {Object} actor - Actor object with id, email, isFirmlyAdmin, role
 * @returns {string} Actor type
 */
function getActorType(actor) {
	if (!actor) return 'system';
	if (actor.isFirmlyAdmin) return 'firmly_admin';
	if (actor.role) return actor.role;
	return 'user';
}

/**
 * Get audit logs for a destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {number} params.limit - Number of logs to fetch (default 50)
 * @param {number} params.offset - Offset for pagination (default 0)
 * @param {boolean} params.includeFirmlyAdmin - Include Firmly admin actions (default false)
 * @returns {Promise<Object>} { logs, total, limit, offset }
 */
export async function getDestinationAuditLogs({
	platform,
	appId,
	limit = 50,
	offset = 0,
	includeFirmlyAdmin = false
}) {
	try {
		const response = await fetchDestinationDO(
			platform,
			appId,
			`/audit-logs?limit=${limit}&offset=${offset}&includeFirmlyAdmin=${includeFirmlyAdmin}`
		);

		if (!response.ok) {
			console.error('Failed to get destination audit logs:', await response.text());
			return { logs: [], total: 0, limit, offset };
		}

		return response.json();
	} catch (error) {
		console.error('Error getting destination audit logs:', error);
		return { logs: [], total: 0, limit, offset };
	}
}

/**
 * Create an audit log entry for a destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.eventType - Event type
 * @param {string} params.actorId - User ID who performed the action
 * @param {string} params.actorEmail - Email of user who performed the action
 * @param {string} params.targetId - Target user ID (optional)
 * @param {string} params.targetEmail - Target user email (optional)
 * @param {Object} params.details - Additional details (optional)
 * @param {boolean} params.isFirmlyAdmin - Whether actor is a Firmly admin
 * @param {string} params.actorType - Type of actor
 * @returns {Promise<boolean>} Success
 */
export async function createDestinationAuditLog({
	platform,
	appId,
	eventType,
	actorId,
	actorEmail,
	targetId = null,
	targetEmail = null,
	details = null,
	isFirmlyAdmin = false,
	actorType = 'user'
}) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/audit-logs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				eventType,
				actorId,
				actorEmail,
				targetId,
				targetEmail,
				details,
				isFirmlyAdmin,
				actorType
			})
		});

		if (!response.ok) {
			console.error('Failed to create destination audit log:', await response.text());
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error creating destination audit log:', error);
		return false;
	}
}

// ============================================================================
// Metrics & Query Functions
// ============================================================================

/**
 * Get all merchants a destination has access to.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<Array>} List of merchant domains
 */
export async function getAccessibleMerchants({ platform, appId }) {
	try {
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		if (!firmlyConfigs) {
			throw new Error('firmlyConfigs D1 binding not configured');
		}

		// Get the domains_partner config for this destination
		const partnerResult = await firmlyConfigs
			.prepare('SELECT info FROM domains_partner WHERE key = ?')
			.bind(appId)
			.first();

		if (!partnerResult?.info) {
			return [];
		}

		let partnerConfig = {};
		try {
			partnerConfig = JSON.parse(partnerResult.info);
		} catch {
			return [];
		}

		// Extract enabled merchant domains from the merchants map
		const enabledMerchants = [];
		if (partnerConfig.merchants && typeof partnerConfig.merchants === 'object') {
			for (const [domain, enabled] of Object.entries(partnerConfig.merchants)) {
				if (enabled === true) {
					enabledMerchants.push(domain);
				}
			}
		}

		if (enabledMerchants.length === 0) {
			return [];
		}

		// Get store info for each enabled merchant
		const placeholders = enabledMerchants.map(() => '?').join(',');
		const storesResult = await firmlyConfigs
			.prepare(`SELECT key, info FROM stores WHERE key IN (${placeholders})`)
			.bind(...enabledMerchants)
			.all();

		const storeMap = new Map();
		for (const row of storesResult.results || []) {
			let storeInfo = {};
			try {
				storeInfo = JSON.parse(row.info || '{}');
			} catch {
				// Use defaults
			}
			storeMap.set(row.key, storeInfo);
		}

		return enabledMerchants.map((domain) => {
			const storeInfo = storeMap.get(domain) || {};
			return {
				domain,
				displayName: storeInfo.display_name || domain
			};
		});
	} catch (error) {
		console.error('Error getting accessible merchants:', error);
		return [];
	}
}

/**
 * Get consolidated metrics for a destination across all (or filtered) merchants.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.periodStart - Period start date (ISO string)
 * @param {string} params.periodEnd - Period end date (ISO string)
 * @param {Array<string>} params.merchantFilter - Optional list of merchant domains to filter
 * @returns {Promise<Object>} { totalRevenue, totalOrders, aov }
 */
export async function getConsolidatedMetrics({
	platform,
	appId,
	periodStart,
	periodEnd,
	merchantFilter = null
}) {
	try {
		const reporting = platform?.env?.reporting;
		if (!reporting) {
			throw new Error('reporting D1 binding not configured');
		}

		// Get accessible merchants if no filter provided
		let merchants = merchantFilter;
		if (!merchants) {
			const accessible = await getAccessibleMerchants({ platform, appId });
			merchants = accessible.map((m) => m.domain);
		}

		if (merchants.length === 0) {
			return { totalRevenue: 0, totalOrders: 0, aov: 0 };
		}

		const placeholders = merchants.map(() => '?').join(',');

		const result = await reporting
			.prepare(
				`SELECT
					COALESCE(SUM(order_total), 0) as total_revenue,
					COUNT(*) as total_orders
				 FROM orders
				 WHERE app_id = ?
				   AND shop_id IN (${placeholders})
				   AND created_dt >= ?
				   AND created_dt <= ?`
			)
			.bind(appId, ...merchants, periodStart, periodEnd)
			.first();

		const totalRevenue = result?.total_revenue || 0;
		const totalOrders = result?.total_orders || 0;
		const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

		return { totalRevenue, totalOrders, aov };
	} catch (error) {
		console.error('Error getting consolidated metrics:', error);
		return { totalRevenue: 0, totalOrders: 0, aov: 0 };
	}
}

/**
 * Get top merchants by revenue for a destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.periodStart - Period start date
 * @param {string} params.periodEnd - Period end date
 * @param {number} params.limit - Number of top merchants to return (default 5)
 * @returns {Promise<Array>} List of { domain, displayName, revenue, orders }
 */
export async function getTopMerchants({ platform, appId, periodStart, periodEnd, limit = 5 }) {
	try {
		const reporting = platform?.env?.reporting;
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		if (!reporting || !firmlyConfigs) {
			return [];
		}

		// Get accessible merchants first
		const accessible = await getAccessibleMerchants({ platform, appId });
		if (accessible.length === 0) {
			return [];
		}

		const merchantMap = new Map(accessible.map((m) => [m.domain, m.displayName]));
		const merchants = accessible.map((m) => m.domain);
		const placeholders = merchants.map(() => '?').join(',');

		const result = await reporting
			.prepare(
				`SELECT
					shop_id,
					COALESCE(SUM(order_total), 0) as revenue,
					COUNT(*) as orders
				 FROM orders
				 WHERE app_id = ?
				   AND shop_id IN (${placeholders})
				   AND created_dt >= ?
				   AND created_dt <= ?
				 GROUP BY shop_id
				 ORDER BY revenue DESC
				 LIMIT ?`
			)
			.bind(appId, ...merchants, periodStart, periodEnd, limit)
			.all();

		return (result.results || []).map((row) => ({
			domain: row.shop_id,
			displayName: merchantMap.get(row.shop_id) || row.shop_id,
			revenue: row.revenue,
			orders: row.orders,
			aov: row.orders > 0 ? row.revenue / row.orders : 0
		}));
	} catch (error) {
		console.error('Error getting top merchants:', error);
		return [];
	}
}

/**
 * Get revenue trend data for a destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.periodStart - Current period start date
 * @param {string} params.periodEnd - Current period end date
 * @param {string} params.prevPeriodStart - Previous period start date (for comparison)
 * @param {string} params.prevPeriodEnd - Previous period end date
 * @param {Array<string>} params.merchantFilter - Optional merchant filter
 * @returns {Promise<Array>} Array of { date, current, previous }
 */
export async function getRevenueTrend({
	platform,
	appId,
	periodStart,
	periodEnd,
	prevPeriodStart,
	prevPeriodEnd,
	merchantFilter = null
}) {
	try {
		const reporting = platform?.env?.reporting;
		if (!reporting) {
			return [];
		}

		// Get accessible merchants if no filter provided
		let merchants = merchantFilter;
		if (!merchants) {
			const accessible = await getAccessibleMerchants({ platform, appId });
			merchants = accessible.map((m) => m.domain);
		}

		if (merchants.length === 0) {
			return [];
		}

		const placeholders = merchants.map(() => '?').join(',');

		// Get current period daily revenue
		const currentResult = await reporting
			.prepare(
				`SELECT
					DATE(created_dt) as date,
					COALESCE(SUM(order_total), 0) as revenue
				 FROM orders
				 WHERE app_id = ?
				   AND shop_id IN (${placeholders})
				   AND created_dt >= ?
				   AND created_dt <= ?
				 GROUP BY DATE(created_dt)
				 ORDER BY date ASC`
			)
			.bind(appId, ...merchants, periodStart, periodEnd)
			.all();

		// Get previous period daily revenue
		const prevResult = await reporting
			.prepare(
				`SELECT
					DATE(created_dt) as date,
					COALESCE(SUM(order_total), 0) as revenue
				 FROM orders
				 WHERE app_id = ?
				   AND shop_id IN (${placeholders})
				   AND created_dt >= ?
				   AND created_dt <= ?
				 GROUP BY DATE(created_dt)
				 ORDER BY date ASC`
			)
			.bind(appId, ...merchants, prevPeriodStart, prevPeriodEnd)
			.all();

		// Build comparison data
		const currentMap = new Map((currentResult.results || []).map((r) => [r.date, r.revenue]));
		const prevArray = prevResult.results || [];

		// Align the periods for comparison
		const trend = [];
		const currentDates = Array.from(currentMap.keys()).sort();

		for (let i = 0; i < currentDates.length; i++) {
			const date = currentDates[i];
			const current = currentMap.get(date) || 0;
			const previous = prevArray[i]?.revenue || 0;
			trend.push({ date, current, previous });
		}

		return trend;
	} catch (error) {
		console.error('Error getting revenue trend:', error);
		return [];
	}
}

/**
 * Get orders for a destination with pagination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {number} params.limit - Number of orders to return
 * @param {number} params.offset - Offset for pagination
 * @param {string} params.merchantFilter - Optional merchant domain filter
 * @param {string} params.search - Optional search term (order number)
 * @param {string} params.periodStart - Optional period start
 * @param {string} params.periodEnd - Optional period end
 * @returns {Promise<Object>} { orders, total, hasMore }
 */
export async function getDestinationOrders({
	platform,
	appId,
	limit = 20,
	offset = 0,
	merchantFilter = null,
	search = null,
	periodStart = null,
	periodEnd = null
}) {
	try {
		const reporting = platform?.env?.reporting;
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		if (!reporting || !firmlyConfigs) {
			return { orders: [], total: 0, hasMore: false };
		}

		// Get accessible merchants
		const accessible = await getAccessibleMerchants({ platform, appId });
		if (accessible.length === 0) {
			return { orders: [], total: 0, hasMore: false };
		}

		const merchantMap = new Map(accessible.map((m) => [m.domain, m.displayName]));

		// Apply merchant filter if provided
		let merchants = accessible.map((m) => m.domain);
		if (merchantFilter) {
			merchants = merchants.filter((m) => m === merchantFilter);
		}

		if (merchants.length === 0) {
			return { orders: [], total: 0, hasMore: false };
		}

		const placeholders = merchants.map(() => '?').join(',');
		let whereClause = `app_id = ? AND shop_id IN (${placeholders})`;
		const bindParams = [appId, ...merchants];

		// Add search filter
		if (search) {
			whereClause += ` AND platform_order_number LIKE ?`;
			bindParams.push(`%${search}%`);
		}

		// Add period filter
		if (periodStart && periodEnd) {
			whereClause += ` AND created_dt >= ? AND created_dt <= ?`;
			bindParams.push(periodStart, periodEnd);
		}

		// Get total count
		const countResult = await reporting
			.prepare(`SELECT COUNT(*) as total FROM orders WHERE ${whereClause}`)
			.bind(...bindParams)
			.first();

		const total = countResult?.total || 0;

		// Get paginated orders
		const ordersResult = await reporting
			.prepare(
				`SELECT
					platform_order_number,
					shop_id,
					order_total,
					created_dt,
					order_info
				 FROM orders
				 WHERE ${whereClause}
				 ORDER BY created_dt DESC
				 LIMIT ? OFFSET ?`
			)
			.bind(...bindParams, limit, offset)
			.all();

		const orders = (ordersResult.results || []).map((row) => {
			let orderInfo = {};
			try {
				orderInfo = JSON.parse(row.order_info || '{}');
			} catch {
				// Use defaults
			}
			return {
				orderId: row.platform_order_number,
				merchantDomain: row.shop_id,
				merchantName: merchantMap.get(row.shop_id) || row.shop_id,
				total: row.order_total,
				createdAt: row.created_dt,
				itemsCount: orderInfo.line_items?.length || 0
			};
		});

		return {
			orders,
			total,
			hasMore: offset + orders.length < total
		};
	} catch (error) {
		console.error('Error getting destination orders:', error);
		return { orders: [], total: 0, hasMore: false };
	}
}

/**
 * Get order detail for a destination.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.orderId - Order ID (platform_order_number)
 * @returns {Promise<Object|null>} Order detail or null if not found/not accessible
 */
export async function getOrderDetail({ platform, appId, orderId }) {
	try {
		const reporting = platform?.env?.reporting;
		if (!reporting) {
			return null;
		}

		// Get accessible merchants to validate access
		const accessible = await getAccessibleMerchants({ platform, appId });
		if (accessible.length === 0) {
			return null;
		}

		const merchantMap = new Map(accessible.map((m) => [m.domain, m.displayName]));
		const merchants = accessible.map((m) => m.domain);
		const placeholders = merchants.map(() => '?').join(',');

		const result = await reporting
			.prepare(
				`SELECT
					platform_order_number,
					shop_id,
					order_total,
					created_dt,
					order_info
				 FROM orders
				 WHERE platform_order_number = ?
				   AND app_id = ?
				   AND shop_id IN (${placeholders})`
			)
			.bind(orderId, appId, ...merchants)
			.first();

		if (!result) {
			return null;
		}

		let orderInfo = {};
		try {
			orderInfo = JSON.parse(result.order_info || '{}');
		} catch {
			// Use defaults
		}

		return {
			orderId: result.platform_order_number,
			merchantDomain: result.shop_id,
			merchantName: merchantMap.get(result.shop_id) || result.shop_id,
			total: result.order_total,
			createdAt: result.created_dt,
			lineItems: orderInfo.line_items || []
		};
	} catch (error) {
		console.error('Error getting order detail:', error);
		return null;
	}
}

/**
 * Get metrics for all merchants (for merchants list page).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @param {string} params.periodStart - Period start date
 * @param {string} params.periodEnd - Period end date
 * @param {string} params.sort - Sort field (revenue, orders, aov, name)
 * @param {string} params.order - Sort order (asc, desc)
 * @returns {Promise<Array>} List of merchant metrics
 */
export async function getMerchantMetrics({
	platform,
	appId,
	periodStart,
	periodEnd,
	sort = 'revenue',
	order = 'desc'
}) {
	try {
		const reporting = platform?.env?.reporting;
		if (!reporting) {
			return [];
		}

		// Get accessible merchants
		const accessible = await getAccessibleMerchants({ platform, appId });
		if (accessible.length === 0) {
			return [];
		}

		const merchants = accessible.map((m) => m.domain);
		const placeholders = merchants.map(() => '?').join(',');

		// Validate sort field
		const validSortFields = ['revenue', 'orders', 'aov'];
		const sortField = validSortFields.includes(sort) ? sort : 'revenue';
		const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

		const sqlSort =
			sortField === 'revenue'
				? 'revenue'
				: sortField === 'orders'
					? 'orders'
					: 'revenue / NULLIF(orders, 0)';

		const result = await reporting
			.prepare(
				`SELECT
					shop_id,
					COALESCE(SUM(order_total), 0) as revenue,
					COUNT(*) as orders
				 FROM orders
				 WHERE app_id = ?
				   AND shop_id IN (${placeholders})
				   AND created_dt >= ?
				   AND created_dt <= ?
				 GROUP BY shop_id
				 ORDER BY ${sqlSort} ${sortOrder}`
			)
			.bind(appId, ...merchants, periodStart, periodEnd)
			.all();

		// Include merchants with no orders
		const resultMap = new Map(
			(result.results || []).map((r) => [r.shop_id, { revenue: r.revenue, orders: r.orders }])
		);

		let metrics = accessible.map((m) => {
			const data = resultMap.get(m.domain) || { revenue: 0, orders: 0 };
			return {
				domain: m.domain,
				displayName: m.displayName,
				totalRevenue: data.revenue,
				totalOrders: data.orders,
				aov: data.orders > 0 ? data.revenue / data.orders : 0
			};
		});

		// Sort by name if requested (can't do in SQL for display name)
		if (sort === 'name') {
			metrics = metrics.sort((a, b) => {
				const comparison = a.displayName.localeCompare(b.displayName);
				return order === 'asc' ? comparison : -comparison;
			});
		}

		return metrics;
	} catch (error) {
		console.error('Error getting merchant metrics:', error);
		return [];
	}
}
