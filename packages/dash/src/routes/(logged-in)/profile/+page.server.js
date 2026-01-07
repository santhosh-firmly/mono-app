import { getProfile } from '$lib/server/user.js';

/**
 * Load function for profile page.
 * Authentication is handled by hooks.server.js
 * Session is available in event.locals.session
 */
export async function load({ locals, platform }) {
	const { userId, email } = locals.session;

	// Get user profile from DashUserDO
	const profile = await getProfile({ platform, userId });

	// Get domain for back link
	const emailDomain = email?.split('@')[1];

	return {
		user: {
			id: userId,
			email,
			name: profile.name || email.split('@')[0],
			company: profile.company || emailDomain,
			title: profile.title || '',
			location: profile.location || '',
			hasAvatar: profile.hasAvatar || false
		},
		domain: emailDomain
	};
}
