import { redirect } from '@sveltejs/kit';
import { enforceSSOAuth } from '$lib/server/auth.js';
import { dev } from '$app/environment';

export async function handle({ event, resolve }) {
	const { platform } = event;

	if (
		event.url.pathname.startsWith('/auth/') ||
		event.url.href === 'http://sveltekit-prerender/[fallback]'
	) {
		return resolve(event);
	}

	const jwt = event.cookies.get(platform.env.FIRMLY_AUTH_COOKIE);

	try {
		event.locals.authInfo = (
			await enforceSSOAuth(jwt, {
				azureTenantId: platform.env.PUBLIC_AZURE_AD_TENANT_ID,
				azureClientId: platform.env.PUBLIC_AZURE_AD_CLIENT_ID
			})
		).authInfo;

		return resolve(event);
	} catch {
		if (dev) {
			event.locals.authInfo = {
				userId: 'dev-user',
				email: 'dev@firmly.ai',
				name: 'Development User'
			};

			return resolve(event);
		}

		return redirect(302, '/auth/sign-in');
	}
}
