import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies, platform }) {
	const payload = new URLSearchParams({
		grant_type: 'authorization_code',
		client_id: platform.env.PUBLIC_AZURE_AD_CLIENT_ID,
		scope: 'openid profile email',
		code: url.searchParams.get('code'),
		redirect_uri: platform.env.PUBLIC_AZURE_REDIRECT_URL,
		client_secret: platform.env.AZURE_AD_CLIENT_SECRET
	});

	const response = await fetch(
		'https://login.microsoftonline.com/' +
			platform.env.PUBLIC_AZURE_AD_TENANT_ID +
			'/oauth2/v2.0/token',
		{
			method: 'POST',
			body: payload,
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			}
		}
	);

	if (response.ok) {
		const userDetails = await response.json();

		cookies.set(platform.env.FIRMLY_AUTH_COOKIE, userDetails.id_token, {
			path: '/',
			maxAge: userDetails.expires_in,
			httpOnly: true,
			secure: true,
			sameSite: 'lax'
		});

		throw redirect(302, '/');
	}

	// Unable to Authenticate.
	throw redirect(302, '/auth/sign-in?error=auth_failed');
}
