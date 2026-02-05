export async function load({ platform, url, cookies }) {
	const state = crypto.randomUUID();

	const isSecure = url.hostname !== 'localhost';

	cookies.set('oauth_state', state, {
		path: '/',
		maxAge: 60 * 10,
		httpOnly: true,
		secure: isSecure,
		sameSite: 'lax'
	});

	return {
		azureAdClientId: platform.env.PUBLIC_AZURE_AD_CLIENT_ID,
		azureAdTenantId: platform.env.PUBLIC_AZURE_AD_TENANT_ID,
		azureAdRedirectUrl: platform.env.PUBLIC_AZURE_REDIRECT_URL,
		state,
		error: url.searchParams.get('error')
	};
}
