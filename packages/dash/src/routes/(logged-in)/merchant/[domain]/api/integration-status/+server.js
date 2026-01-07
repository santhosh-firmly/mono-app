import { json } from '@sveltejs/kit';
import { getMerchantAccess } from '$lib/server/user.js';
import { syncIntegrationSteps } from '$lib/server/merchant.js';
import { INTEGRATION_STEPS, buildIntegrationStatus } from '$lib/integration-steps.js';

/**
 * GET /merchant/[domain]/api/integration-status
 * Fetch current integration status. Syncs from external API on every call.
 */
export async function GET({ locals, params, platform }) {
	const { userId, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	try {
		// Verify access
		if (!isFirmlyAdmin) {
			const merchantAccess = await getMerchantAccess({ platform, userId });
			const hasAccess = merchantAccess.some((a) => a.merchant_domain === domain);

			if (!hasAccess) {
				return json({ error: 'Access denied' }, { status: 403 });
			}
		}

		// Sync from external API (placeholder) and get current status
		const { steps: dbSteps } = await syncIntegrationSteps({ platform, merchantDomain: domain });

		// Build full status with step definitions
		const status = buildIntegrationStatus(dbSteps, INTEGRATION_STEPS);

		return json({
			steps: status.steps,
			completedSteps: status.completedSteps,
			totalSteps: status.totalSteps,
			overallProgress: status.overallProgress,
			isComplete: status.isComplete
		});
	} catch (error) {
		console.error('Error fetching integration status:', error);
		return json({ error: 'Failed to fetch integration status' }, { status: 500 });
	}
}
