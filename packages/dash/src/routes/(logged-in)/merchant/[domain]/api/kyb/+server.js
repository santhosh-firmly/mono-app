import { json } from '@sveltejs/kit';
import { submitKYB, getKYBStatus } from '$lib/server/merchant.js';
import { getMerchantAccess } from '$lib/server/user.js';

/**
 * GET /merchant/[domain]/api/kyb
 * Get the current KYB status for the merchant.
 */
export async function GET({ locals, params, platform }) {
	const { userId } = locals.session;
	const { domain } = params;

	// Check access (any role can view KYB status)
	const merchantAccess = await getMerchantAccess({ platform, userId });
	const access = merchantAccess.find((a) => a.merchant_domain === domain);

	if (!access && !locals.session.isFirmlyAdmin) {
		return json({ error: 'Access denied' }, { status: 403 });
	}

	const status = await getKYBStatus({ platform, merchantDomain: domain });
	return json(status);
}

/**
 * POST /merchant/[domain]/api/kyb
 * Submit KYB for review (owners only).
 */
export async function POST({ locals, params, platform }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { domain } = params;

	// Check access - only owners can submit KYB
	if (!isFirmlyAdmin) {
		const merchantAccess = await getMerchantAccess({ platform, userId });
		const access = merchantAccess.find((a) => a.merchant_domain === domain);

		if (!access) {
			return json({ error: 'Access denied' }, { status: 403 });
		}

		if (access.role !== 'owner') {
			return json({ error: 'Only owners can submit KYB' }, { status: 403 });
		}
	}

	// Check if company info is filled (basic validation)
	const dashUsers = platform?.env?.dashUsers;
	if (dashUsers) {
		const dashboardRow = await dashUsers
			.prepare('SELECT info FROM merchant_dashboards WHERE domain = ?')
			.bind(domain)
			.first();

		if (dashboardRow?.info) {
			const companyInfo = JSON.parse(dashboardRow.info);
			const company = companyInfo.company || {};
			const contact = companyInfo.contact || {};

			// Require at least company name and contact info
			if (!company.name?.trim()) {
				return json({ error: 'Company name is required' }, { status: 400 });
			}
			if (!contact.name?.trim()) {
				return json({ error: 'Contact name is required' }, { status: 400 });
			}
			if (!contact.email?.trim()) {
				return json({ error: 'Contact email is required' }, { status: 400 });
			}
		} else {
			return json(
				{ error: 'Please fill in your company information first' },
				{ status: 400 }
			);
		}
	}

	// Check if already pending or approved
	const currentStatus = await getKYBStatus({ platform, merchantDomain: domain });
	if (currentStatus.kyb_status === 'pending') {
		return json({ error: 'KYB is already pending review' }, { status: 400 });
	}
	if (currentStatus.kyb_status === 'approved') {
		return json({ error: 'KYB has already been approved' }, { status: 400 });
	}

	// Submit KYB
	const result = await submitKYB({
		platform,
		merchantDomain: domain,
		actor: { id: userId, email }
	});

	if (!result.success) {
		return json({ error: result.error || 'Failed to submit KYB' }, { status: 500 });
	}

	return json({ success: true });
}
