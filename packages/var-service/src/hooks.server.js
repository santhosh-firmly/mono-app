import { redirect } from '@sveltejs/kit';
import { enforceSSOAuth } from '$lib/server/ms-auth.js';

export async function handle({ event, resolve }) {
	const { platform } = event;

	// Validate required environment variables
	const requiredEnvVars = [
		'FIRMLY_AUTH_COOKIE',
		'PUBLIC_AZURE_AD_TENANT_ID',
		'PUBLIC_AZURE_AD_CLIENT_ID'
	];

	for (const envVar of requiredEnvVars) {
		if (!platform.env[envVar]) {
			console.error(`Missing required environment variable: ${envVar}`);
			return new Response('Server configuration error', { status: 500 });
		}
	}

	if (event.url.pathname.startsWith('/auth/')) {
		return resolve(event);
	}

	const jwt = event.cookies.get(platform.env.FIRMLY_AUTH_COOKIE);

	try {
		const { authInfo } = await enforceSSOAuth(jwt, {
			azureTenantId: platform.env.PUBLIC_AZURE_AD_TENANT_ID,
			azureClientId: platform.env.PUBLIC_AZURE_AD_CLIENT_ID
		});

		event.locals.auth = {
			name: authInfo.name,
			email: authInfo.email,
			jwt
		};

		return resolve(event);
	} catch (error) {
		console.error('Authentication error in handle hook:', error);
		return redirect(302, '/auth/sign-in');
	}
}
