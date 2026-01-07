import { json } from '@sveltejs/kit';
import { checkIntegrationComplete, setIntegrationComplete } from '$lib/server/merchant.js';

/**
 * GET /admin/merchants/[domain]/api/integration
 * Get the integration status for a merchant.
 */
export async function GET({ params, platform }) {
	const { domain } = params;

	try {
		const completed = await checkIntegrationComplete({
			platform,
			merchantDomain: domain
		});

		return json({ completed });
	} catch (error) {
		console.error('Error getting integration status:', error);
		return json({ error: 'Failed to get integration status' }, { status: 500 });
	}
}

/**
 * PUT /admin/merchants/[domain]/api/integration
 * Toggle the integration complete status for a merchant.
 * Body: { completed: boolean }
 */
export async function PUT({ locals, params, platform, request }) {
	// Admin routes use Azure AD auth - user info is in locals.authInfo
	const authInfo = locals.authInfo;
	const userId = authInfo?.oid || authInfo?.sub || 'admin';
	const email = authInfo?.preferred_username || authInfo?.email || 'admin@firmly.ai';
	const { domain } = params;

	try {
		const body = await request.json();
		const { completed } = body;

		if (typeof completed !== 'boolean') {
			return json({ error: 'completed must be a boolean' }, { status: 400 });
		}

		const result = await setIntegrationComplete({
			platform,
			merchantDomain: domain,
			completed,
			actor: { id: userId, email, isFirmlyAdmin: true }
		});

		if (!result.success) {
			return json(
				{ error: result.error || 'Failed to update integration status' },
				{ status: 500 }
			);
		}

		return json({ success: true, completed });
	} catch (error) {
		console.error('Error updating integration status:', error);
		return json({ error: 'Failed to update integration status' }, { status: 500 });
	}
}
