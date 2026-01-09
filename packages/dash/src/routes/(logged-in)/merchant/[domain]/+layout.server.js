import { redirect } from '@sveltejs/kit';
import { getProfile, getMerchantAccess, getPendingInvites } from '$lib/server/user.js';
import {
	getMerchantAgreement,
	checkDestinationsConfigured,
	checkIntegrationComplete,
	checkCatalogConfigured,
	checkCDNWhitelistingComplete
} from '$lib/server/merchant.js';

/**
 * Load function for merchant dashboard layout.
 * Authentication is handled by hooks.server.js
 * Session is available in event.locals.session
 */
export async function load({ locals, params, platform }) {
	const { userId, email, isFirmlyAdmin } = locals.session;

	// Firmly admins have automatic owner access to all merchants
	if (isFirmlyAdmin) {
		const authInfo = locals.authInfo || {};
		const configDb = platform?.env?.firmlyConfigs;

		// Get all merchants for the selector and merchant-specific data in parallel
		const [
			allMerchantsResult,
			agreementData,
			destinationsConfigured,
			catalogConfigured,
			cdnWhitelistingComplete,
			integrationComplete
		] = await Promise.all([
			configDb
				? configDb.prepare('SELECT key, info FROM stores ORDER BY key ASC').all()
				: { results: [] },
			getMerchantAgreement({ platform, merchantDomain: params.domain }),
			checkDestinationsConfigured({ platform, merchantDomain: params.domain }),
			checkCatalogConfigured({ platform, merchantDomain: params.domain }),
			checkCDNWhitelistingComplete({ platform, merchantDomain: params.domain }),
			checkIntegrationComplete({ platform, merchantDomain: params.domain })
		]);

		// Build merchant access list for the selector
		const allMerchants = (allMerchantsResult.results || []).map((r) => {
			const storeInfo = JSON.parse(r.info || '{}');
			return {
				domain: r.key,
				displayName: storeInfo.display_name || r.key,
				role: 'owner',
				grantedAt: null
			};
		});

		const onboardingProgress = {
			integration: integrationComplete ? 'completed' : 'in-progress',
			agreement: agreementData.signed ? 'completed' : 'pending',
			destinations: destinationsConfigured ? 'completed' : 'pending',
			catalog: catalogConfigured ? 'completed' : 'pending',
			cdn: cdnWhitelistingComplete ? 'completed' : 'pending'
		};

		const isOnboarding = Object.values(onboardingProgress).some(
			(status) => status !== 'completed'
		);

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
			domain: params.domain,
			userRole: 'owner',
			isFirmlyAdmin: true,
			merchantAccess: allMerchants, // All merchants for the selector
			pendingInvites: [], // Admins don't receive invites
			isOnboarding,
			onboardingProgress
		};
	}

	// Regular user flow - check merchant access
	const merchantAccess = await getMerchantAccess({ platform, userId });
	const currentMerchantAccess = merchantAccess.find((a) => a.merchant_domain === params.domain);

	if (!currentMerchantAccess) {
		// User doesn't have access to this merchant
		// Redirect to their primary merchant if they have one
		if (merchantAccess.length > 0) {
			const primaryDomain = merchantAccess[0].merchant_domain;
			redirect(302, `/merchant/${primaryDomain}`);
		}
		// No merchant access at all, redirect to home
		redirect(302, '/');
	}

	// Get user profile, agreement status, destinations config, catalog config, CDN status, integration status, and pending invites in parallel
	const [
		profile,
		agreementData,
		destinationsConfigured,
		catalogConfigured,
		cdnWhitelistingComplete,
		integrationComplete,
		pendingInvites
	] = await Promise.all([
		getProfile({ platform, userId }),
		getMerchantAgreement({ platform, merchantDomain: params.domain }),
		checkDestinationsConfigured({ platform, merchantDomain: params.domain }),
		checkCatalogConfigured({ platform, merchantDomain: params.domain }),
		checkCDNWhitelistingComplete({ platform, merchantDomain: params.domain }),
		checkIntegrationComplete({ platform, merchantDomain: params.domain }),
		getPendingInvites({ platform, userId })
	]);

	// Normalize merchant access data
	const normalizedMerchantAccess = merchantAccess.map((access) => ({
		domain: access.merchant_domain,
		role: access.role,
		grantedAt: access.granted_at
	}));

	// Get current user's role for this merchant
	const userRole = currentMerchantAccess.role || 'viewer';

	// Determine onboarding progress
	const onboardingProgress = {
		integration: integrationComplete ? 'completed' : 'in-progress',
		agreement: agreementData.signed ? 'completed' : 'pending',
		destinations: destinationsConfigured ? 'completed' : 'pending',
		catalog: catalogConfigured ? 'completed' : 'pending',
		cdn: cdnWhitelistingComplete ? 'completed' : 'pending'
	};

	// Check if all onboarding tasks are completed
	const isOnboarding = Object.values(onboardingProgress).some((status) => status !== 'completed');

	// Return user data and onboarding status
	return {
		user: {
			id: userId,
			email,
			name: profile.name || email.split('@')[0],
			company: profile.company || params.domain,
			title: profile.title || 'Merchant Admin',
			location: profile.location || '',
			hasAvatar: profile.hasAvatar || false
		},
		domain: params.domain,
		userRole,
		isFirmlyAdmin: false,
		merchantAccess: normalizedMerchantAccess,
		pendingInvites,
		isOnboarding,
		onboardingProgress
	};
}
