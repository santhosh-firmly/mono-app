import { json } from '@sveltejs/kit';
import { updateIntegrationStep } from '$lib/server/merchant.js';

/**
 * PUT /merchant/[domain]/api/integration-status/[stepId]
 * Admin toggle for step status.
 * Query param: ?substepId=xxx for substeps
 * Body: { status: 'pending' | 'in-progress' | 'completed' }
 */
export async function PUT({ locals, params, platform, request, url }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain, stepId } = params;
	const substepId = url.searchParams.get('substepId') || null;

	// Only Firmly admins can toggle integration status
	if (!isFirmlyAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const { status } = await request.json();

		if (!['pending', 'in-progress', 'completed'].includes(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		const result = await updateIntegrationStep({
			platform,
			merchantDomain: domain,
			stepId,
			substepId,
			status,
			actor: { id: userId, email },
			isFirmlyAdmin: true
		});

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error updating integration step:', error);
		return json({ error: 'Failed to update integration step' }, { status: 500 });
	}
}
