import { redirect } from '@sveltejs/kit';

export async function GET({ url, cookies, platform }) {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');

	cookies.delete('oauth_state', { path: '/' });

	if (!code || !state || state !== storedState) {
		console.error('Authentication failed: State mismatch or missing code/state.');
		throw redirect(302, '/auth/sign-in?error=auth_failed');
	}

	const payload = new URLSearchParams({
		grant_type: 'authorization_code',
		client_id: platform.env.PUBLIC_AZURE_AD_CLIENT_ID,
		scope: 'openid profile email',
		code,
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

		const isSecure = url.hostname !== 'localhost';

		cookies.set(platform.env.FIRMLY_AUTH_COOKIE, userDetails.id_token, {
			path: '/',
			maxAge: 60 * 60 * 8, // 8 hours
			httpOnly: true,
			secure: isSecure,
			sameSite: 'lax'
		});

		throw redirect(302, '/');
	}

	// Unable to Authenticate.
	const errorData = await response.json();
	const errorMessage =
		errorData.error_description || errorData.error || 'Unknown authentication error';
	console.error('Authentication failed:', errorMessage);
	throw redirect(302, '/auth/sign-in?error=auth_failed');
}
