import { redirect } from '@sveltejs/kit';
import { FIRMLY_AUTH_COOKIE } from '$env/static/private';
import { enforceSSOAuth } from '$lib/server/auth.js';

export async function handle({ event, resolve }) {
    // if (event.url.pathname.startsWith('/auth/') || event.url.href === 'http://sveltekit-prerender/[fallback]') {
    //     return resolve(event);
    // }

    // const jwt = event.cookies.get(FIRMLY_AUTH_COOKIE);

    // try {
    //     event.locals.authInfo = (await enforceSSOAuth(jwt)).authInfo;
        return resolve(event);
    //     // eslint-disable-next-line no-unused-vars
    // } catch (e) {
    //     return redirect(302, '/auth/sign-in');
    // }
}
