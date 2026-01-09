import { json } from '@sveltejs/kit';
import { approveKYB, rejectKYB } from '$lib/server/merchant.js';

/**
 * POST /admin/api/kyb/[domain]
 * Approve or reject a merchant's KYB submission.
 * Admin only endpoint.
 */
export async function POST({ locals, params, platform, request }) {
	// Admin routes use authInfo from Azure AD, not session
	const userId = locals.authInfo?.oid || locals.authInfo?.sub || 'unknown';
	const email =
		locals.authInfo?.preferred_username || locals.authInfo?.email || 'admin@firmly.ai';
	const { domain } = params;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid request body' }, { status: 400 });
	}

	const { action, notes } = body;

	if (!action || !['approve', 'reject'].includes(action)) {
		return json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 });
	}

	const actor = { id: userId, email, isFirmlyAdmin: true };

	if (action === 'approve') {
		const result = await approveKYB({
			platform,
			merchantDomain: domain,
			actor,
			notes: notes || null
		});

		if (!result.success) {
			return json({ error: result.error || 'Failed to approve KYB' }, { status: 500 });
		}

		return json({ success: true, message: 'KYB approved successfully' });
	}

	if (action === 'reject') {
		if (!notes || !notes.trim()) {
			return json({ error: 'Notes are required for rejection' }, { status: 400 });
		}

		const result = await rejectKYB({
			platform,
			merchantDomain: domain,
			actor,
			notes
		});

		if (!result.success) {
			return json({ error: result.error || 'Failed to reject KYB' }, { status: 500 });
		}

		return json({ success: true, message: 'KYB rejected successfully' });
	}

	return json({ error: 'Invalid action' }, { status: 400 });
}
