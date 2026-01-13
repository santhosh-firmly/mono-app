/**
 * Merchant operations helper module.
 *
 * Provides a unified interface for working with MerchantDO via service binding.
 * Handles team membership, audit logs, and dual-write synchronization with DashUserDO.
 */

import { INTEGRATION_STEPS, buildIntegrationStatus } from '$lib/integration-steps.js';
import {
	fetchExternalIntegrationStatus,
	transformExternalStatus,
	isForwardTransition
} from '$lib/server/control-panel.js';
import { getProfilesWithAvatarsForUsers } from '$lib/server/user.js';

/**
 * Helper to make requests to the MerchantDO via dash-do service.
 * @param {Object} platform - SvelteKit platform object
 * @param {string} merchantDomain - Merchant domain (DO identifier)
 * @param {string} path - Request path (e.g., '/team')
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function fetchMerchantDO(platform, merchantDomain, path, options = {}) {
	const DASH_DO = platform?.env?.DASH_DO;
	if (!DASH_DO) {
		throw new Error('DASH_DO service binding not configured');
	}

	const headers = new Headers(options.headers || {});
	headers.set('X-Merchant-Domain', merchantDomain);

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

/**
 * Get all team members for a merchant from MerchantDO.
 * Enriches team data with user profiles (name, avatarDataUrl).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Array>} List of team members with profile data
 */
export async function getMerchantTeam({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/team');
		if (!response.ok) {
			console.error('Failed to get merchant team:', await response.text());
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
		console.error('Error getting merchant team:', error);
		return [];
	}
}

/**
 * Add a team member to a merchant.
 * Dual-writes to both MerchantDO (team list) and DashUserDO (user's access).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.userId - User UUID to add
 * @param {string} params.userEmail - User email
 * @param {string} params.role - Role (owner, editor, viewer)
 * @param {string} params.grantedBy - User ID who granted access
 * @param {Object} params.actor - Actor info for audit log { id, email, isFirmlyAdmin?, role? }
 * @returns {Promise<boolean>} Success
 */
export async function addTeamMember({
	platform,
	merchantDomain,
	userId,
	userEmail,
	role = 'viewer',
	grantedBy = null,
	actor = null
}) {
	try {
		// 1. Add to MerchantDO team table
		const teamResponse = await fetchMerchantDO(platform, merchantDomain, '/team', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId, userEmail, role, grantedBy })
		});

		if (!teamResponse.ok) {
			console.error('Failed to add team member to MerchantDO:', await teamResponse.text());
			return false;
		}

		// 2. Add to user's DashUserDO merchant_access table
		const userResponse = await fetchDashUserDO(platform, userId, '/merchant-access', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ merchantDomain, role })
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error('Failed to add merchant access to DashUserDO:', errorText);

			// ROLLBACK: Remove from MerchantDO since DashUserDO write failed
			try {
				await fetchMerchantDO(
					platform,
					merchantDomain,
					`/team/${encodeURIComponent(userId)}`,
					{ method: 'DELETE' }
				);
				console.log('Rolled back MerchantDO team entry after DashUserDO failure');
			} catch (rollbackError) {
				console.error('Failed to rollback MerchantDO team entry:', rollbackError);
			}
			return false;
		}

		// 3. Create audit log if actor provided
		if (actor) {
			await createAuditLog({
				platform,
				merchantDomain,
				eventType: 'invite_accepted',
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
		console.error('Error adding team member:', error);
		return false;
	}
}

/**
 * Update a team member's role.
 * Dual-writes to both MerchantDO and DashUserDO.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.userId - User ID to update
 * @param {string} params.newRole - New role (owner, editor, viewer)
 * @param {Object} params.actor - Actor info for audit log { id, email, isFirmlyAdmin?, role? }
 * @param {string} params.targetEmail - Target user's email (for audit log)
 * @returns {Promise<boolean>} Success
 */
export async function updateTeamMemberRole({
	platform,
	merchantDomain,
	userId,
	newRole,
	oldRole = null,
	actor = null,
	targetEmail = null
}) {
	try {
		// 1. Update in MerchantDO
		const teamResponse = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/team/${encodeURIComponent(userId)}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role: newRole })
			}
		);

		if (!teamResponse.ok) {
			console.error('Failed to update role in MerchantDO:', await teamResponse.text());
			return false;
		}

		// 2. Update in user's DashUserDO
		const userResponse = await fetchDashUserDO(platform, userId, '/merchant-access', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ merchantDomain, role: newRole })
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error('Failed to update role in DashUserDO:', errorText);

			// ROLLBACK: Restore old role in MerchantDO if we know it
			if (oldRole) {
				try {
					await fetchMerchantDO(
						platform,
						merchantDomain,
						`/team/${encodeURIComponent(userId)}`,
						{
							method: 'PUT',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ role: oldRole })
						}
					);
					console.log('Rolled back MerchantDO role after DashUserDO failure');
				} catch (rollbackError) {
					console.error('Failed to rollback MerchantDO role:', rollbackError);
				}
			}
			return false;
		}

		// 3. Create audit log if actor provided
		if (actor) {
			await createAuditLog({
				platform,
				merchantDomain,
				eventType: 'role_changed',
				actorId: actor.id,
				actorEmail: actor.email,
				targetId: userId,
				targetEmail,
				details: { newRole },
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return true;
	} catch (error) {
		console.error('Error updating team member role:', error);
		return false;
	}
}

/**
 * Remove a team member from a merchant.
 * Dual-writes to both MerchantDO and DashUserDO.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.userId - User ID to remove
 * @param {Object} params.actor - Actor info for audit log { id, email, isFirmlyAdmin?, role? }
 * @param {string} params.targetEmail - Target user's email (for audit log)
 * @returns {Promise<boolean>} Success
 */
export async function removeTeamMember({
	platform,
	merchantDomain,
	userId,
	userEmail = null,
	role = null,
	actor = null,
	targetEmail = null
}) {
	try {
		// 1. Remove from MerchantDO
		const teamResponse = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/team/${encodeURIComponent(userId)}`,
			{ method: 'DELETE' }
		);

		if (!teamResponse.ok) {
			console.error('Failed to remove from MerchantDO:', await teamResponse.text());
			return false;
		}

		// 2. Remove from user's DashUserDO
		const userResponse = await fetchDashUserDO(
			platform,
			userId,
			`/merchant-access/${encodeURIComponent(merchantDomain)}`,
			{ method: 'DELETE' }
		);

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			console.error('Failed to remove from DashUserDO:', errorText);

			// ROLLBACK: Re-add to MerchantDO if we have the email and role
			if (userEmail && role) {
				try {
					await fetchMerchantDO(platform, merchantDomain, '/team', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ userId, userEmail, role })
					});
					console.log('Rolled back MerchantDO removal after DashUserDO failure');
				} catch (rollbackError) {
					console.error('Failed to rollback MerchantDO removal:', rollbackError);
				}
			} else {
				console.warn(
					'Inconsistent state: User removed from MerchantDO but not DashUserDO.',
					{ merchantDomain, userId }
				);
			}
			return false;
		}

		// 3. Create audit log if actor provided
		if (actor) {
			await createAuditLog({
				platform,
				merchantDomain,
				eventType: 'member_removed',
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
		console.error('Error removing team member:', error);
		return false;
	}
}

// ============================================================================
// Pending Invite Functions
// ============================================================================

/**
 * Get pending invites for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {boolean} params.includeFirmlyAdmin - Include invites by Firmly admins (default false)
 * @returns {Promise<Array>} List of pending invites
 */
export async function getPendingInvites({ platform, merchantDomain, includeFirmlyAdmin = false }) {
	try {
		const response = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/pending-invites?includeFirmlyAdmin=${includeFirmlyAdmin}`
		);

		if (!response.ok) {
			console.error('Failed to get pending invites:', await response.text());
			return [];
		}

		return response.json();
	} catch (error) {
		console.error('Error getting pending invites:', error);
		return [];
	}
}

