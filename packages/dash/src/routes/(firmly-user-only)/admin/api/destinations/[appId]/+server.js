import { json } from '@sveltejs/kit';
import {
	createDestinationAuditLog,
	DestinationAuditEventTypes,
	getDestinationTeam,
	removeDestinationTeamMember
} from '$lib/server/destination.js';

/**
 * DELETE /admin/api/destinations/[appId]
 * Reset a destination dashboard - removes all team members and resets status.
 */
export async function DELETE({ params, locals, platform }) {
	const { appId } = params;
	const { authInfo } = locals;

	if (!authInfo?.oid || !authInfo?.email) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!appId) {
		return json({ error: 'App ID is required' }, { status: 400 });
	}

	const db = platform?.env?.dashUsers;
	const kv = platform?.env?.OTP_STORE;

	if (!db) {
		return json({ error: 'Database not configured' }, { status: 500 });
	}

	try {
		// Get current team members to remove them
		const team = await getDestinationTeam({ platform, appId });
		let clearedTeamMembers = 0;

		// Remove each team member (dual-write: removes from DestinationDO and DashUserDO)
		for (const member of team) {
			const removed = await removeDestinationTeamMember({
				platform,
				appId,
				userId: member.user_id,
				userEmail: member.email,
				role: member.role,
				actor: {
					id: authInfo.oid,
					email: authInfo.email,
					isFirmlyAdmin: true,
					role: 'owner'
				},
				targetEmail: member.email
			});

			if (removed) {
				clearedTeamMembers++;
			}
		}

		// Cancel any pending invites
		if (kv) {
			const token = await kv.get(`invite-destination:${appId}`);
			if (token) {
				await kv.delete(`invite:${token}`);
				await kv.delete(`invite-destination:${appId}`);
			}
		}

		// Reset the destination_dashboards entry
		await db
			.prepare(
				`UPDATE destination_dashboards
				 SET owner_user_id = NULL, status = 'pending', info = NULL
				 WHERE app_id = ?`
			)
			.bind(appId)
			.run();

		// Create audit log
		await createDestinationAuditLog({
			platform,
			appId,
			eventType: DestinationAuditEventTypes.SETTINGS_UPDATED,
			actorId: authInfo.oid,
			actorEmail: authInfo.email,
			details: { action: 'dashboard_reset', clearedTeamMembers },
			isFirmlyAdmin: true,
			actorType: 'firmly_admin'
		});

		return json({
			success: true,
			clearedTeamMembers
		});
	} catch (error) {
		console.error('Error resetting destination dashboard:', error);
		return json({ error: 'Failed to reset dashboard' }, { status: 500 });
	}
}
