import { redirect } from '@sveltejs/kit';
import { enforceSSOAuth } from '$lib/server/auth.js';
import { createAdminToken } from '$lib/server/jwt.js';

export async function GET({ url, cookies, platform }) {
	const payload = new URLSearchParams({
		grant_type: 'authorization_code',
		client_id: platform.env.PUBLIC_AZURE_AD_CLIENT_ID,
		scope: 'openid profile email offline_access',
		code: url.searchParams.get('code'),
		redirect_uri: platform.env.PUBLIC_AZURE_REDIRECT_URL,
		client_secret: platform.env.AZURE_AD_CLIENT_SECRET
	});

	const response = await fetch(
		`https://login.microsoftonline.com/${platform.env.PUBLIC_AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
		{
			method: 'POST',
			body: payload,
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		}
	);

	if (!response.ok) {
		return new Response('Not able to auth user', { status: 500 });
	}

	const tokenData = await response.json();

	// Verify the id_token from Microsoft via JWKS validation
	const { authInfo } = await enforceSSOAuth(tokenData.id_token, {
		azureTenantId: platform.env.PUBLIC_AZURE_AD_TENANT_ID,
		azureClientId: platform.env.PUBLIC_AZURE_AD_CLIENT_ID
	});

	// Create compact custom JWT with only the claims we need
	const adminJwt = await createAdminToken(
		{
			email: authInfo.email || authInfo.preferred_username,
			name: authInfo.name,
			oid: authInfo.oid,
			preferred_username: authInfo.preferred_username
		},
		platform.env.JWT_SECRET
	);

	const cookieOptions = {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 // 7 days
	};

	// Set compact admin JWT cookie
	cookies.set(platform.env.FIRMLY_AUTH_COOKIE, adminJwt, cookieOptions);

	// Set refresh token cookie (if Microsoft returned one)
	if (tokenData.refresh_token) {
		cookies.set('fuser_refresh', tokenData.refresh_token, cookieOptions);
	}

	throw redirect(302, '/admin');
}
