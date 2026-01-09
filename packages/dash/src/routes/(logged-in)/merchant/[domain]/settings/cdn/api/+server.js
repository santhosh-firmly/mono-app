import { json } from '@sveltejs/kit';
import {
	getOnboardingStatus,
	createAuditLog,
	submitGoLive,
	getGoLiveStatus
} from '$lib/server/merchant.js';
import { getMerchantAccess } from '$lib/server/user.js';

/**
 * Helper to make requests to the MerchantDO via dash-do service.
 */
async function fetchMerchantDO(platform, merchantDomain, path, options = {}) {
	const DASH_DO = platform?.env?.DASH_DO;
	if (!DASH_DO) {
		throw new Error('DASH_DO service binding not configured');
	}

	const headers = new Headers(options.headers || {});
	headers.set('X-Merchant-Domain', merchantDomain);

	return DASH_DO.fetch(`https://dash-do${path}`, {
		...options,
		headers
	});
}

/**
 * Helper to check if user is owner or Firmly admin.
 */
async function checkOwnerAccess({ locals, params, platform }) {
	const { userId, isFirmlyAdmin } = locals.session;

	if (isFirmlyAdmin) {
		return { allowed: true };
	}

	const merchantAccess = await getMerchantAccess({ platform, userId });
	const access = merchantAccess.find((a) => a.merchant_domain === params.domain);

	if (access?.role !== 'owner') {
		return { allowed: false, error: json({ error: 'Owner access required' }, { status: 403 }) };
	}

	return { allowed: true, role: access.role };
}

/**
 * GET /merchant/[domain]/settings/cdn/api
 * Get the CDN whitelisting status.
 * Only owners and Firmly admins can access.
 */
export async function GET({ locals, params, platform }) {
	// Check owner access
	const accessCheck = await checkOwnerAccess({ locals, params, platform });
	if (!accessCheck.allowed) {
		return accessCheck.error;
	}

	try {
		const status = await getOnboardingStatus({ platform, merchantDomain: params.domain });
		const cdnStatus = status?.cdn || {};

		return json({
			completed: cdnStatus.completed === true,
			completedAt: cdnStatus.completedAt || null,
			completedByEmail: cdnStatus.completedByEmail || null
		});
	} catch (error) {
		console.error('Error fetching CDN status:', error);
		return json({ error: 'Failed to fetch CDN status' }, { status: 500 });
	}
}

/**
 * POST /merchant/[domain]/settings/cdn/api
 * Mark CDN whitelisting as complete.
 * Only owners and Firmly admins can access.
 */
export async function POST({ locals, params, platform, request }) {
	// Check owner access
	const accessCheck = await checkOwnerAccess({ locals, params, platform });
	if (!accessCheck.allowed) {
		return accessCheck.error;
	}

	const { userId, email, isFirmlyAdmin } = locals.session;

	try {
		const { completed } = await request.json();

		// Check if this is the first time saving
		const currentStatus = await getOnboardingStatus({
			platform,
			merchantDomain: params.domain
		});
		const isFirstTimeSave = !currentStatus?.cdn?.completed;

		// Update the onboarding status for CDN
		const response = await fetchMerchantDO(platform, params.domain, '/onboarding/cdn', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				completed: completed === true,
				userId,
				userEmail: email
			})
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('Failed to update CDN status:', error);
			return json({ error: 'Failed to update CDN status' }, { status: 500 });
		}

		// Create audit log
		await createAuditLog({
			platform,
			merchantDomain: params.domain,
			eventType: 'cdn_whitelisting_completed',
			actorId: userId,
			actorEmail: email,
			details: { completed },
			isFirmlyAdmin,
			actorType: isFirmlyAdmin ? 'firmly_admin' : 'user'
		});

		// Auto-submit go-live request if CDN is now completed and go-live hasn't been submitted yet
		let goLiveSubmitted = false;
		if (completed === true && isFirstTimeSave) {
			const goLiveStatus = await getGoLiveStatus({
				platform,
				merchantDomain: params.domain
			});

			// Only auto-submit if go-live hasn't been submitted yet
			if (!goLiveStatus.go_live_status) {
				const goLiveResult = await submitGoLive({
					platform,
					merchantDomain: params.domain,
					actor: { id: userId, email }
				});
				goLiveSubmitted = goLiveResult.success;
			}
		}

		return json({
			success: true,
			isFirstTimeSave,
			goLiveSubmitted
		});
	} catch (error) {
		console.error('Error saving CDN status:', error);
		return json({ error: 'Failed to save CDN status' }, { status: 500 });
	}
}
