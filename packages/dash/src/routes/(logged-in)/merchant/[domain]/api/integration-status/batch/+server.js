import { json } from '@sveltejs/kit';
import { updateIntegrationStep, checkIntegrationComplete } from '$lib/server/merchant.js';

/**
 * PUT /merchant/[domain]/api/integration-status/batch
 * Batch update multiple integration step statuses.
 * Body: { changes: Array<{ stepId, substepId, newStatus }> }
 *
 * Note: The onboarding integration status is automatically synced by updateIntegrationStep
 * when all integration steps are completed.
 */
export async function PUT({ locals, params, platform, request }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	// Only Firmly admins can toggle integration status
	if (!isFirmlyAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const { changes } = await request.json();

		if (!Array.isArray(changes) || changes.length === 0) {
			return json({ error: 'No changes provided' }, { status: 400 });
		}

		// Apply each change (updateIntegrationStep auto-syncs onboarding status)
		const results = [];
		for (const change of changes) {
			const { stepId, substepId, newStatus } = change;

			if (!stepId || !newStatus) {
				results.push({
					stepId,
					substepId,
					success: false,
					error: 'Missing stepId or newStatus'
				});
				continue;
			}

			if (!['pending', 'in-progress', 'completed'].includes(newStatus)) {
				results.push({ stepId, substepId, success: false, error: 'Invalid status' });
				continue;
			}

			const result = await updateIntegrationStep({
				platform,
				merchantDomain: domain,
				stepId,
				substepId: substepId || null,
				status: newStatus,
				actor: { id: userId, email },
				isFirmlyAdmin: true
			});

			results.push({ stepId, substepId, success: result.success, error: result.error });
		}

		// Check current integration completion status (for response only)
		const allCompleted = await checkIntegrationComplete({ platform, merchantDomain: domain });

		const successCount = results.filter((r) => r.success).length;

		return json({
			success: successCount === changes.length,
			applied: successCount,
			total: changes.length,
			allCompleted,
			results
		});
	} catch (error) {
		console.error('Error batch updating integration steps:', error);
		return json({ error: 'Failed to update integration steps' }, { status: 500 });
	}
}
