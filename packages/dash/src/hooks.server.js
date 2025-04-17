import { redirect } from '@sveltejs/kit';
import { FIRMLY_AUTH_COOKIE } from '$env/static/private';
import { enforceSSOAuth } from '$lib/server/auth.js';
import { dev } from '$app/environment';

export async function handle({ event, resolve }) {
	if (
		event.url.pathname.startsWith('/auth/') ||
		event.url.href === 'http://sveltekit-prerender/[fallback]'
	) {
		return resolve(event);
	}

	const jwt = event.cookies.get(FIRMLY_AUTH_COOKIE);

	try {
		event.locals.authInfo = (await enforceSSOAuth(jwt)).authInfo;
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
