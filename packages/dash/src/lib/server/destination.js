/**
 * Destination operations helper module.
 *
 * Provides a unified interface for working with DestinationDO via service binding.
 * Handles team membership, audit logs, profile management, and dual-write synchronization with DashUserDO.
 * Follows the same patterns as merchant.js for consistency.
 */

import { getProfilesWithAvatarsForUsers } from '$lib/server/user.js';

/**
 * Helper to make requests to the DestinationDO via dash-do service.
 * @param {Object} platform - SvelteKit platform object
 * @param {string} appId - Destination app_id (DO identifier)
 * @param {string} path - Request path (e.g., '/team')
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchDestinationDO(platform, appId, path, options = {}) {
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
 * Enriches team data with user profiles (name, avatarDataUrl).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<Array>} List of team members with profile data
 */
export async function getDestinationTeam({ platform, appId }) {
	try {
		const response = await fetchDestinationDO(platform, appId, '/team');
		if (!response.ok) {
			console.error('Failed to get destination team:', await response.text());
			return [];
		}
		const team = await response.json();

		if (team.length === 0) return [];

		// Fetch profiles for all team members in parallel
		const userIds = team.map((member) => member.user_id);
		const profilesMap = await getProfilesWithAvatarsForUsers({ platform, userIds });

		// Enrich team data with profile information
		return team.map((member) => {
			const profile = profilesMap.get(member.user_id) || {};
			return {
				...member,
				name: profile.name || null,
				avatarDataUrl: profile.avatarDataUrl || null
			};
		});
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
 * If restrictMerchantAccess is false, returns ALL merchants with unrestricted flag.
 * If restrictMerchantAccess is true (or undefined for backwards compatibility),
 * returns only merchants explicitly enabled in the merchants map.
 *
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.appId - Destination app_id
 * @returns {Promise<{merchants: Array, unrestricted: boolean}>}
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
			return { merchants: [], unrestricted: false };
		}

		let partnerConfig = {};
		try {
			partnerConfig = JSON.parse(partnerResult.info);
		} catch {
			return { merchants: [], unrestricted: false };
		}

		// If restrictMerchantAccess is false, return ALL merchants
		if (partnerConfig.restrictMerchantAccess === false) {
			const allStoresResult = await firmlyConfigs
				.prepare('SELECT key, info FROM stores ORDER BY key ASC')
				.all();

			const merchants = (allStoresResult.results || []).map((row) => {
				let storeInfo = {};
				try {
					storeInfo = JSON.parse(row.info || '{}');
				} catch {
					// Use defaults
				}
				return {
					domain: row.key,
					displayName: storeInfo.display_name || row.key
				};
			});

			return { merchants, unrestricted: true };
		}

		// restrictMerchantAccess is true or undefined - use explicit merchants list
		const enabledMerchants = [];
		if (partnerConfig.merchants && typeof partnerConfig.merchants === 'object') {
			for (const [domain, enabled] of Object.entries(partnerConfig.merchants)) {
				if (enabled === true) {
					enabledMerchants.push(domain);
				}
			}
		}

		if (enabledMerchants.length === 0) {
			return { merchants: [], unrestricted: false };
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

		const merchants = enabledMerchants.map((domain) => {
			const storeInfo = storeMap.get(domain) || {};
			return {
				domain,
				displayName: storeInfo.display_name || domain
			};
		});

		return { merchants, unrestricted: false };
	} catch (error) {
		console.error('Error getting accessible merchants:', error);
		return { merchants: [], unrestricted: false };
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
		const { merchants: accessible, unrestricted } = await getAccessibleMerchants({
			platform,
			appId
		});
		if (accessible.length === 0 && !unrestricted) {
			return [];
		}

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

		let result;
		if (unrestricted) {
			result = await reporting
				.prepare(
					`SELECT
						shop_id,
						COALESCE(SUM(order_total), 0) as revenue,
						COUNT(*) as orders
					 FROM orders
					 WHERE app_id = ?
					   AND created_dt >= ?
					   AND created_dt <= ?
					 GROUP BY shop_id
					 ORDER BY ${sqlSort} ${sortOrder}`
				)
				.bind(appId, periodStart, periodEnd)
				.all();
		} else {
			const merchants = accessible.map((m) => m.domain);
			const placeholders = merchants.map(() => '?').join(',');
			result = await reporting
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
		}

		// Build merchant display name map
		const merchantMap = new Map(accessible.map((m) => [m.domain, m.displayName]));

		// Include merchants with no orders (only for restricted mode where we know the full list)
		const resultMap = new Map(
			(result.results || []).map((r) => [r.shop_id, { revenue: r.revenue, orders: r.orders }])
		);

		let metrics;
		if (unrestricted) {
			// For unrestricted, build metrics from query results (we don't have a full merchant list to pad)
			metrics = (result.results || []).map((r) => ({
				domain: r.shop_id,
				displayName: merchantMap.get(r.shop_id) || r.shop_id,
				totalRevenue: r.revenue || 0,
				totalOrders: r.orders || 0,
				aov: r.orders > 0 ? r.revenue / r.orders : 0
			}));
		} else {
			metrics = accessible.map((m) => {
				const data = resultMap.get(m.domain) || { revenue: 0, orders: 0 };
				return {
					domain: m.domain,
					displayName: m.displayName,
					totalRevenue: data.revenue,
					totalOrders: data.orders,
					aov: data.orders > 0 ? data.revenue / data.orders : 0
				};
			});
		}

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
