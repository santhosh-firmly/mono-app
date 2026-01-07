import { redirect } from '@sveltejs/kit';
import { getMerchantAccess, getProfile, getPendingInvites } from '$lib/server/user.js';

/**
 * Load function for the dashboard landing page.
 * Implements smart redirect: if user has only 1 dashboard, redirect directly to it.
 * Firmly admins see all merchant dashboards.
 */
export async function load({ locals, platform }) {
	const { userId, email, isFirmlyAdmin } = locals.session;

	// Firmly admins see all merchant dashboards (from stores table)
	if (isFirmlyAdmin) {
		const authInfo = locals.authInfo || {};
		const configDb = platform?.env?.firmlyConfigs;

		let allMerchants = [];
		if (configDb) {
			try {
				const { results } = await configDb
					.prepare('SELECT key, info FROM stores ORDER BY key ASC')
					.all();
				allMerchants = (results || []).map((r) => {
					const storeInfo = JSON.parse(r.info || '{}');
					return {
						domain: r.key,
						displayName: storeInfo.display_name || r.key,
						role: 'owner',
						grantedAt: null
					};
				});
			} catch (error) {
				console.error('Error fetching merchants for admin:', error);
			}
		}

		return {
			user: {
				id: userId,
				email,
				name: authInfo.name || email.split('@')[0],
				hasAvatar: false
			},
			dashboards: allMerchants,
			isFirmlyAdmin: true
		};
	}

	// Regular user flow
	const [merchantAccess, pendingInvites] = await Promise.all([
		getMerchantAccess({ platform, userId }),
		getPendingInvites({ platform, userId })
	]);

	// Smart redirect: if only 1 dashboard and no pending invites, go directly to it
	if (merchantAccess.length === 1 && pendingInvites.length === 0) {
		const domain = merchantAccess[0].merchant_domain;
		redirect(302, `/merchant/${domain}`);
	}

	// Get user profile for header
	const profile = await getProfile({ platform, userId });

	// Return dashboards for selection (0 or 2+, or has pending invites)
	return {
		user: {
			id: userId,
			email,
			name: profile.name || email,
			hasAvatar: profile.hasAvatar || false
		},
		dashboards: merchantAccess.map((access) => ({
			domain: access.merchant_domain,
			role: access.role,
			grantedAt: access.granted_at
		})),
		pendingInvites,
		isFirmlyAdmin: false
	};
}
