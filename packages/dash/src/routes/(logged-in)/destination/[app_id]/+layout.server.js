import { redirect } from '@sveltejs/kit';
import { getProfile, getPendingInvites, getMerchantAccess } from '$lib/server/user.js';
import {
	getDestinationAccess,
	getDestinationProfile,
	getAccessibleMerchants
} from '$lib/server/destination.js';

/**
 * Load function for destination dashboard layout.
 * Authentication is handled by hooks.server.js
 * Session is available in event.locals.session
 */
export async function load({ locals, params, platform }) {
	const { userId, email, isFirmlyAdmin } = locals.session;
	const { app_id } = params;

	// Validate destination exists in app_identifiers
	const firmlyConfigs = platform?.env?.firmlyConfigs;
	if (!firmlyConfigs) {
		throw redirect(302, '/');
	}

	const destinationRecord = await firmlyConfigs
		.prepare('SELECT key, info FROM app_identifiers WHERE key = ?')
		.bind(app_id)
		.first();

	if (!destinationRecord) {
		// Destination doesn't exist
		throw redirect(302, '/');
	}

	let destinationInfo = {};
	try {
		destinationInfo = JSON.parse(destinationRecord.info || '{}');
	} catch {
		// Use defaults
	}

	const destinationName = destinationInfo.subject || app_id;

	// Firmly admins have automatic owner access to all destinations
	if (isFirmlyAdmin) {
		const authInfo = locals.authInfo || {};

		// Get all destinations and all merchants for the selector
		const [allDestinationsResult, allMerchantsResult, merchants] = await Promise.all([
			firmlyConfigs.prepare('SELECT key, info FROM app_identifiers ORDER BY key ASC').all(),
			firmlyConfigs.prepare('SELECT key, info FROM stores ORDER BY key ASC').all(),
			getAccessibleMerchants({ platform, appId: app_id })
		]);

		const allDestinations = (allDestinationsResult.results || []).map((r) => {
			let info = {};
			try {
				info = JSON.parse(r.info || '{}');
			} catch {
				// Use defaults
			}
			return {
				appId: r.key,
				displayName: info.subject || r.key,
				role: 'owner',
				grantedAt: null
			};
		});

		const allMerchants = (allMerchantsResult.results || []).map((r) => {
			let info = {};
			try {
				info = JSON.parse(r.info || '{}');
			} catch {
				// Use defaults
			}
			return {
				domain: r.key,
				displayName: info.display_name || r.key,
				role: 'owner',
				grantedAt: null
			};
		});

		return {
			user: {
				id: userId,
				email,
				name: authInfo.name || email.split('@')[0],
				company: 'Firmly',
				title: 'Firmly Admin',
				location: '',
				hasAvatar: false
			},
			appId: app_id,
			destinationName,
			userRole: 'owner',
			isFirmlyAdmin: true,
			destinationAccess: allDestinations,
			merchantAccess: allMerchants,
			pendingInvites: [],
			merchantCount: merchants.length
		};
	}

	// Regular user flow - check destination access
	const destinationAccess = await getDestinationAccess({ platform, userId });
	const currentAccess = destinationAccess.find((a) => a.app_id === app_id);

	if (!currentAccess) {
		// User doesn't have access to this destination
		// Redirect to their primary destination if they have one
		if (destinationAccess.length > 0) {
			const primaryAppId = destinationAccess[0].app_id;
			throw redirect(302, `/destination/${primaryAppId}`);
		}
		// No destination access at all, redirect to home
		throw redirect(302, '/');
	}

	// Get user profile, destination profile, merchant access, and pending invites in parallel
	const [profile, destinationProfile, merchantAccessData, pendingInvites, merchants] =
		await Promise.all([
			getProfile({ platform, userId }),
			getDestinationProfile({ platform, appId: app_id }),
			getMerchantAccess({ platform, userId }),
			getPendingInvites({ platform, userId }),
			getAccessibleMerchants({ platform, appId: app_id })
		]);

	// Normalize destination access data
	const normalizedDestinationAccess = destinationAccess.map((access) => ({
		appId: access.app_id,
		displayName: access.display_name || access.app_id,
		role: access.role,
		grantedAt: access.granted_at
	}));

	// Normalize merchant access data
	const normalizedMerchantAccess = merchantAccessData.map((access) => ({
		domain: access.merchant_domain,
		displayName: access.display_name || access.merchant_domain,
		role: access.role,
		grantedAt: access.granted_at
	}));

	// Get current user's role for this destination
	const userRole = currentAccess.role || 'viewer';

	return {
		user: {
			id: userId,
			email,
			name: profile.name || email.split('@')[0],
			company: destinationProfile.company?.name || destinationName,
			title: profile.title || 'Destination Admin',
			location: profile.location || '',
			hasAvatar: profile.hasAvatar || false
		},
		appId: app_id,
		destinationName,
		userRole,
		isFirmlyAdmin: false,
		destinationAccess: normalizedDestinationAccess,
		merchantAccess: normalizedMerchantAccess,
		pendingInvites,
		merchantCount: merchants.length
	};
}