/**
 * Add a pending invite to a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.token - Unique invite token
 * @param {string} params.email - Invitee email
 * @param {string} params.role - Role (owner, editor, viewer)
 * @param {string} params.invitedByUserId - User ID who sent the invite
 * @param {string} params.invitedByEmail - Email of user who sent the invite
 * @param {boolean} params.isFirmlyAdmin - Whether inviter is a Firmly admin
 * @param {string} params.expiresAt - ISO date string for expiry
 * @returns {Promise<boolean>} Success
 */
export async function addPendingInvite({
	platform,
	merchantDomain,
	token,
	email,
	role,
	invitedByUserId,
	invitedByEmail,
	isFirmlyAdmin = false,
	expiresAt
}) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/pending-invites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				token,
				email,
				role,
				invitedByUserId,
				invitedByEmail,
				isFirmlyAdmin,
				expiresAt
			})
		});

		if (!response.ok) {
			console.error('Failed to add pending invite:', await response.text());
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error adding pending invite:', error);
		return false;
	}
}

/**
 * Remove a pending invite from a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.token - Invite token
 * @returns {Promise<boolean>} Success
 */
export async function removePendingInvite({ platform, merchantDomain, token }) {
	try {
		const response = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/pending-invites/${encodeURIComponent(token)}`,
			{ method: 'DELETE' }
		);

		if (!response.ok) {
			console.error('Failed to remove pending invite:', await response.text());
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error removing pending invite:', error);
		return false;
	}
}

/**
 * Get a pending invite by email.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.email - Invitee email
 * @returns {Promise<Object|null>} Invite object or null if not found
 */
export async function getPendingInviteByEmail({ platform, merchantDomain, email }) {
	try {
		const response = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/pending-invites/by-email/${encodeURIComponent(email)}`
		);

		if (!response.ok) {
			console.error('Failed to get pending invite by email:', await response.text());
			return null;
		}

		return response.json();
	} catch (error) {
		console.error('Error getting pending invite by email:', error);
		return null;
	}
}

/**
 * Update a pending invite (role and/or expiry).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.token - Invite token
 * @param {string} params.role - New role (optional)
 * @param {string} params.expiresAt - New expiry ISO date (optional)
 * @returns {Promise<boolean>} Success
 */
export async function updatePendingInvite({ platform, merchantDomain, token, role, expiresAt }) {
	try {
		const response = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/pending-invites/${encodeURIComponent(token)}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role, expiresAt })
			}
		);

		if (!response.ok) {
			console.error('Failed to update pending invite:', await response.text());
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error updating pending invite:', error);
		return false;
	}
}

/**
 * Get audit logs for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {number} params.limit - Number of logs to fetch (default 50)
 * @param {number} params.offset - Offset for pagination (default 0)
 * @param {boolean} params.includeFirmlyAdmin - Include Firmly admin actions (default false)
 * @returns {Promise<Object>} { logs, total, limit, offset }
 */
export async function getAuditLogs({
	platform,
	merchantDomain,
	limit = 50,
	offset = 0,
	includeFirmlyAdmin = false
}) {
	try {
		const response = await fetchMerchantDO(
			platform,
			merchantDomain,
			`/audit-logs?limit=${limit}&offset=${offset}&includeFirmlyAdmin=${includeFirmlyAdmin}`
		);

		if (!response.ok) {
			console.error('Failed to get audit logs:', await response.text());
			return { logs: [], total: 0, limit, offset };
		}

		return response.json();
	} catch (error) {
		console.error('Error getting audit logs:', error);
		return { logs: [], total: 0, limit, offset };
	}
}

/**
 * Derive the actor type from actor properties.
 * @param {Object} actor - Actor object with id, email, isFirmlyAdmin, role
 * @returns {string} Actor type: 'firmly_admin', 'owner', 'editor', 'viewer', 'system', or 'user'
 */
function getActorType(actor) {
	if (!actor) return 'system';
	if (actor.isFirmlyAdmin) return 'firmly_admin';
	if (actor.role) return actor.role; // 'owner', 'editor', 'viewer'
	return 'user';
}

/**
 * Create an audit log entry.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.eventType - Event type (e.g., 'team_member_invited')
 * @param {string} params.actorId - User ID who performed the action
 * @param {string} params.actorEmail - Email of user who performed the action
 * @param {string} params.targetId - Target user ID (optional)
 * @param {string} params.targetEmail - Target user email (optional)
 * @param {Object} params.details - Additional details (optional)
 * @param {boolean} params.isFirmlyAdmin - Whether actor is a Firmly admin (optional)
 * @param {string} params.actorType - Type of actor: 'firmly_admin', 'owner', 'editor', 'viewer', 'system', 'user' (optional)
 * @returns {Promise<boolean>} Success
 */
