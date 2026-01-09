import { redirect } from '@sveltejs/kit';
import { getIntegrationSteps, getAuditLogs } from '$lib/server/merchant.js';
import { INTEGRATION_STEPS, buildIntegrationStatus } from '$lib/integration-steps.js';

/**
 * Load function for integration admin page.
 * Admin-only access.
 */
export async function load({ locals, params, platform }) {
	const { isFirmlyAdmin } = locals.session || {};
	const { domain } = params;

	// Only Firmly admins can access this page
	if (!isFirmlyAdmin) {
		redirect(302, `/merchant/${domain}`);
	}

	// Get integration steps
	const dbSteps = await getIntegrationSteps({ platform, merchantDomain: domain });
	const status = buildIntegrationStatus(dbSteps, INTEGRATION_STEPS);

	// Get audit logs filtered to integration events
	const auditResult = await getAuditLogs({
		platform,
		merchantDomain: domain,
		limit: 50,
		offset: 0,
		includeFirmlyAdmin: true
	});

	// Filter to integration-related events
	const integrationLogs = (auditResult.logs || []).filter((log) =>
		log.event_type.startsWith('integration_')
	);

	return {
		steps: status.steps,
		completedSteps: status.completedSteps,
		totalSteps: status.totalSteps,
		overallProgress: status.overallProgress,
		isComplete: status.isComplete,
		auditLogs: integrationLogs
	};
}
