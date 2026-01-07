import { getPreferences } from '$lib/server/user.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, platform }) {
	// Only load preferences if user has a session
	const session = locals.session;

	if (!session?.userId) {
		return {
			preferences: { theme: 'system' }
		};
	}

	// For Firmly admins (Azure AD), use system theme by default
	// since they don't have preferences stored in DashUserDO
	if (session.isFirmlyAdmin) {
		return {
			preferences: { theme: 'system' }
		};
	}

	// Load user preferences from DashUserDO
	const preferences = await getPreferences({ platform, userId: session.userId });

	return {
		preferences: {
			theme: preferences.theme || 'system',
			...preferences
		}
	};
}