export async function createAuditLog({
	platform,
	merchantDomain,
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
		const response = await fetchMerchantDO(platform, merchantDomain, '/audit-logs', {
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
			console.error('Failed to create audit log:', await response.text());
			return false;
		}

		return true;
	} catch (error) {
		console.error('Error creating audit log:', error);
		return false;
	}
}

/**
 * Get the merchant agreement status.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} { signed: boolean, agreement: Object|null }
 */
export async function getMerchantAgreement({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/agreement');

		if (!response.ok) {
			console.error('Failed to get merchant agreement:', await response.text());
			return { signed: false, agreement: null };
		}

		return response.json();
	} catch (error) {
		console.error('Error getting merchant agreement:', error);
		return { signed: false, agreement: null };
	}
}

/**
 * Get the agreement configuration for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} Agreement config { contentType, markdownContent, pdfKey, externallySigned, ... }
 */
export async function getAgreementConfig({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/agreement-config');

		if (!response.ok) {
			console.error('Failed to get agreement config:', await response.text());
			return {
				contentType: 'default',
				markdownContent: null,
				pdfKey: null,
				externallySigned: false
			};
		}

		return response.json();
	} catch (error) {
		console.error('Error getting agreement config:', error);
		return {
			contentType: 'default',
			markdownContent: null,
			pdfKey: null,
			externallySigned: false
		};
	}
}

/**
 * Update the agreement configuration for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.contentType - 'default', 'markdown', or 'pdf'
 * @param {string} params.markdownContent - Markdown content (for markdown type)
 * @param {string} params.pdfKey - R2 object key (for pdf type)
 * @param {boolean} params.externallySigned - Whether agreement is externally signed
 * @param {Object} params.actor - Actor info { id, email }
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function updateAgreementConfig({
	platform,
	merchantDomain,
	contentType,
	markdownContent = null,
	pdfKey = null,
	externallySigned = false,
	actor
}) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/agreement-config', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contentType,
				markdownContent,
				pdfKey,
				externallySigned,
				userId: actor.id,
				userEmail: actor.email
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return { success: false, error: data.error || 'Failed to update agreement config' };
		}

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: 'agreement_config_updated',
			actorId: actor.id,
			actorEmail: actor.email,
			details: { contentType, externallySigned },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return { success: true, ...data };
	} catch (error) {
		console.error('Error updating agreement config:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Sign the merchant agreement.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.userId - User ID who is signing
 * @param {string} params.userEmail - User email
 * @param {string} params.browserInfo - Browser user agent
 * @param {string} params.clientIp - Client IP address
 * @param {string} params.clientLocation - Client location (city, country)
 * @returns {Promise<Object>} { success: boolean, agreement?: Object, error?: string }
 */
export async function signMerchantAgreement({
	platform,
	merchantDomain,
	userId,
	userEmail,
	browserInfo = null,
	clientIp = null,
	clientLocation = null
}) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/agreement', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				userId,
				userEmail,
				browserInfo,
				clientIp,
				clientLocation
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return { success: false, error: data.error || 'Failed to sign agreement' };
		}

		// Create audit log for agreement signing
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: 'agreement_signed',
			actorId: userId,
			actorEmail: userEmail,
			details: {
				clientIp,
				clientLocation,
				browserInfo: browserInfo?.substring(0, 100) // Truncate for log
			}
		});

		return { success: true, agreement: data.agreement };
	} catch (error) {
		console.error('Error signing merchant agreement:', error);
		return { success: false, error: 'Failed to sign agreement' };
	}
}

/**
 * Audit event types for reference.
 */
export const AuditEventTypes = {
	TEAM_MEMBER_INVITED: 'team_member_invited',
	INVITE_ACCEPTED: 'invite_accepted',
	INVITE_CANCELLED: 'invite_cancelled',
	MEMBER_REMOVED: 'member_removed',
	ROLE_CHANGED: 'role_changed',
	SETTINGS_UPDATED: 'settings_updated',
	DESTINATION_ENABLED: 'destination_enabled',
	DESTINATION_DISABLED: 'destination_disabled',
	DESTINATIONS_CONFIGURED: 'destinations_configured',
	AGREEMENT_SIGNED: 'agreement_signed',
	INTEGRATION_COMPLETED: 'integration_completed',
	INTEGRATION_RESET: 'integration_reset',
	CATALOG_CONFIGURED: 'catalog_configured',
	CDN_WHITELISTING_COMPLETED: 'cdn_whitelisting_completed',
	INTEGRATION_STEP_COMPLETED: 'integration_step_completed',
	INTEGRATION_STEP_UPDATED: 'integration_step_updated',
	INTEGRATION_STEPS_SYNCED: 'integration_steps_synced',
	DASHBOARD_RESET: 'dashboard_reset',
	KYB_SUBMITTED: 'kyb_submitted',
	KYB_APPROVED: 'kyb_approved',
	KYB_REJECTED: 'kyb_rejected',
	GO_LIVE_SUBMITTED: 'go_live_submitted',
	GO_LIVE_APPROVED: 'go_live_approved',
	GO_LIVE_REJECTED: 'go_live_rejected'
};

// ============================================================================
// Onboarding Status Functions
// ============================================================================

/**
 * Get the onboarding status for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} Onboarding status keyed by task
 */
export async function getOnboardingStatus({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/onboarding');

		if (!response.ok) {
			console.error('Failed to get onboarding status:', await response.text());
			return {};
		}

		return response.json();
	} catch (error) {
		console.error('Error getting onboarding status:', error);
		return {};
	}
}

/**
 * Get all onboarding status data in a single call.
 * This batches multiple status checks into one DO request for efficiency.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} { integrationComplete, agreementSigned, destinationsConfigured, catalogConfigured, cdnWhitelistingComplete }
 */
export async function getOnboardingStatusAll({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/onboarding-status-all');

		if (!response.ok) {
			console.error('Failed to get all onboarding status:', await response.text());
			return {
				integrationComplete: false,
				agreementSigned: false,
				destinationsConfigured: false,
				catalogConfigured: false,
				cdnWhitelistingComplete: false
			};
		}

		return response.json();
	} catch (error) {
		console.error('Error getting all onboarding status:', error);
		return {
			integrationComplete: false,
			agreementSigned: false,
			destinationsConfigured: false,
			catalogConfigured: false,
			cdnWhitelistingComplete: false
		};
	}
}

/**
 * Check if integration is marked as complete.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<boolean>} True if integration is complete
 */
