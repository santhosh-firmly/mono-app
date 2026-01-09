import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { getAuditLogs } from '$lib/server/merchant.js';

/**
 * GET /merchant/[domain]/api/audit-logs
 * Get audit logs for this merchant.
 * Query params: limit (default 50), offset (default 0)
 * Only accessible by owners and Firmly admins.
 * Firmly admin actions are only visible to Firmly admins.
 */
export async function GET({ locals, params, platform, url }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Firmly admins always have access
		if (!isFirmlyAdmin) {
			// Verify current user is an owner (check DashUserDO)
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const currentAccess = merchantAccess.find((a) => a.merchant_domain === domain);
			const isOwner = currentAccess?.role === 'owner';

			if (!isOwner) {
				return json({ error: 'Only owners can view audit logs' }, { status: 403 });
			}
		}

		// Parse pagination params
		const limit = parseInt(url.searchParams.get('limit') || '50', 10);
		const offset = parseInt(url.searchParams.get('offset') || '0', 10);

		// Get audit logs from MerchantDO
		// Firmly admins see all logs, regular users don't see admin actions
		const result = await getAuditLogs({
			platform,
			merchantDomain: domain,
			limit: Math.min(limit, 100), // Cap at 100
			offset,
			includeFirmlyAdmin: isFirmlyAdmin || false
		});

		return json(result);
	} catch (error) {
		console.error('Error fetching audit logs:', error);
		return json({ error: 'Failed to fetch audit logs' }, { status: 500 });
	}
}
