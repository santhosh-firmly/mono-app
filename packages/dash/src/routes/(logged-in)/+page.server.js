import { redirect } from '@sveltejs/kit';
import { getMerchantAccess, getProfile, getPendingInvites } from '$lib/server/user.js';
import { getDestinationAccess } from '$lib/server/destination.js';

/**
 * Load function for the dashboard landing page.
 * Implements smart redirect: if user has only 1 dashboard, redirect directly to it.
 * Shows both merchant and destination dashboards.
 * Firmly admins see all merchant and destination dashboards.
 */
export async function load({ locals, platform }) {
	const { userId, email, isFirmlyAdmin } = locals.session;

	// Firmly admins see all merchant and destination dashboards
	if (isFirmlyAdmin) {
		const authInfo = locals.authInfo || {};
		const configDb = platform?.env?.firmlyConfigs;

		let allMerchants = [];
		let allDestinations = [];

		if (configDb) {
			try {
				// Fetch merchants
				const { results: merchantResults } = await configDb
					.prepare('SELECT key, info FROM stores ORDER BY key ASC')
					.all();
				allMerchants = (merchantResults || []).map((r) => {
					const storeInfo = JSON.parse(r.info || '{}');
					return {
						type: 'merchant',
						domain: r.key,
						displayName: storeInfo.display_name || r.key,
						role: 'owner',
						grantedAt: null
					};
				});

				// Fetch destinations
				const { results: destResults } = await configDb
					.prepare('SELECT key, info FROM app_identifiers ORDER BY key ASC')
					.all();
				allDestinations = (destResults || []).map((r) => {
					const destInfo = JSON.parse(r.info || '{}');
					return {
						type: 'destination',
						appId: r.key,
						displayName: destInfo.subject || r.key,
						role: 'owner',
						grantedAt: null
					};
				});
			} catch (error) {
				console.error('Error fetching dashboards for admin:', error);
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
			destinations: allDestinations,
			isFirmlyAdmin: true
		};
	}

	// Regular user flow
	const [merchantAccess, destinationAccess, pendingInvites] = await Promise.all([
		getMerchantAccess({ platform, userId }),
		getDestinationAccess({ platform, userId }),
		getPendingInvites({ platform, userId })
	]);

	const totalDashboards = merchantAccess.length + destinationAccess.length;

	// Smart redirect: if only 1 dashboard (merchant or destination) and no pending invites
	if (totalDashboards === 1 && pendingInvites.length === 0) {
		if (merchantAccess.length === 1) {
			const domain = merchantAccess[0].merchant_domain;
			redirect(302, `/merchant/${domain}`);
		} else if (destinationAccess.length === 1) {
			const appId = destinationAccess[0].app_id;
			redirect(302, `/destination/${appId}`);
		}
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
			type: 'merchant',
			domain: access.merchant_domain,
			role: access.role,
			grantedAt: access.granted_at
		})),
		destinations: destinationAccess.map((access) => ({
			type: 'destination',
			appId: access.app_id,
			displayName: access.display_name || access.app_id,
			role: access.role,
			grantedAt: access.granted_at
		})),
		pendingInvites,
		isFirmlyAdmin: false
	};
}