export async function checkIntegrationComplete({ platform, merchantDomain }) {
	try {
		const status = await getOnboardingStatus({ platform, merchantDomain });
		return status?.integration?.completed === true;
	} catch (error) {
		console.error('Error checking integration status:', error);
		return false;
	}
}

/**
 * Set the integration complete status for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {boolean} params.completed - Whether integration is complete
 * @param {Object} params.actor - Actor info { id, email }
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function setIntegrationComplete({ platform, merchantDomain, completed, actor }) {
	try {
		const response = await fetchMerchantDO(
			platform,
			merchantDomain,
			'/onboarding/integration',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					completed,
					userId: actor.id,
					userEmail: actor.email
				})
			}
		);

		if (!response.ok) {
			const error = await response.text();
			console.error('Failed to set integration status:', error);
			return { success: false, error };
		}

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: completed
				? AuditEventTypes.INTEGRATION_COMPLETED
				: AuditEventTypes.INTEGRATION_RESET,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { completed },
			isFirmlyAdmin: actor.isFirmlyAdmin || false,
			actorType: getActorType(actor)
		});

		return { success: true };
	} catch (error) {
		console.error('Error setting integration status:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Check if CDN whitelisting is complete.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<boolean>} True if CDN whitelisting is complete
 */
export async function checkCDNWhitelistingComplete({ platform, merchantDomain }) {
	try {
		const status = await getOnboardingStatus({ platform, merchantDomain });
		return status?.cdn?.completed === true;
	} catch (error) {
		console.error('Error checking CDN whitelisting status:', error);
		return false;
	}
}

// ============================================================================
// Destination Configuration Functions
// ============================================================================

/**
 * Check if merchant has configured/reviewed destinations.
 * Checks the MerchantDO onboarding status for destinations confirmation.
 * Used for onboarding progress tracking.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<boolean>} True if destinations are configured/reviewed
 */
export async function checkDestinationsConfigured({ platform, merchantDomain }) {
	try {
		const status = await getOnboardingStatus({ platform, merchantDomain });
		return status?.destinations?.completed === true;
	} catch (error) {
		console.error('Error checking destinations configured:', error);
		return false;
	}
}

/**
 * Get all destinations with merchant's enabled status.
 * Fetches from app_identifiers (all destinations) and domains_partner (merchant config).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} { destinations: Array, enabledIds: Set, hasConfig: boolean }
 */
export async function getMerchantDestinations({ platform, merchantDomain }) {
	try {
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		if (!firmlyConfigs) {
			throw new Error('firmlyConfigs D1 binding not configured');
		}

		// 1. Check if destinations have been confirmed via onboarding status
		const onboardingStatus = await getOnboardingStatus({ platform, merchantDomain });
		const hasConfig = onboardingStatus?.destinations?.completed === true;

		// 2. Fetch all destinations from app_identifiers
		const destinationsStmt = firmlyConfigs.prepare('SELECT key, info FROM app_identifiers');
		const destinationsResult = await destinationsStmt.all();

		// 3. Fetch destination configs from domains_partner
		const partnerStmt = firmlyConfigs.prepare('SELECT key, info FROM domains_partner');
		const partnerResult = await partnerStmt.all();

		// Build a map of destination configs
		const partnerConfigMap = new Map();
		for (const row of partnerResult.results || []) {
			try {
				const info = JSON.parse(row.info);
				partnerConfigMap.set(row.key, info);
			} catch {
				continue;
			}
		}

		// Build enabled destinations set
		const enabledIds = new Set();

		for (const [key, config] of partnerConfigMap) {
			if (config.merchants && config.merchants[merchantDomain] === true) {
				enabledIds.add(key);
			}
		}

		// Build destinations array
		const destinations = (destinationsResult.results || []).map((row) => {
			let info = {};
			try {
				info = JSON.parse(row.info);
			} catch {
				// Use defaults
			}

			const partnerConfig = partnerConfigMap.get(row.key);
			const restrictMerchantAccess = partnerConfig?.restrictMerchantAccess === true;
			const isWhitelisted = partnerConfig?.merchants?.[merchantDomain] === true;

			// Merchant can toggle if the destination has restrictMerchantAccess enabled
			// Otherwise, the destination is available to all merchants and can't be toggled
			const canToggle = restrictMerchantAccess;

			// Destination is active (enabled) for this merchant if:
			// - restrictMerchantAccess is true AND merchant is whitelisted, OR
			// - restrictMerchantAccess is false (available to all)
			const isActive = restrictMerchantAccess ? isWhitelisted : true;

			return {
				id: row.key,
				name: info.display_name || info.subject || row.key,
				category: info.category || null,
				isComingSoon: info.isComingSoon === true,
				isSystem: info.isSystem === true,
				isActive,
				canToggle,
				restrictMerchantAccess
			};
		});

		// Filter out system destinations from merchant view
		const visibleDestinations = destinations.filter((d) => !d.isSystem);

		return { destinations: visibleDestinations, enabledIds, hasConfig };
	} catch (error) {
		console.error('Error getting merchant destinations:', error);
		return { destinations: [], enabledIds: new Set(), hasConfig: false };
	}
}

/**
 * Update merchant's destination configuration.
 * Updates domains_partner entries and creates audit logs.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Array<string>} params.enabledDestinations - Array of destination IDs to enable
 * @param {Object} params.actor - Actor info for audit log { id, email }
 * @returns {Promise<Object>} { success: boolean, isFirstTimeSave: boolean, error?: string }
 */
