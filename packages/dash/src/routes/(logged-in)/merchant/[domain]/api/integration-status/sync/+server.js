import { json } from '@sveltejs/kit';
import { syncIntegrationSteps } from '$lib/server/merchant.js';
import { INTEGRATION_STEPS, buildIntegrationStatus } from '$lib/integration-steps.js';

/**
 * POST /merchant/[domain]/api/integration-status/sync
 * Trigger external API sync (placeholder implementation).
 * Only Firmly admins can trigger sync.
 */
export async function POST({ locals, params, platform }) {
	const { isFirmlyAdmin } = locals.session;

	// Only Firmly admins can trigger sync
	if (!isFirmlyAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const { domain } = params;

	try {
		const {
			success,
			steps: dbSteps,
			error
		} = await syncIntegrationSteps({
			platform,
			merchantDomain: domain
		});

		if (!success) {
			return json({ error: error || 'Sync failed' }, { status: 500 });
		}

		const status = buildIntegrationStatus(dbSteps, INTEGRATION_STEPS);

		return json({
			success: true,
			steps: status.steps,
			completedSteps: status.completedSteps,
			totalSteps: status.totalSteps,
			overallProgress: status.overallProgress,
			isComplete: status.isComplete
		});
	} catch (error) {
		console.error('Error syncing integration status:', error);
		return json({ error: 'Failed to sync integration status' }, { status: 500 });
	}
}
