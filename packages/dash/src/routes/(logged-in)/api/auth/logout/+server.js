import { redirect } from '@sveltejs/kit';
import { decodeToken } from '$lib/server/jwt.js';
import { terminateSession } from '$lib/server/user.js';

/**
 * GET /api/auth/logout
 * Clear session and redirect to login page.
 */
export async function GET({ cookies, platform }) {
	const sessionToken = cookies.get('session');

	// Terminate session in user's Durable Object
	if (sessionToken) {
		try {
			const payload = decodeToken(sessionToken);
			if (payload && payload.sub && payload.jti) {
				await terminateSession({
					platform,
					userId: payload.sub,
					sessionId: payload.jti
				});
			}
		} catch (error) {
			console.error('Error terminating session:', error);
		}
	}

	// Clear session cookie
	cookies.delete('session', { path: '/' });

	// Clear Firmly admin (Azure AD) cookie if present
	const adminCookieName = platform?.env?.FIRMLY_AUTH_COOKIE;
	if (adminCookieName) {
		cookies.delete(adminCookieName, { path: '/' });
	}

	// Redirect to login page
	redirect(302, '/');
}