export async function updateMerchantDestinations({
	platform,
	merchantDomain,
	enabledDestinations,
	actor
}) {
	try {
		const firmlyConfigs = platform?.env?.firmlyConfigs;
		if (!firmlyConfigs) {
			throw new Error('firmlyConfigs D1 binding not configured');
		}

		// Get current state to determine what changed
		const { destinations: currentDestinations, hasConfig } = await getMerchantDestinations({
			platform,
			merchantDomain
		});

		const previouslyEnabled = new Set(
			currentDestinations.filter((d) => d.isActive).map((d) => d.id)
		);
		const newlyEnabled = new Set(enabledDestinations);

		// Fetch all partner configs
		const partnerStmt = firmlyConfigs.prepare('SELECT key, info FROM domains_partner');
		const partnerResult = await partnerStmt.all();

		// Build map of current configs
		const partnerConfigMap = new Map();
		for (const row of partnerResult.results || []) {
			try {
				partnerConfigMap.set(row.key, {
					key: row.key,
					info: JSON.parse(row.info)
				});
			} catch {
				continue;
			}
		}

		// For each destination in app_identifiers, update the domains_partner entry
		const destinationsStmt = firmlyConfigs.prepare('SELECT key, info FROM app_identifiers');
		const allDestinations = await destinationsStmt.all();

		for (const destRow of allDestinations.results || []) {
			const destId = destRow.key;
			let destInfo = {};
			try {
				destInfo = JSON.parse(destRow.info || '{}');
			} catch {
				// Ignore parse errors
			}
			const destName = destInfo.subject || destId;
			const shouldEnable = newlyEnabled.has(destId);
			const wasEnabled = previouslyEnabled.has(destId);

			// Skip if no change
			if (shouldEnable === wasEnabled) continue;

			// Get or create partner config
			let partnerData = partnerConfigMap.get(destId);

			if (!partnerData) {
				// Create new entry for this destination
				partnerData = {
					key: destId,
					info: {
						merchants: {}
					}
				};
			}

			// Ensure merchants object exists
			if (!partnerData.info.merchants) {
				partnerData.info.merchants = {};
			}

			// Update merchant status
			if (shouldEnable) {
				partnerData.info.merchants[merchantDomain] = true;
			} else {
				delete partnerData.info.merchants[merchantDomain];
			}

			// Upsert the domains_partner entry
			const upsertStmt = firmlyConfigs.prepare(`
				INSERT INTO domains_partner (key, info)
				VALUES (?, ?)
				ON CONFLICT(key) DO UPDATE SET info = excluded.info
			`);
			await upsertStmt.bind(destId, JSON.stringify(partnerData.info)).run();

			// Create audit log for the change
			if (actor) {
				await createAuditLog({
					platform,
					merchantDomain,
					eventType: shouldEnable
						? AuditEventTypes.DESTINATION_ENABLED
						: AuditEventTypes.DESTINATION_DISABLED,
					actorId: actor.id,
					actorEmail: actor.email,
					details: { destinationId: destId, destinationName: destName }
				});
			}
		}

		// Update the onboarding status for destinations
		const isFirstTimeSave = !hasConfig;
		try {
			await fetchMerchantDO(platform, merchantDomain, '/onboarding/destinations', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					completed: true,
					userId: actor?.id,
					userEmail: actor?.email
				})
			});
		} catch (onboardingError) {
			console.error('Error updating destinations onboarding status:', onboardingError);
			// Continue - the destinations were still updated
		}

		// Create audit log for first-time configuration (onboarding completion)
		if (isFirstTimeSave && actor) {
			await createAuditLog({
				platform,
				merchantDomain,
				eventType: AuditEventTypes.DESTINATIONS_CONFIGURED,
				actorId: actor.id,
				actorEmail: actor.email,
				details: {
					enabledDestinations: [...newlyEnabled]
				},
				isFirmlyAdmin: actor.isFirmlyAdmin || false,
				actorType: getActorType(actor)
			});
		}

		return {
			success: true,
			isFirstTimeSave
		};
	} catch (error) {
		console.error('Error updating merchant destinations:', error);
		return { success: false, error: error.message };
	}
}

// ============================================================================
// Catalog Configuration Functions
// ============================================================================

/**
 * Get the catalog configuration for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} { catalogType, hasExistingConfig, ... }
 */
export async function getCatalogConfig({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/catalog-config');

		if (!response.ok) {
			console.error('Failed to get catalog config:', await response.text());
			return { hasExistingConfig: false, catalogType: null };
		}

		return response.json();
	} catch (error) {
		console.error('Error getting catalog config:', error);
		return { hasExistingConfig: false, catalogType: null };
	}
}

/**
 * Check if merchant has configured their catalog.
 * Used for onboarding progress tracking.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<boolean>} True if catalog is configured
 */
export async function checkCatalogConfigured({ platform, merchantDomain }) {
	try {
		const config = await getCatalogConfig({ platform, merchantDomain });
		return config.hasExistingConfig === true;
	} catch (error) {
		console.error('Error checking catalog configured:', error);
		return false;
	}
}

/**
 * Save the catalog configuration for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.catalogType - 'full' or 'subset'
 * @param {Object} params.actor - Actor info { id, email }
 * @returns {Promise<Object>} { success: boolean, isFirstTimeSave: boolean, error?: string }
 */
export async function saveCatalogConfig({ platform, merchantDomain, catalogType, actor }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/catalog-config', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				catalogType,
				userId: actor.id,
				userEmail: actor.email
			})
		});

		const data = await response.json();

		if (!response.ok) {
			return { success: false, error: data.error || 'Failed to save catalog config' };
		}

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: 'catalog_configured',
			actorId: actor.id,
			actorEmail: actor.email,
			details: { catalogType, isFirstTimeSave: data.isFirstTimeSave }
		});

		return {
			success: true,
			isFirstTimeSave: data.isFirstTimeSave
		};
	} catch (error) {
		console.error('Error saving catalog config:', error);
		return { success: false, error: error.message };
	}
}

// ============================================================================
// Integration Steps Functions
// ============================================================================

/**
 * Get integration steps status for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Array>} Array of integration step records from database
 */
export async function getIntegrationSteps({ platform, merchantDomain }) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/integration-steps');

		if (!response.ok) {
			console.error('Failed to get integration steps:', await response.text());
			return [];
		}

		return response.json();
	} catch (error) {
		console.error('Error getting integration steps:', error);
		return [];
	}
}

