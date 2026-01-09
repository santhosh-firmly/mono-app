import { redirect } from '@sveltejs/kit';
import { getDestinationAuditLogs } from '$lib/server/destination.js';

/**
 * Load function for the audit logs page.
 * Only accessible by owners and Firmly admins.
 * Firmly admin actions are only visible to Firmly admins.
 */
export async function load({ locals, params, platform, parent, url }) {
	const { app_id: appId } = params;
	const { isFirmlyAdmin } = locals.session || {};

	// Get parent data which includes userRole (already verified access)
	const parentData = await parent();
	const isOwner = parentData.userRole === 'owner';

	// Redirect non-owners (unless they're Firmly admins)
	if (!isOwner && !isFirmlyAdmin) {
		throw redirect(302, `/destination/${appId}`);
	}

	// Parse pagination from URL
	const page = parseInt(url.searchParams.get('page') || '1', 10);
	const limit = 25;
	const offset = (page - 1) * limit;

	// Get audit logs from DestinationDO
	// Firmly admins see all logs, regular users don't see admin actions
	const result = await getDestinationAuditLogs({
		platform,
		appId,
		limit,
		offset,
		includeFirmlyAdmin: isFirmlyAdmin || false
	});

	const totalPages = Math.ceil(result.total / limit);

	return {
		logs: result.logs,
		total: result.total,
		currentPage: page,
		totalPages,
		limit,
		isFirmlyAdmin: isFirmlyAdmin || false
	};
}
