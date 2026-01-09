import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleMetrics } from 'foundation/server/frameworks/sveltekit';
import { enforceSSOAuth } from '$lib/server/auth.js';
import {
	verifyToken,
	decodeToken,
	isTokenExpired,
	isTokenRenewable,
	createSessionToken
} from '$lib/server/jwt.js';
import { validateSession, refreshSession } from '$lib/server/user.js';
import pkg from '../package.json';

/**
 * Security headers applied to all responses.
 */
const SECURITY_HEADERS = {
	'X-Frame-Options': 'DENY',
	'X-Content-Type-Options': 'nosniff',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

/**
 * Centralized authentication hook for all routes.
 *
 * Route categories:
 * - /admin/* (firmly-user-only): Azure AD SSO auth
 * - /auth/* (firmly-user-only): Azure AD auth callbacks (public)
 * - /, /merchant/*, /profile (logged-in): JWT session auth required
 * - /login/*, /signup/* (logged-out): Only for unauthenticated users
 * - /api/* under (logged-out): Public auth APIs
 * - /api/* under (logged-in): Protected APIs
 */
async function handleAuth({ event, resolve }) {
	const { platform, cookies, url } = event;
	const pathname = url.pathname;

	// Helper to resolve with security headers
	const resolveWithHeaders = async (e) => {
		const response = await resolve(e);
		// Add security headers to all responses
		for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
			response.headers.set(key, value);
		}
		return response;
	};

	// Skip auth for prerender fallback
	if (url.href === 'http://sveltekit-prerender/[fallback]') {
		return resolveWithHeaders(event);
	}

	// ============================================
	// ADMIN ROUTES (Azure AD SSO)
	// ============================================
	if (pathname.startsWith('/admin')) {
		return handleAdminAuth(event, resolve, resolveWithHeaders);
	}

	// ============================================
	// AZURE AD AUTH CALLBACKS (public)
	// ============================================
	if (pathname.startsWith('/auth/')) {
		return resolveWithHeaders(event);
	}

	// ============================================
	// PUBLIC AUTH APIs (OTP, magic-link, invites)
	// These are under (logged-out) group but accessible to all
	// ============================================
	if (
		pathname.startsWith('/api/otp/') ||
		pathname.startsWith('/api/magic-link/') ||
		pathname.startsWith('/api/login/otp/') ||
		pathname.startsWith('/api/invite/')
	) {
		return resolveWithHeaders(event);
	}

	// ============================================
	// INVITE ACCEPTANCE ROUTES (public)
	// Users clicking invite links need access without auth
	// ============================================
	if (pathname.startsWith('/invite')) {
		return resolveWithHeaders(event);
	}

	// ============================================
	// Check for Firmly admin (Azure AD) FIRST - takes precedence
	// This enables hybrid auth: admins can access merchant dashboards
	// ============================================
	const firmlyAuthCookie = cookies.get(platform?.env?.FIRMLY_AUTH_COOKIE);
	let userSession = null;

	if (firmlyAuthCookie) {
		try {
			const { authInfo } = await enforceSSOAuth(firmlyAuthCookie, {
				azureTenantId: platform?.env?.PUBLIC_AZURE_AD_TENANT_ID,
				azureClientId: platform?.env?.PUBLIC_AZURE_AD_CLIENT_ID
			});

			// Create synthetic session for Firmly admin
			event.locals.authInfo = authInfo;
			userSession = {
				userId: authInfo.oid || authInfo.sub,
				email: authInfo.email || authInfo.preferred_username,
				sessionId: null,
				isFirmlyAdmin: true
			};
		} catch {
			// Azure AD auth failed, fall through to JWT session
		}
	}

	// ============================================
	// Fall back to JWT session for user auth routes
	// ============================================
	if (!userSession) {
		const sessionToken = cookies.get('session');
		const jwtSecret = platform?.env?.JWT_SECRET;

		if (sessionToken && jwtSecret) {
			userSession = await validateUserSession(event, sessionToken, jwtSecret);
		}
	}

	// Store session in locals for use in load functions
	event.locals.session = userSession;

	// ============================================
	// PROTECTED USER ROUTES (/, /merchant/*, /destination/*, /profile, /api/auth/*, /api/profile, /api/sessions)
	// ============================================
	if (
		pathname === '/' ||
		pathname.startsWith('/merchant/') ||
		pathname.startsWith('/destination/') ||
		pathname.startsWith('/profile') ||
		pathname.startsWith('/api/auth/') ||
		pathname.startsWith('/api/profile') ||
		pathname.startsWith('/api/sessions')
	) {
		if (!userSession) {
			// Clear invalid cookie if present
			if (cookies.get('session')) {
				cookies.delete('session', { path: '/' });
			}
			redirect(302, '/login');
		}
		return resolveWithHeaders(event);
	}

	// ============================================
	// LOGGED-OUT ONLY ROUTES (/login/*, /signup/*)
	// Redirect authenticated users to dashboard selection
	// ============================================
	if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
		if (userSession) {
			// Redirect to dashboard selection (smart redirect happens in page server)
			redirect(302, '/');
		}
		return resolveWithHeaders(event);
	}

	// All other routes - pass through
	return resolveWithHeaders(event);
}

/**
 * Handle Azure AD SSO authentication for admin routes.
 */
async function handleAdminAuth(event, resolve, resolveWithHeaders) {
	const { platform, cookies } = event;

	const jwt = cookies.get(platform?.env?.FIRMLY_AUTH_COOKIE);

	if (!jwt) {
		return redirect(302, '/auth/sign-in');
	}

	try {
		event.locals.authInfo = (
			await enforceSSOAuth(jwt, {
				azureTenantId: platform?.env?.PUBLIC_AZURE_AD_TENANT_ID,
				azureClientId: platform?.env?.PUBLIC_AZURE_AD_CLIENT_ID
			})
		).authInfo;

		return resolveWithHeaders(event);
	} catch {
		redirect(302, '/auth/sign-in');
	}
}

/**
 * Validate and optionally renew the user's JWT session.
 * Returns session info if valid, null otherwise.
 */
async function validateUserSession(event, sessionToken, jwtSecret) {
	const { platform, cookies } = event;

	// Try to verify the token
	let payload = await verifyToken(sessionToken, jwtSecret);
	let needsRenewal = false;

	if (!payload) {
		// Token verification failed - check if it's renewable
		const decoded = decodeToken(sessionToken);

		if (!decoded) {
			return null;
		}

		const expired = isTokenExpired(decoded);
		const renewable = isTokenRenewable(decoded);

		if (!expired) {
			// Token not expired but verification failed - invalid signature
			return null;
		}

		if (expired && !renewable) {
			// Token too old to renew
			return null;
		}

		// Token is expired but renewable
		payload = decoded;
		needsRenewal = true;
	}

	const { sub: userId, email, jti: sessionId } = payload;

	// Validate session exists in DashUserDO
	const session = await validateSession({ platform, userId, sessionId });
	if (!session) {
		return null;
	}

	// Refresh session last access time
	await refreshSession({ platform, userId, sessionId });

	// Renew JWT if needed
	if (needsRenewal) {
		const newToken = await createSessionToken({ userId, email, sessionId }, jwtSecret);
		cookies.set('session', newToken, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 // 7 days - matches renewal window
		});
	}

	return { userId, email, sessionId };
}

export const handle = sequence(
	(event) =>
		handleMetrics(event, {
			serviceName: pkg.name,
			version: pkg.version
		}),
	handleAuth
);