/**
 * Update an integration step status (admin action).
 * Automatically syncs the onboarding integration status when all steps are completed.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {string} params.stepId - Step identifier
 * @param {string|null} params.substepId - Substep identifier (null for top-level steps)
 * @param {string} params.status - New status ('pending', 'in-progress', 'completed')
 * @param {Object|null} params.actor - Actor info { id, email } (null for API-triggered changes)
 * @param {boolean} params.isFirmlyAdmin - Whether actor is a Firmly admin
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function updateIntegrationStep({
	platform,
	merchantDomain,
	stepId,
	substepId = null,
	status,
	actor = null,
	isFirmlyAdmin = false
}) {
	try {
		const response = await fetchMerchantDO(platform, merchantDomain, '/integration-steps', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				stepId,
				substepId,
				status,
				completedBy: actor?.email || null,
				source: actor ? 'admin' : 'api'
			})
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('Failed to update integration step:', error);
			return { success: false, error };
		}

		// Create audit log
		const eventType =
			status === 'completed'
				? AuditEventTypes.INTEGRATION_STEP_COMPLETED
				: AuditEventTypes.INTEGRATION_STEP_UPDATED;

		await createAuditLog({
			platform,
			merchantDomain,
			eventType,
			actorId: actor?.id || 'system',
			actorEmail: actor?.email || 'system@firmly.com',
			details: { stepId, substepId, status, source: actor ? 'admin' : 'api' },
			isFirmlyAdmin
		});

		// Auto-sync onboarding integration status based on step completion
		await syncOnboardingIntegrationStatus({
			platform,
			merchantDomain,
			actor,
			isFirmlyAdmin
		});

		return { success: true };
	} catch (error) {
		console.error('Error updating integration step:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Sync the onboarding integration status based on integration steps completion.
 * Sets integration as complete when all steps are done, or in-progress otherwise.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object|null} params.actor - Actor info { id, email }
 * @param {boolean} params.isFirmlyAdmin - Whether actor is a Firmly admin
 * @returns {Promise<void>}
 */
async function syncOnboardingIntegrationStatus({ platform, merchantDomain, actor, isFirmlyAdmin }) {
	try {
		// Fetch current integration steps
		const dbSteps = await getIntegrationSteps({ platform, merchantDomain });

		// Build status to check completion
		const integrationStatus = buildIntegrationStatus(dbSteps, INTEGRATION_STEPS);

		// Check current onboarding integration status
		const currentlyComplete = await checkIntegrationComplete({ platform, merchantDomain });

		// Sync if status changed
		if (integrationStatus.isComplete && !currentlyComplete) {
			// All steps completed - mark integration as complete
			await setIntegrationComplete({
				platform,
				merchantDomain,
				completed: true,
				actor: actor
					? { ...actor, isFirmlyAdmin }
					: { id: 'system', email: 'system@firmly.com', isFirmlyAdmin }
			});
		} else if (!integrationStatus.isComplete && currentlyComplete) {
			// Steps no longer all complete - mark integration as in-progress
			await setIntegrationComplete({
				platform,
				merchantDomain,
				completed: false,
				actor: actor
					? { ...actor, isFirmlyAdmin }
					: { id: 'system', email: 'system@firmly.com', isFirmlyAdmin }
			});
		}
	} catch (error) {
		// Log but don't fail the main operation
		console.error('Error syncing onboarding integration status:', error);
	}
}

/**
 * Sync integration steps from external Control Panel API.
 * Called on component mount and manual sync trigger.
 *
 * Applies forward-only constraint: steps can only progress, never regress.
 * Status mapping:
 * - COMPLETE → completed
 * - IN_PROGRESS → in-progress (if not already completed)
 * - PENDING → pending (if not already in-progress or completed)
 * - NOT_STARTED → pending (if not already in-progress or completed)
 * - BLOCKED/BROKEN → in-progress (if not already completed)
 * - NOT_NEEDED/NOT_SUPPORTED → skipped
 *
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} { success: boolean, steps: Array, error?: string, updatedCount?: number }
 */
export async function syncIntegrationSteps({ platform, merchantDomain }) {
	try {
		// 1. Get current integration steps from database
		const currentSteps = await getIntegrationSteps({ platform, merchantDomain });

		// Create a map for quick lookup of current statuses
		const currentStatusMap = new Map();
		for (const record of currentSteps) {
			const key = record.substep_id
				? `${record.step_id}:${record.substep_id}`
				: record.step_id;
			currentStatusMap.set(key, record.status || 'pending');
		}

		// 2. Fetch external status from Control Panel API
		const externalResult = await fetchExternalIntegrationStatus({
			platform,
			merchantDomain
		});

		// If fetch failed or merchant not found, return current status without changes
		if (!externalResult.success || externalResult.notFound || !externalResult.data) {
			if (externalResult.error) {
				console.warn(
					`External sync skipped for ${merchantDomain}: ${externalResult.error}`
				);
			}
			return { success: true, steps: currentSteps };
		}

		// 3. Transform external status to internal format
		const externalSteps = transformExternalStatus(externalResult.data);

		// 4. Apply forward-only constraint and collect updates
		const updates = [];
		for (const externalStep of externalSteps) {
			const key = externalStep.substepId
				? `${externalStep.stepId}:${externalStep.substepId}`
				: externalStep.stepId;

			const currentStatus = currentStatusMap.get(key) || 'pending';
			const newStatus = externalStep.status;

			// Only update if it's a forward transition
			if (isForwardTransition(currentStatus, newStatus)) {
				updates.push({
					stepId: externalStep.stepId,
					substepId: externalStep.substepId,
					status: newStatus,
					source: 'external'
				});
			}
		}

		// 5. Apply updates to database via MerchantDO
		let updatedCount = 0;
		for (const update of updates) {
			try {
				const response = await fetchMerchantDO(
					platform,
					merchantDomain,
					'/integration-steps',
					{
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							stepId: update.stepId,
							substepId: update.substepId,
							status: update.status,
							completedBy: null,
							source: update.source
						})
					}
				);

				if (response.ok) {
					updatedCount++;
				} else {
					console.error(
						`Failed to update step ${update.stepId}: ${await response.text()}`
					);
				}
			} catch (updateError) {
				console.error(`Error updating step ${update.stepId}:`, updateError);
			}
		}

		// 6. Create audit log if any steps were updated
		if (updatedCount > 0) {
			await createAuditLog({
				platform,
				merchantDomain,
				eventType: AuditEventTypes.INTEGRATION_STEPS_SYNCED,
				actorId: 'system',
				actorEmail: 'system@firmly.com',
				details: { updatedSteps: updatedCount, source: 'external_api' },
				isFirmlyAdmin: true, // Hide from regular users - internal system event
				actorType: 'system'
			});

			// Sync onboarding integration status
			await syncOnboardingIntegrationStatus({
				platform,
				merchantDomain,
				actor: null,
				isFirmlyAdmin: false
			});
		}

		// 7. Fetch and return updated steps
		const updatedSteps = await getIntegrationSteps({ platform, merchantDomain });
		return { success: true, steps: updatedSteps, updatedCount };
	} catch (error) {
		console.error('Error syncing integration steps:', error);
		// On error, try to return current status
		try {
			const fallbackSteps = await getIntegrationSteps({ platform, merchantDomain });
			return { success: false, error: error.message, steps: fallbackSteps };
		} catch {
			return { success: false, error: error.message, steps: [] };
		}
	}
}

// ============================================================================
// Admin Operations
// ============================================================================

/**
 * Reset a merchant dashboard (admin operation).
 * Clears all MerchantDO data and updates D1 metadata.
 * Also removes merchant access from affected users' DashUserDO.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @returns {Promise<Object>} { success: boolean, clearedTeamMembers: Array, error?: string }
 */
export async function resetMerchantDashboard({ platform, merchantDomain, actor }) {
	try {
		// 1. Reset MerchantDO (clears team, audit logs, agreement, onboarding, catalog, integration)
		const resetResponse = await fetchMerchantDO(platform, merchantDomain, '/reset', {
			method: 'POST'
		});

		if (!resetResponse.ok) {
			const error = await resetResponse.text();
			console.error('Failed to reset MerchantDO:', error);
			return { success: false, error: 'Failed to reset merchant data' };
		}

		const { clearedTeamMembers, clearedPendingInvites } = await resetResponse.json();

		// 2. Remove merchant access from each affected user's DashUserDO (in parallel)
		await Promise.all(
			clearedTeamMembers.map(async (member) => {
				try {
					const response = await fetchDashUserDO(
						platform,
						member.user_id,
						`/merchant-access/${encodeURIComponent(merchantDomain)}`,
						{ method: 'DELETE' }
					);
					if (!response.ok) {
						const errorText = await response.text();
						console.error(
							`Failed to remove merchant access for user ${member.user_id}: ${response.status} - ${errorText}`
						);
					}
				} catch (userError) {
					console.error(
						`Failed to remove merchant access for user ${member.user_id}:`,
						userError
					);
					// Continue with other users even if one fails
				}
			})
		);

		// 2b. Remove pending invites from invitees' DashUserDOs (if they have accounts)
		if (clearedPendingInvites && clearedPendingInvites.length > 0) {
			const db = platform?.env?.dashUsers;
			if (db) {
				await Promise.all(
					clearedPendingInvites.map(async (invite) => {
						try {
							// Look up user by email to see if they have an account
							const userResult = await db
								.prepare('SELECT id FROM users WHERE email = ?')
								.bind(invite.email.toLowerCase())
								.first();

							if (userResult?.id) {
								const response = await fetchDashUserDO(
									platform,
									userResult.id,
									`/pending-invites/${encodeURIComponent(invite.token)}`,
									{ method: 'DELETE' }
								);
								if (!response.ok && response.status !== 404) {
									const errorText = await response.text();
									console.error(
										`Failed to remove pending invite for ${invite.email}: ${response.status} - ${errorText}`
									);
								}
							}
						} catch (inviteError) {
							console.error(
								`Failed to remove pending invite for ${invite.email}:`,
								inviteError
							);
							// Continue with other invites even if one fails
						}
					})
				);
			}
		}

		// 2c. Safety net: Also clear owner from D1 owner_user_id (in case they weren't in team table)
		// This handles legacy data where owner was added via grantMerchantAccess() without addTeamMember()
		const db = platform?.env?.dashUsers;
		if (db) {
			// Get owner_user_id BEFORE we clear it
			const ownerData = await db
				.prepare('SELECT owner_user_id FROM merchant_dashboards WHERE domain = ?')
				.bind(merchantDomain)
				.first();

			if (ownerData?.owner_user_id) {
				// Check if this owner was already in clearedTeamMembers
				const ownerAlreadyCleared = clearedTeamMembers.some(
					(m) => m.user_id === ownerData.owner_user_id
				);

				if (!ownerAlreadyCleared) {
					// Owner not in team table - clear their DashUserDO access
					try {
						await fetchDashUserDO(
							platform,
							ownerData.owner_user_id,
							`/merchant-access/${encodeURIComponent(merchantDomain)}`,
							{ method: 'DELETE' }
						);
					} catch (ownerError) {
						console.error(
							`Failed to remove merchant access for owner ${ownerData.owner_user_id}:`,
							ownerError
						);
					}
				}
			}
		}

		// 3. Update D1 merchant_dashboards metadata (including KYB and Go Live reset)
		if (db) {
			await db
				.prepare(
					`UPDATE merchant_dashboards
					 SET owner_user_id = NULL,
					     status = 'pending',
					     info = NULL,
					     kyb_status = NULL,
					     kyb_submitted_at = NULL,
					     kyb_reviewed_at = NULL,
					     kyb_reviewed_by = NULL,
					     kyb_rejection_notes = NULL,
					     go_live_status = NULL,
					     go_live_submitted_at = NULL,
					     go_live_reviewed_at = NULL,
					     go_live_reviewed_by = NULL,
					     go_live_rejection_notes = NULL
					 WHERE domain = ?`
				)
				.bind(merchantDomain)
				.run();
		}

		// 4. Cancel any pending invites in KV
		const kv = platform?.env?.OTP_STORE;
		if (kv) {
			// Delete admin invite token (old flow)
			const existingToken = await kv.get(`invite-domain:${merchantDomain}`);
			if (existingToken) {
				await kv.delete(`invite:${existingToken}`);
				await kv.delete(`invite-domain:${merchantDomain}`);
			}

			// Delete all team invite tokens
			if (clearedPendingInvites && clearedPendingInvites.length > 0) {
				await Promise.all(
					clearedPendingInvites.map((invite) => kv.delete(`invite:${invite.token}`))
				);
			}
		}

		// 5. Create audit log for the reset (in a fresh audit_logs table)
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: 'dashboard_reset',
			actorId: actor.id,
			actorEmail: actor.email,
			details: {
				clearedTeamMembersCount: clearedTeamMembers.length,
				clearedEmails: clearedTeamMembers.map((m) => m.user_email)
			},
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return { success: true, clearedTeamMembers };
	} catch (error) {
		console.error('Error resetting merchant dashboard:', error);
		return { success: false, error: error.message };
	}
}

// ============================================================================
// KYB (Know Your Business) Functions
// ============================================================================

/**
 * Get KYB status for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} KYB status object
 */
export async function getKYBStatus({ platform, merchantDomain }) {
	try {
		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		const result = await db
			.prepare(
				`SELECT kyb_status, kyb_submitted_at, kyb_reviewed_at, kyb_reviewed_by, kyb_rejection_notes
				 FROM merchant_dashboards
				 WHERE domain = ?`
			)
			.bind(merchantDomain)
			.first();

		if (!result) {
			return {
				kyb_status: null,
				kyb_submitted_at: null,
				kyb_reviewed_at: null,
				kyb_reviewed_by: null,
				kyb_rejection_notes: null
			};
		}

		return result;
	} catch (error) {
		console.error('Error getting KYB status:', error);
		return {
			kyb_status: null,
			kyb_submitted_at: null,
			kyb_reviewed_at: null,
			kyb_reviewed_by: null,
			kyb_rejection_notes: null
		};
	}
}

/**
 * Submit KYB for review.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function submitKYB({ platform, merchantDomain, actor }) {
	try {
		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		// Update KYB status to pending
		await db
			.prepare(
				`UPDATE merchant_dashboards
				 SET kyb_status = 'pending',
				     kyb_submitted_at = datetime('now'),
				     kyb_rejection_notes = NULL
				 WHERE domain = ?`
			)
			.bind(merchantDomain)
			.run();

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.KYB_SUBMITTED,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { submittedAt: new Date().toISOString() }
		});

		return { success: true };
	} catch (error) {
		console.error('Error submitting KYB:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Approve KYB (admin only).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @param {string} params.notes - Optional notes
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function approveKYB({ platform, merchantDomain, actor, notes = null }) {
	try {
		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		// Update KYB status to approved
		await db
			.prepare(
				`UPDATE merchant_dashboards
				 SET kyb_status = 'approved',
				     kyb_reviewed_at = datetime('now'),
				     kyb_reviewed_by = ?,
				     kyb_rejection_notes = NULL
				 WHERE domain = ?`
			)
			.bind(actor.email, merchantDomain)
			.run();

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.KYB_APPROVED,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { notes },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return { success: true };
	} catch (error) {
		console.error('Error approving KYB:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Reject KYB (admin only).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @param {string} params.notes - Rejection reason (required)
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function rejectKYB({ platform, merchantDomain, actor, notes }) {
	try {
		if (!notes) {
			return { success: false, error: 'Rejection notes are required' };
		}

		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		// Update KYB status to rejected
		await db
			.prepare(
				`UPDATE merchant_dashboards
				 SET kyb_status = 'rejected',
				     kyb_reviewed_at = datetime('now'),
				     kyb_reviewed_by = ?,
				     kyb_rejection_notes = ?
				 WHERE domain = ?`
			)
			.bind(actor.email, notes, merchantDomain)
			.run();

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.KYB_REJECTED,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { notes },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return { success: true };
	} catch (error) {
		console.error('Error rejecting KYB:', error);
		return { success: false, error: error.message };
	}
}

// ============================================================================
// Go Live Approval Functions
// ============================================================================

/**
 * Get Go Live status for a merchant.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @returns {Promise<Object>} Go Live status object
 */
export async function getGoLiveStatus({ platform, merchantDomain }) {
	try {
		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		const result = await db
			.prepare(
				`SELECT go_live_status, go_live_submitted_at, go_live_reviewed_at, go_live_reviewed_by, go_live_rejection_notes
				 FROM merchant_dashboards
				 WHERE domain = ?`
			)
			.bind(merchantDomain)
			.first();

		if (!result) {
			return {
				go_live_status: null,
				go_live_submitted_at: null,
				go_live_reviewed_at: null,
				go_live_reviewed_by: null,
				go_live_rejection_notes: null
			};
		}

		return result;
	} catch (error) {
		console.error('Error getting Go Live status:', error);
		return {
			go_live_status: null,
			go_live_submitted_at: null,
			go_live_reviewed_at: null,
			go_live_reviewed_by: null,
			go_live_rejection_notes: null
		};
	}
}

/**
 * Submit Go Live for review.
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function submitGoLive({ platform, merchantDomain, actor }) {
	try {
		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		// Update Go Live status to pending
		await db
			.prepare(
				`UPDATE merchant_dashboards
				 SET go_live_status = 'pending',
				     go_live_submitted_at = datetime('now'),
				     go_live_rejection_notes = NULL
				 WHERE domain = ?`
			)
			.bind(merchantDomain)
			.run();

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.GO_LIVE_SUBMITTED,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { submittedAt: new Date().toISOString() }
		});

		return { success: true };
	} catch (error) {
		console.error('Error submitting Go Live:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Approve Go Live (admin only).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @param {string} params.notes - Optional notes
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function approveGoLive({ platform, merchantDomain, actor, notes = null }) {
	try {
		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		// Update Go Live status to approved
		await db
			.prepare(
				`UPDATE merchant_dashboards
				 SET go_live_status = 'approved',
				     go_live_reviewed_at = datetime('now'),
				     go_live_reviewed_by = ?,
				     go_live_rejection_notes = NULL
				 WHERE domain = ?`
			)
			.bind(actor.email, merchantDomain)
			.run();

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.GO_LIVE_APPROVED,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { notes },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return { success: true };
	} catch (error) {
		console.error('Error approving Go Live:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Reject Go Live (admin only).
 * @param {Object} params
 * @param {Object} params.platform - SvelteKit platform object
 * @param {string} params.merchantDomain - Merchant domain
 * @param {Object} params.actor - Actor info { id, email }
 * @param {string} params.notes - Rejection reason (required)
 * @returns {Promise<Object>} { success: boolean, error?: string }
 */
export async function rejectGoLive({ platform, merchantDomain, actor, notes }) {
	try {
		if (!notes) {
			return { success: false, error: 'Rejection notes are required' };
		}

		const db = platform?.env?.dashUsers;
		if (!db) {
			throw new Error('dashUsers D1 binding not configured');
		}

		// Update Go Live status to rejected
		await db
			.prepare(
				`UPDATE merchant_dashboards
				 SET go_live_status = 'rejected',
				     go_live_reviewed_at = datetime('now'),
				     go_live_reviewed_by = ?,
				     go_live_rejection_notes = ?
				 WHERE domain = ?`
			)
			.bind(actor.email, notes, merchantDomain)
			.run();

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain,
			eventType: AuditEventTypes.GO_LIVE_REJECTED,
			actorId: actor.id,
			actorEmail: actor.email,
			details: { notes },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return { success: true };
	} catch (error) {
		console.error('Error rejecting Go Live:', error);
		return { success: false, error: error.message };
	}
}
